
'use client'

import { defaultLocale, getDictionary } from "@/lib/i18n";
import { SignedIn, SignedOut, SignUp, SignUpButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, Divider, CardBody, CardFooter, Button, button, Progress } from "@nextui-org/react";
import { Router } from "next/router";
import React, { useState } from 'react';
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter, usePathname  } from 'next/navigation'
import { MdDisabledByDefault } from "react-icons/md";
import { loadStripe } from '@stripe/stripe-js';
import Link from "next/dist/client/link";

type ButtonColor = "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StepThreeProps {
  id: string ,
  status: string,
  proceedSignedUrl: string,
  locale: any
}
const StepThree = ( {id, status, proceedSignedUrl, locale} : StepThreeProps) => {
  

  function handleDownload(event: React.MouseEvent<HTMLButtonElement>): void {
    console.log('Downloading...');
    const downloadUrl = proceedSignedUrl;
    window.open(downloadUrl, '_blank');
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="text-green-500 text-lg font-bold text-center">
          {locale.stepThree.title}
        </div>
        <div className="text-gray-600 text-base">
          {locale.stepThree.description}
        </div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded" role="alert">
          <strong>{locale.stepThree.status}:</strong> {status}
        </div>
        {status === 'PROCESSING_SUCCESS' || status === 'PROCESSED' && (
          <Button color="primary" onClick={handleDownload}>{locale.stepThree.button}</Button>
        )}
        <div className="mt-4">
          <Link href="/workbench" className="text-blue-500 hover:underline ">
            {">>"} {locale.stepThree.goToWorkbench || "Go to Workbench"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StepThree;

