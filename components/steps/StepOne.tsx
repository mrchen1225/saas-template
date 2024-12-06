
import { findPictureById } from "@/database/pictureRepo";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { Button, Progress } from "@nextui-org/react";
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from "react-toastify";
import Image from 'next/image';
import { bucketName, supabase } from "@/components/utils/supabaseClient";
import { DropTableBuilder } from "kysely";
import { useRouter } from "next/navigation";

interface StepOneProps {
  id: string,
  picture: any,
  signedUrl: string,
  setStage: any,
  setProgressValue: any,
  locale: any
}

const StepOne = ({ id, picture, signedUrl, setStage, setProgressValue, locale }: StepOneProps) => {
  const router = useRouter();

  async function handleNextClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget)
    if (!signedUrl) {
      return <div>{locale.stepOne.pictureNotFound}</div>;
    }

    const rawFormData = {
      description: formData.get('description'),
    };

    const result = await fetch(`/api/picture/${id}`, {
      method: 'POST',
      body: JSON.stringify(rawFormData),
    });

    if (result.status === 200) {
      setStage(3);
      setProgressValue(90);
    } else {
      const res = await result.json()
      toast(res.message);
    }
  }
  console.log("locale: ", locale);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 md:p-8">
      <form onSubmit={handleNextClick}>
        <h2 className="text-center mb-4 text-xl">{locale.title}</h2>
        <textarea
          className="w-full h-24 p-2 mb-4 border border-gray-300 rounded-lg"
          name="description"
          placeholder={locale.stepOne.inputDescriptionPlaceholder}
          rows={4}
          cols={90}
        />
        <Button
          type="submit"
          color="primary"
          variant="solid"
        >
          {locale.stepOne.button}
        </Button>
        {picture}
      </form>
    </div>
  );
};

export default StepOne;