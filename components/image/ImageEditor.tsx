/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactCompareImage from 'react-compare-image';
import { generateTexture } from '../../actions/texture';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import * as Dialog from "@radix-ui/react-dialog";
import ImageUploader from '../home/Uploader';
import { getDictionary } from "@/lib/i18n";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import GoogleAdBanner from '../GoogleAdBanner';


const presetStyles = [
  { name: 'Style 1', src: '/images/styles/style1.png' },
  { name: 'Style 2', src: '/images/styles/style2.png' },
  { name: 'Style 3', src: '/images/styles/style3.png' },
  { name: 'Style 4', src: '/images/styles/style4.png' },
  { name: 'Style 5', src: '/images/styles/style5.png' },
  { name: 'Style 6', src: '/images/styles/style6.png' },
  // { name: 'Style 7', src: '/images/styles/style7.jpg' },
  // { name: 'Style 8', src: '/images/styles/style8.jpg' },
];

interface ImageEditorProps {
  imageUrl: string;
  id: string;
  status: string;
  langName: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, id, langName, status }) => {
  const [beforeImage, setBeforeImage] = useState<string>(imageUrl);
  const [afterImage, setAfterImage] = useState<string>('');
  const [opacity, setOpacity] = useState<number>(20);
  const [textureStrength, setTextureStrength] = useState<number>(0.5);
  const [textureImage, setTextureImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(presetStyles[0].src);
  const [customStyle, setCustomStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const url = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();
  const [dict, setDict] = useState<any>({});
  const [uploaderLocale, setUploaderLocale] = useState<any>({});
  const [pictureStatus, setPictureStatus] = useState<string>(status);
  const [shareLink, setShareLink] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [needSignIn, setNeedSignIn] = useState<boolean>(false);
  const { user } = useUser();
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [isShowingAd, setIsShowingAd] = useState<boolean>(false);
  const [userCredits, setUserCredits] = useState<number>(0);


  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(langName);
      setDict(dictionary.ImageEditor);
      setUploaderLocale(dictionary.UploadNewPicture);
    };
    loadDictionary();
  }, [langName]);

  // Add file size limit constant
  const MAX_FILE_SIZE_ANONYMOUS = 1 * 1024 * 1024; // 1MB in bytes
  const MAX_FILE_SIZE_SIGNED_IN = 5 * 1024 * 1024; // 5MB in bytes

  // Add constant
  const MAX_PREVIEW_WIDTH = 640;

  // Handle image upload
  const handleImageUpload = (uploadedImageUrl: string) => {
    fetch(uploadedImageUrl)
      .then(response => response.blob())
      .then(blob => {
        const fileSize = blob.size;
        const isSignedIn = document.querySelector('[data-signed-in="true"]') !== null;
        
        if (!isSignedIn && fileSize > MAX_FILE_SIZE_ANONYMOUS) {
          toast.error(dict.fileSizeError || 'Anonymous users only support uploading images of up to 1MB, please log in to use the full features');
          // 触发登录 modal
          const signUpButton = document.querySelector('[data-clerk-sign-up-button]') as HTMLElement;
          if (signUpButton) {
            signUpButton.click();
          }
          return;
        }
        setBeforeImage(uploadedImageUrl);
      })
      .catch(error => {
        console.error('Error checking file size:', error);
        toast.error(dict.fileCheckError || 'File check failed, please try again');
      });
  };

  async function handleDownload(afterImage: string) {
    setIsDialogOpen(true);
    
    try {
      // 获取用户积分信息
      const creditsResponse = await fetch('/api/credits/balance');
      if (creditsResponse.ok) {
        const { credits } = await creditsResponse.json();
        setUserCredits(credits);
      }

      // 获取图片状态
      const statusResponse = await fetch(`/api/picture/${id}`);
      if (!statusResponse.ok) {
        throw new Error(dict.fetchPictureStatusError || 'Failed to fetch picture status');
      }
      const pictureData = await statusResponse.json();
      setPictureStatus(pictureData.status);
    } catch (error) {
      console.error(dict.error || 'Error:', error);
      toast.error(dict.fetchStatusError || 'Failed to fetch status');
    }
  }

  async function handleCreditsDownload() {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pictureId: id, processType: 'texture' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(dict.creditsDeductedSuccess || 'Credits deducted successfully');
        setPictureStatus('PAID');
        downloadImage(afterImage);
        setIsDialogOpen(false);
      } else {
        toast.error(dict.insufficientCredits || 'Insufficient credits');
      }
    } catch (error) {
      console.error(dict.error || 'Error:', error);
      toast.error(dict.creditsDeductionFailed || 'Failed to deduct credits');
    }
  }

  function downloadImage(imageUrl: string) {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        updateAfterImage(img, textureImage, opacity, false);
      };
      img.crossOrigin = 'anonymous';
      img.src = beforeImage;
    }
  }

  async function handleOneTimePayment() {
    setIsDialogOpen(false);
    await payForOnce();
  }

  function handleRechargeCredits() {
    setIsDialogOpen(false);
    router.push("/workbench/orders");
  }

  async function payForOnce() {
    const result = await fetch(`/api/checkout`, {
      method: 'POST',
      body: `{"callbackUrl": "${url}","pictureId": "${id}","paymentType": "oneTime"}`,
    });
    if (result.status === 200) {
      const stripe = await stripePromise;
      const session = await result.json();
      console.log(session)
      router.push(session.session.url);
    } else {
      toast(dict.stepTwo.payForOnce.failed || 'Failed to pay');
    }
  }

  const generateTextureImage = useCallback(async (contentSrc: string, styleSrc: string) => {
    setIsLoading(true);
    setTimer(0);
    
    // Start timer
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 0.1);
    }, 100);
    
    try {
      // Use fixed parameters for testing
      const contentImg = new Image();
      const styleImg = new Image();

      console.log('imageUrl: ', imageUrl);
      let contentImgSrc = imageUrl;
      let styleImgSrc = styleSrc;
      console.log('beforeImage: ', contentImgSrc);
      console.log('selectedStyle: ', styleImgSrc);
      contentImg.src = contentImgSrc;
      contentImg.crossOrigin = 'anonymous';
      styleImg.src = styleImgSrc;

      await Promise.all([
        new Promise(resolve => contentImg.onload = resolve),
        new Promise(resolve => styleImg.onload = resolve)
      ]);

      const textureDataUrl = await generateTexture(contentImg, styleImg, textureStrength);
      setTextureImage(textureDataUrl);
      updateAfterImage(contentImg, textureDataUrl, opacity);
    } catch (error) {
      console.error('Error generating texture image:', error);
    } finally {
      clearInterval(timerInterval);
      setIsLoading(false);
      setTimer(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureStrength]);

  const updateAfterImage = useCallback((baseImg: HTMLImageElement, overlayImageSrc: string, opacityValue: number, addWatermark: boolean = true) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    
    ctx?.drawImage(baseImg, 0, 0);
    
    const overlayImg = new Image();
    overlayImg.crossOrigin = 'anonymous';
    overlayImg.onload = () => {
      const mappedOpacity = (opacityValue / 100) * 0.5;
      ctx!.globalAlpha = mappedOpacity;
      ctx!.globalCompositeOperation = 'overlay';
      ctx?.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
      ctx!.globalCompositeOperation = 'source-over';
      
      // 只在预览时添加水印
      if (addWatermark) {
        ctx!.globalAlpha = 0.7; // 增加透明度使水印更清晰
        ctx!.font = `${Math.max(canvas.width * 0.03, 16)}px Arial`; // 稍微调小字体
        ctx!.fillStyle = '#ffffff';
        ctx!.textAlign = 'right'; 
        ctx!.textBaseline = 'bottom';
        
        const watermarkText = 'Protected by AiDisturbance.Online';
        const padding = 20; // 与边缘的间距
        
        // 在右下角添加水印
        ctx!.fillText(
          watermarkText,
          canvas.width - padding,
          canvas.height - padding
        );
      }
      
      ctx!.globalAlpha = 1;
      
      try {
        if (addWatermark) {
          setAfterImage(canvas.toDataURL('image/png'));
        } else {
          // 下载无水印版本
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'processed.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Error exporting canvas:', error);
      }
    };
    overlayImg.src = overlayImageSrc;
  }, []);
  

  useEffect(() => {
    if (beforeImage) {
      generateTextureImage(beforeImage, selectedStyle);
    }
  }, [beforeImage, selectedStyle, generateTextureImage, textureStrength]);

    
  // Use version with watermark in preview
  useEffect(() => {
    if (beforeImage && textureImage) {
      const img = new Image();
      img.onload = () => {
        updateAfterImage(img, textureImage, opacity, true);
      };
      img.crossOrigin = 'anonymous';
      img.src = beforeImage;
    }
  }, [beforeImage, textureImage, opacity, updateAfterImage]);


  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpacity(Number(event.target.value));
  };

  const handleTextureStrengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextureStrength(Number(event.target.value));
  };

  const handleStyleSelect = (styleSrc: string) => {
    setSelectedStyle(styleSrc);
  };

  const handleCustomStyleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomStyle(result);
        setSelectedStyle(result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleGenerateShareLink() {
    try {
      const response = await fetch('/api/share', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setShareLink(result.shareLink);
        toast.success(dict.shareLinkGenerated || 'Share link generated successfully');
      } else {
        toast.error(dict.shareLinkGenerationFailed || 'Failed to generate share link');
      }
    } catch (error) {
      console.error(dict.error || 'Error:', error);
      toast.error(dict.shareLinkGenerationFailed || 'Failed to generate share link');
    }
  }

  const handleFreeDownload = () => {
    setIsShowingAd(true);
    setAdCountdown(30);
    
    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  function downloadWatermarkedImage(imageUrl: string) {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算新的尺寸
        let newWidth = img.width;
        let newHeight = img.height;
        
        // 如果图片宽度超过640px，进行等比例缩放
        if (img.width > MAX_PREVIEW_WIDTH) {
          const ratio = MAX_PREVIEW_WIDTH / img.width;
          newWidth = MAX_PREVIEW_WIDTH;
          newHeight = img.height * ratio;
        }
        
        // 设置画布尺寸
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 绘制图片 - 使用原始图片而不是带水印的预览图
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 添加水印
        ctx!.globalAlpha = 0.7;
        ctx!.font = `${Math.max(newWidth * 0.03, 16)}px Arial`;
        ctx!.fillStyle = '#ffffff';
        ctx!.textAlign = 'right'; 
        ctx!.textBaseline = 'bottom';
        
        const watermarkText = 'Protected by AiDisturbance.Online';
        const padding = 20;
        
        ctx!.fillText(
          watermarkText,
          newWidth - padding,
          newHeight - padding
        );
        
        // 导出图片
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'preview-watermarked.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      // 使用原始图片而不是带水印的预览图
      img.src = beforeImage; // 改用 beforeImage 而不是 afterImage
    }
  }

  return (
    <div className="w-full md:w-[60%] mx-auto">
      <div className="flex justify-between">
        <div className="w-[65%] border border-gray-200 rounded-lg p-4 shadow-sm overflow-y-auto space-y-4 flex flex-col justify-between relative" style={{ minHeight: '500px' }}>
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 flex flex-col justify-center items-center z-50">
              <div className="loader"></div>
              <p className="text-sm">Generating texture... ({timer.toFixed(1)}s / ~60s)</p>
              <p className="text-xs text-gray-500 mt-1">Please wait while we process your image</p>
            </div>
          )}
          <div className="flex-grow flex items-center justify-center relative">
            {!beforeImage ? (
              <>
                <ImageUploader id={id} locale={uploaderLocale} langName={langName}/>
                
              </>
            ) : (
              beforeImage && afterImage && (
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <ReactCompareImage
                    leftImage={beforeImage}
                    rightImage={afterImage}
                    sliderPositionPercentage={0.5}
                    handle={<div className="custom-handle" />}
                  />
                </div>
              )
            )}
          </div>
          <div className="mt-3">
            <div className="flex justify-between mb-2">
              <div className="w-[48%]">
                <label htmlFor="texture-strength-slider" className="text-sm">{dict.adjustTextureStrength}</label>
                <input
                  id="texture-strength-slider"
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={textureStrength}
                  onChange={handleTextureStrengthChange}
                  className="w-full"
                  disabled={!beforeImage}
                />
                <span className="text-sm">{textureStrength.toFixed(1)}</span>
              </div>
              <div className="w-[48%]">
                <label htmlFor="opacity-slider" className="text-sm">{dict.adjustBlendStrength}</label>
                <input
                  id="opacity-slider"
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={opacity}
                  onChange={handleOpacityChange}
                  className="w-full"
                  disabled={!beforeImage}
                />
                <span className="text-sm">{opacity}%</span>
              </div>
            </div>
            
            {!beforeImage ? (
              <Button
                color={'primary'}
                variant='default'
                rel="noopener noreferrer nofollow"
                disabled
              >
                {dict.beforeDownloadAdjustedImage}
              </Button>
            ) : (
              <div className="flex justify-between gap-2">
                <div>
                  <SignedOut>
                    <SignUpButton mode="modal" signInForceRedirectUrl={url}>
                      <Button
                        color={'primary'}
                        variant='default'
                        rel="noopener noreferrer nofollow"
                      >
                        {dict.downloadAdjustedImage}
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex gap-2">
                      <Button
                        color={'primary'}
                        variant='default'
                        rel="noopener noreferrer nofollow"
                        onClick={() => handleDownload(afterImage)}
                      >
                        {dict.downloadImage}
                      </Button>
                      
                    </div>
                  </SignedIn>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-[40%] border border-gray-200 rounded-lg p-4 shadow-sm overflow-y-auto space-y-4">
          <h3 className="mt-0 text-lg font-semibold">{dict.selectStyle}</h3>
          <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
            {presetStyles.map((style, index) => (
              <img 
                key={index}
                src={style.src}
                alt={style.name}
                className={`w-full h-32 object-cover cursor-pointer rounded transition-all duration-300 ${
                selectedStyle === style.src ? 'border-2 border-purple-500' : 'border border-gray-300'
                }`}
                onClick={() => handleStyleSelect(style.src)}
              />
            ))}
          </div>
          <div className="mt-5">
            <h4 className="mb-2 text-sm font-medium">{dict.uploadCustomStyle}</h4>
            <label
              htmlFor="custom-style-upload"
              className="inline-block px-3 py-2 bg-purple-500 text-white rounded cursor-pointer text-sm hover:bg-purple-600 transition-colors duration-300"
            >
              {dict.chooseFile}
            </label>
            <input 
              id="custom-style-upload"
              type="file" 
              accept="image/*" 
              onChange={handleCustomStyleUpload} 
              className="hidden"
            />
          </div>
          {customStyle && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">{dict.customStylePreview}</h4>
              <img 
                src={customStyle} 
                alt="Custom Style" 
                className={`w-full h-32 object-cover rounded cursor-pointer ${
                  selectedStyle === customStyle ? 'border-2 border-purple-500' : 'border border-gray-300'
                }`}
                onClick={() => handleStyleSelect(customStyle)}
              />
            </div>
          )}
        </div>
      </div>
      
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {isShowingAd ? (
              <div className="space-y-4">
                <Dialog.Title className="text-lg font-bold mb-4 text-purple-600">
                  {dict.watchingAd || 'Ad is being displayed'}
                </Dialog.Title>
                <div className="min-h-[250px] flex flex-col items-center justify-center">
                  <GoogleAdBanner 
                    dataAdSlot={process.env.GOOGLE_ADSENSE_ID || ''} 
                    dataAdFormat="auto" 
                    dataFullWidthResponsive={true} 
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      {dict.downloadStartsIn || 'Download will start in'} {adCountdown} {dict.seconds || 'seconds'}
                    </p>
                    {adCountdown === 0 && (
                      <Button
                        onClick={() => downloadWatermarkedImage(afterImage)}
                        className="mt-2"
                        variant="default"
                      >
                        {dict.downloadNow || 'Download now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Dialog.Title className="text-lg font-bold mb-4 text-purple-600">
                  {dict.downloadOptions || 'Download options'}
                </Dialog.Title>
                
                <div className="space-y-4">
                  {userCredits >= 10 ? (
                    <Button
                      onClick={handleCreditsDownload}
                      className="w-full"
                      variant="default"
                    >
                      {dict.useCredits || 'Use credits to download watermark-free version'} (10 {dict.credits || 'credits'})
                      <span className="ml-2 text-sm text-gray-400">
                        ({dict.yourCredits || 'Your credits'}: {userCredits})
                      </span>
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-lg font-bold text-purple-600">
                          {dict.unlockPremiumFeatures || 'Unlock premium features'}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-gray-700">
                              {dict.benefit1 || 'Immediately get the right to download this image unlimited times, anytime, any number of times'}
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-gray-700">
                              {dict.benefit2 || 'Can adjust the image effect anytime, find the perfect artistic effect'}
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-gray-700">
                              {dict.benefit3 || 'Immediately get the original size, high-quality watermark-free version'}
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-gray-700">
                              {dict.benefit4 || 'Only the price of a cup of water, to permanently protect your artistic work'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg mt-4 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-purple-600">$2</span>
                            <span className="text-sm text-gray-500">{dict.oneTimePayment || 'One-time payment'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {dict.instantAccess || 'Immediately get access'}
                          </div>
                        </div>

                        <Button
                          onClick={handleOneTimePayment}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                          variant="default"
                        >
                          {dict.unlockNow || 'Unlock now'} 🚀
                        </Button>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {dict.securePayment || 'Secure payment guarantee'}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className="w-full text-gray-500 text-sm flex items-center justify-center gap-2 hover:text-gray-700"
                      >
                        {showMoreOptions ? (dict.hideOptions || 'Hide other options') : (dict.showMoreOptions || 'View other options')}
                        <svg
                          className={`w-4 h-4 transform transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {showMoreOptions && (
                    <div className="space-y-4 pt-4 border-t">
                      <Button
                        onClick={handleGenerateShareLink}
                        className="w-full"
                        variant="outline"
                      >
                        {dict.shareToGetCredits || 'Share to get credits'} (+10 {dict.credits || 'credits'})
                      </Button>
                      
                      <Button
                        onClick={handleFreeDownload}
                        className="w-full text-sm whitespace-normal h-auto py-2"
                        variant="secondary"
                      >
                        {dict.watchAdToDownload || 'Watch 30-second ad to download watermarked version (this time free)'}
                      </Button>
                      
                      {userCredits < 10 && (
                        <Button
                          onClick={handleRechargeCredits}
                          className="w-full"
                          variant="outline"
                        >
                          {dict.rechargeCredits || 'Recharge credits'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {shareLink && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">{dict.shareLinkGenerated || 'Share link generated'}</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={shareLink} 
                        readOnly 
                        className="flex-1 p-2 border rounded bg-white text-sm"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          toast.success(dict.linkCopied || 'Link copied');
                        }}
                        variant="outline"
                        className="shrink-0"
                      >
                        {dict.copy || 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <Dialog.Close asChild>
              <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsShowingAd(false);
                  setShowMoreOptions(false);
                }}
              >
                {dict.close || 'Close'}
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
    </div>
  );
};

export default ImageEditor;
