'use client';

import { bucketName, supabase } from '@/components/utils/supabaseClient';
import { Progress } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import StepOne from '@/components/steps/StepOne';
import StepTwo from '@/components/steps/StepTwo';
import StepThree from '@/components/steps/StepThree';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import CreditsNum from '@/components/header/CreditsNum';
import { defaultLocale, getDictionary } from "@/lib/i18n";

export default function Overlay({ params }: { params: { id: string, lang: string } }) {
  const [status, setStatus] = useState<string>('UPLOADED');
  const [progressValue, setProgressValue] = useState<number>(66);
  const [stage, setStage] = useState<number>(2);
  const [pictureData, setPictureData] = useState<{
    status: string;
    url: string;
    description: string;
    id: string;
    tags: string[];
    params: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>({
    status: 'UPLOADED',
    url: '',
    description: '',
    id: '',
    tags: [],
    params: {},
    createdAt: '',
    updatedAt: ''
  });
  const [pictureComp, setPictureComp] = useState<React.ReactNode>(<></>);
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [proceedSignedUrl, setProceedSignedUrl] = useState<string>('');

  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter(); 
  const [url, setUrl] = useState('');
  const searchParams = useSearchParams();
  const [referralProcessed, setReferralProcessed] = useState(false);
  const [dict, setDict] = useState<any>({});
  const [isDictLoaded, setIsDictLoaded] = useState(false);

  const Tips = {
    '2': dict.stepTwoTip || '2. Please describe the picture in detail.',
    '3': dict.stepThreeTip || '3. Waiting for payment.'
  };


  useEffect(() => {
    setUrl(window.location.href);

    console.log("params.lang: ", params.lang);
    const loadDictionary = async () => {
      const langName = params.lang || defaultLocale;
      const dictionary = await getDictionary(langName);
      setDict(dictionary.Overlay);
      setIsDictLoaded(true);
      console.log("dict: ", dictionary.Overlay);
    };

    loadDictionary();


    const processReferral = async (ref: string) => {
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


    async function fetchData() {
      if (isLoaded && isSignedIn && !referralProcessed) {
        const ref = searchParams?.get('ref') || localStorage.getItem('referralCode') || '';
        if (ref) {
          processReferral(ref);
        }
      }
      
      if (params.id === 'step-one') {
        return;
      }
      try {
        const response = await fetch(`/api/picture/${params.id}`, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(dict.fetchPictureError || 'Failed to fetch picture information.');
        }

        const repo = await response.json();
        console.log('Fetched picture data:', repo);
        setStatus(repo.status as string);

        if (repo.status === 'DESCRIBED') {
          setStage(3);
          setProgressValue(90);
        }

        if (repo.status === 'PAID' || repo.status.includes('PROCESSING') || repo.status === 'PROCESSED') {
          setStage(4);
          setProgressValue(100);
          const proceedUrl = 'protected/' + repo.url
          const { data } = await supabase.storage.from(bucketName).createSignedUrl(proceedUrl, 10 * 60);
          if (data?.signedUrl) {
            setProceedSignedUrl(data.signedUrl);
          }
        }

        const path = repo.url;
        const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 10 * 60);

        if (data?.signedUrl) {
          setPictureData(repo);
          setSignedUrl(data.signedUrl);
          setPictureComp(
            <Image
              src={data.signedUrl}
              alt={dict.stepOneAlt || "Step One"}
              className="h-auto m-4"
              width={300}
              height={200}
              priority={true}
            />
          );
        } else {
          console.error(dict.signedUrlError || 'Failed to get a signed URL.');
        }
      } catch (error) {
        console.error(dict.dataFetchError || 'Error fetching data:', error);
        toast.error(dict.fetchPictureError || 'Failed to fetch picture information.');
      }
    }

    fetchData();
  }, [params.id, status, stage, isLoaded, isSignedIn, referralProcessed, searchParams, dict, params.lang]);

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl={url}>
          <button className="border border-gray-300 rounded px-4 py-2 hover:border-gray-500">
            {dict.signInButton || "Sign In to Make the Picture Private"}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-row items-center space-x-4">
          <UserButton />
          <CreditsNum />
        </div>
      </SignedIn>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 w-full">
        <div>
          {dict.progress || "Progress"}: ({stage}/4)<Progress value={progressValue} />
        </div>
        <div className="flex justify-between items-center mb-4">
          <p>
            {stage === 2 ? Tips['2'] : stage === 3 ? Tips['3'] : null}
          </p>
        </div>
        <div className="justify-items-center w-full sm:w-max">
          {isDictLoaded && stage === 2 ? (
            <StepOne
              id={pictureData.id}
              picture={pictureComp}
              signedUrl={signedUrl}
              setStage={setStage}
              setProgressValue={setProgressValue}
              locale={dict}
            />
          ) : stage === 3 ? (
            <StepTwo id={pictureData.id} locale={dict} />
          ) : stage === 4 ? (
            <StepThree id={pictureData.id} status={status} proceedSignedUrl={proceedSignedUrl} locale={dict} />
          ) : null}
        </div>
      </div>
    </>
  );
}