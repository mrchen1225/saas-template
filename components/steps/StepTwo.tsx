'use client'

import { defaultLocale, getDictionary } from "@/lib/i18n";
import { SignedIn, SignedOut, SignUp, SignUpButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, Divider, CardBody, CardFooter, Button, button, Progress } from "@nextui-org/react";
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react';
import { FaCheck, FaCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter, usePathname  } from 'next/navigation'
import { MdDisabledByDefault } from "react-icons/md";
import { loadStripe } from '@stripe/stripe-js';
import { FaDiscord, FaFacebook } from 'react-icons/fa';
import { FaEnvelope, FaXTwitter } from 'react-icons/fa6';

type ButtonColor = "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StepTwoProps {
  id: string 
  locale: any
}
const StepTwo = ( {id, locale} : StepTwoProps) => {
  
  const router = useRouter();
  const url = usePathname();
  const [shareLink, setShareLink] = useState('');
  console.log("redirectUrl will be:", url)
  // const url = router.asPath;
  const FREE_VERSION_LINK = '/dashborad/share'
  const PRO_VERSION_LINK = '/dashborad/share'
  const TIERS = [{
    key: 'Free',
    title: locale.stepTwo.free.title,
    price: "Free",
    href: FREE_VERSION_LINK,
    description:
      locale.stepTwo.free.description,
    features: locale.stepTwo.free.features,
    buttonText: locale.stepTwo.free.buttonText,
    buttonColor: "primary",
    buttonVariant: "default",
    buttonLink: "/workbench/sharelink",
    disabled: false
  },
  {
    key: 'Pay For Once',
    title: locale.stepTwo.payForOnce.title,
    href: PRO_VERSION_LINK,
    description:
      locale.stepTwo.payForOnce.description,
    price: locale.stepTwo.payForOnce.price,
    features: locale.stepTwo.payForOnce.features,
    buttonText: locale.stepTwo.payForOnce.buttonText,
    buttonColor: "primary",
    buttonVariant: "default",
    buttonLink: "https://buy.stripe.com/aEU5m4fqR2SF1jO6oo",
    disabled: false
  },
  {
    key: 'Use Credits',
    title: locale.stepTwo.useCredits.title,
    href: PRO_VERSION_LINK,
    description:
      locale.stepTwo.useCredits.description,
    price: locale.stepTwo.useCredits.price,
    features: locale.stepTwo.useCredits.features,
    buttonText: locale.stepTwo.useCredits.buttonText,
    buttonColor: "primary",
    buttonVariant: "default",
    buttonLink: "#",
    disabled: false
  },]
  async function handleTierClick(tierKey: string) {
    
    if (tierKey === 'Pay For Once') {
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
        toast(locale.stepTwo.payForOnce.failed);
      }
    } else if (tierKey === 'Use Credits') {
      if (confirm(locale.stepTwo.useCredits.confirm)) {
        try {
          const response = await fetch('/api/credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pictureId: id, processType: 'overlay' }),
          });
          if (response.ok) {
            const result = await response.json();
            toast.success(locale.stepTwo.useCredits.success);
            // 刷新页面
            window.location.reload();
            // You can add other post-success operations here, such as refreshing the page or redirecting
          } else {
            const errorData = await response.json();
            toast.error(locale.stepTwo.useCredits.failed);
            router.push("/workbench/orders");
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error(locale.stepTwo.useCredits.failed);
        }
      }
    } else if (tierKey === 'Free') {
      try {
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pictureId: id }),
        });
        if (response.ok) {
          const result = await response.json();
          toast.success(locale.stepTwo.free.success);
          // You can add functionality to copy the link to clipboard here
          navigator.clipboard.writeText(result.shareLink);
          setShareLink(result.shareLink);
        } else {
          const errorData = await response.json();
          toast.error(locale.stepTwo.free.failed);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(locale.stepTwo.free.failed);
      }
    }
  }
  
  const copyToClipboard = () => {
    const shareText = shareLink;
    navigator.clipboard.writeText(shareText);
    toast.success(locale.stepTwo.free.copySuccess);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 justify-items-center">
        {TIERS?.map((tier) => (
          <Card key={tier.key} className="p-3 flex-1 w-[90%]" shadow="md">
            <CardHeader className="flex flex-col items-start gap-2 pb-6">
              <h2 className="text-large font-medium">{tier.title}</h2>
              <p className="text-medium text-default-500">{tier.description}</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-8">
              <p className="flex items-baseline gap-1 pt-2">
                <span className="inline bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-2xl font-semibold leading-7 tracking-tight text-transparent">
                  {tier.price}
                </span>
                {typeof tier.price !== "string" ? (
                  <span className="text-small font-medium text-default-400">
                    {tier.price}
                  </span>
                ) : null}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features?.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <FaCheck />
                    <p className="text-default-500">{feature}</p>
                  </li>
                ))}
              </ul>
              {tier.key === 'Free' && (
                <>
                Generate Share Link And Share To Your Friends:
                <div className="flex flex-row gap-2 items-center">
                  <FaXTwitter onClick={() => {
                    window.open(`https://x.com/intent/tweet?text=Check%20out%20this%20AI%20Disturbance%20Tool%20I%20found%20on%20the%20internet!&url=${shareLink}`, '_blank');
                  }}/>
                  <FaDiscord onClick={() => {
                    window.open(`https://discord.com/channels/@me`, '_blank');
                  }}/>
                  <FaFacebook onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`, '_blank');
                  }}/>
                  <FaEnvelope onClick={() => {
                    window.open(`mailto:?subject=Check%20out%20this%20AI%20Disturbance%20Tool%20I%20found%20on%20the%20internet!&body=${shareLink}`, '_blank');
                  }}/>
                </div>
                  {shareLink && (
                    <div className="mt-0 p-2 bg-gray-100 rounded-md flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm break-all">
                          
                          {shareLink}
                        </span>
                        <Button size="sm" onClick={copyToClipboard}>
                          <FaCopy />
                        </Button>
                      </div>
                      
                    </div>
                  )}
                </>
              )}
            </CardBody>
            <CardFooter>
              <SignedOut>
                <SignUpButton mode="modal" signInForceRedirectUrl={url}>
                    <Button
                    disabled={tier.disabled}
                    color={tier.buttonColor as ButtonColor || 'primary'}
                    variant='solid'
                    rel="noopener noreferrer nofollow"
                    >
                    {tier.buttonText}
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                color={tier.buttonColor as ButtonColor || 'primary'}
                disabled={tier.disabled}
                      variant='solid'
                      rel="noopener noreferrer nofollow"
                      onClick={ () => { handleTierClick(tier.key) }}
                      >
                      {tier.buttonText}
                </Button>
              </SignedIn>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StepTwo;
