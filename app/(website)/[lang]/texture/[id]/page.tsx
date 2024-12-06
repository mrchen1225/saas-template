'use client'

import React, { useState, useEffect } from 'react';
import ImageEditor from '@/components/image/ImageEditor';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { bucketName, supabase } from '@/components/utils/supabaseClient';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import CreditsNum from '@/components/header/CreditsNum';
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';


export default function Texture() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [id, setId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [pictureStatus, setPictureStatus] = useState<string>('');
  const params = useParams();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const [referralProcessed, setReferralProcessed] = useState(false);
  const [dict, setDict] = useState<any>({});
  const [isDictLoaded, setIsDictLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadDictionary = async () => {
      const langName = params?.lang || defaultLocale;
      const dictionary = await getDictionary(langName as string);
      setDict(dictionary.Texture);
      setIsDictLoaded(true);
    };

    const fetchImage = async () => {
      if (!params?.id) {
        setError(dict.imageIdNotProvided || 'Image ID not provided');
        return;
      }

      try {
        const response = await fetch(`/api/picture/${params.id}`);
        if (!response.ok) {
          throw new Error(dict.fetchImageFailed || 'Failed to fetch image');
        }
        const responseData = await response.json();

        setPictureStatus(responseData.status);

        const path = responseData.url;
        let signedUrl;
        if (!path.startsWith('http')) {
          const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 10 * 60);
          signedUrl = data?.signedUrl;
        } else {
          signedUrl = path;
        }
        setImageUrl(signedUrl || null);
        setId(params.id as string);
      } catch (err) {
        setError(dict.errorFetchingImage || 'Error fetching image');
        console.error(dict.errorFetchingImage || 'Error fetching image:', err);
      }
    };

    loadDictionary();

    if (!imageUrl && params?.id) {
      fetchImage();
    }

    if (isLoaded && isSignedIn && !referralProcessed) {
      const ref = searchParams?.get('ref');
      if (ref) {
        const processReferral = async () => {
          try {
            const response = await fetch('/api/share?ref=' + ref, { method: 'GET' });
            if (response.ok) {
              setReferralProcessed(true);
              localStorage.removeItem('referralCode');
            }
          } catch (error) {
            console.error(dict.referralProcessError || 'Failed to process referral registration:', error);
          }
        };
        processReferral();
      }
    }
  }, [params?.id, params?.lang, isLoaded, isSignedIn, referralProcessed, searchParams, dict, imageUrl]);


  async function handleDiscordJoin() {
    try {
      // 打开 Discord 邀请链接
      window.open('https://discord.gg/nYbV7d5y', '_blank');

      // 可以在这里添加一个确认对话框，让用户确认已加入
      toast.info(dict.discordJoinConfirm);
      // 然后调用后端 API 验证并发放奖励
      const response = await fetch('/api/discord/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
      
      if (response.ok) {
        toast.success(dict.discordJoinSuccess);
      } else {
        toast.error(dict.discordJoinError);
      }
    } catch (error) {
      console.error('Discord join error:', error);
      toast.error(dict.discordJoinError);
    }
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="text-center text-2xl">{dict.title || 'AI Disturbance Overlay Image Editor'}</h2>
      {isMounted && (
        <div className="flex flex-row items-center justify-center mb-4">
          <SignedIn>
            <div className="flex flex-row items-center justify-center space-x-4">
              <UserButton />
              <CreditsNum />
              <span className="text-sm font-medium">
                <span className="font-bold">{dict.status || 'Status'}</span>: <span className="text-purple-600">{pictureStatus}</span>
              </span>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDiscordJoin}
              >
                <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2"/>
                </svg>
                <div className="flex items-center ml-2">
                  <div className="relative flex items-center justify-center w-5 h-5 bg-gray-300 rounded-full border border-gray-400 shadow-inner">
                    <div className="absolute inset-0 bg-gray-200 rounded-full m-0.5"></div>
                    <span className="relative text-[10px] font-bold text-gray-700">C</span>
                  </div>
                  <span className="ml-1 text-sm font-bold text-gray-400">+50</span>
                </div>
              </Button>
            </div>
          </SignedIn>
        </div>
      )}
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : imageUrl ? (
        <ImageEditor imageUrl={imageUrl} status={pictureStatus} id={id} langName={params?.lang as string} />
      ) : (
        <p className="text-center">{dict.loading || 'Loading image...'}</p>
      )}
    </div>
  );
}
