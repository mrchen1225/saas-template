"use client";

import { useDropzone } from 'react-dropzone';
import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RocketIcon, ArrowRight } from 'lucide-react';
import { PictureStatus } from '@/prisma/enums';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { useAuth } from "@clerk/nextjs";



const MAX_FILE_SIZE_ANONYMOUS = 1 * 1024 * 1024; // 1MB in bytes

// 添加图片缩放函数
const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file); // 如果转换失败，返回原始文件
          }
        }, file.type);
      };
    };
  });
};

export default function ImageUploader({
    id,
    locale,
    langName,
  }: {
    id: string;
    locale: any;
    langName: string;
  }) {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [needSignIn, setNeedSignIn] = useState(false);
  const { isSignedIn } = useAuth();


  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref);
    }
  }, [searchParams]);

  const handleFilesAdded = (acceptedFiles: any[]) => {
    const files = acceptedFiles.map(file => file.name);
    console.log('Files to upload:', files);
  
    setSelectedFile(acceptedFiles[0]);
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
        'image/png': ['.png','.jpg','.jpeg','.gif','.webp'],
      },
    onDrop: handleFilesAdded,
    noClick: false,
  });

  const beforeUpload = (file: File) => {

    if (!isSignedIn && file.size > MAX_FILE_SIZE_ANONYMOUS) {
      toast.error(locale.fileSizeError || 'Anonymous users can only upload images up to 1MB. Please login to use full features');
      setNeedSignIn(true);
      return false;
    }
    
    return true;
  };

  const uploadProps = {
    beforeUpload: beforeUpload,
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(locale.errorSelectFile);
      return;
    }
    
    if (!beforeUpload(selectedFile)) {
      return;
    }

    setIsLoading(true);
    try {
      // 在上传前处理图片尺寸
      const processedFile = await resizeImage(selectedFile);
      const formData = new FormData();
      formData.append('file', processedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      await saveImageInfo(url);
    } catch (error: any) {
      toast.error(`${locale.errorUpload}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  async function saveImageInfo(fileName: string) {
    try {
      const response = await fetch("/api/picture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: '',
          tags: [],
          status: PictureStatus.UPLOADED,
          url: fileName}),
      });

      if (!response.ok) {
        const errmsg = await response.text();
        throw new Error(errmsg || response.statusText);
      }

      const data = await response.json();
      console.log("Image saved:", data);
      const pictureId = data.id;
      const ref = localStorage.getItem('referralCode');
      const currentLang = langName;
      const langPrefix = currentLang && currentLang !== 'en' ? `/${currentLang}` : '';
      const url = ref ? `${langPrefix}/texture/${pictureId}?ref=${ref}` : `${langPrefix}/texture/${pictureId}`;
      router.push(url);
    } catch (error: any) {
      toast.error(`${locale.errorSave}: ${error.message}`);
      console.error("Failed to save image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="lg:max-w-4xl md:max-w-3xl w-[95%] px-4 sm:px-6 lg:px-8 pb-4 pt-4 md:pt-4 space-y-6 text-center">
      <div
        {...getRootProps({
          className: 'dropzone border-2 border-dashed border-gray-300 p-4 rounded-md cursor-pointer',
        })}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500 h-20 flex items-center justify-center gap-2">
          {!selectedFile && <ArrowRight className="animate-bounce" size={24} />}
          {selectedFile ? `${locale.selectedFile}: ${selectedFile.name}` : locale.dragDropText}
        </p>
      </div>
      <div className='lg:max-w-4xl md:max-w-3xl w-[95%] px-4 sm:px-6 lg:px-8 pb-8 pt-4 md:pt-4 space-y-6 text-center flex justify-center items-center'>
        <div className="relative inline-block">
          {needSignIn ? (
            <>
              <SignedOut>
                <SignUpButton mode="modal">
                <Button
                type="button" 
                className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white"
              >
                <RocketIcon className="mr-2" />
                {selectedFile && !isLoading && (
                  <ArrowRight 
                    className="absolute left-[-2rem] top-1/2 -translate-y-1/2 animate-bounce text-purple-500" 
                    size={24} 
                  />
                )}
                {isLoading ? locale.uploading : "Sign In"}
                </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  type="button"
                  className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white" 
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  {isLoading ? locale.uploading : locale.protectArtwork}
                </Button>
              </SignedIn>
            </>
          ) : (
            <Button
              type="button"
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white" 
              onClick={handleUpload}
              disabled={isLoading}
          >
            <RocketIcon className="mr-2" />
            {selectedFile && !isLoading && (
              <ArrowRight 
                className="absolute left-[-2rem] top-1/2 -translate-y-1/2 animate-bounce text-purple-500" 
                size={24} 
              />
            )}
              {isLoading ? locale.uploading : locale.protectArtwork}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}