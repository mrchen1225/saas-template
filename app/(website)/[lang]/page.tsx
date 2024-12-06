import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import SocialProof from "@/components/home/SocialProof";
import ImageEditor from "@/components/image/ImageEditor";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { ClerkProvider } from "@clerk/nextjs";
import dynamic from 'next/dynamic'

// 动态导入非首屏组件
const FAQ = dynamic(() => import("@/components/home/FAQ"))
const Pricing = dynamic(() => import("@/components/home/Pricing"))
const Feature = dynamic(() => import("@/components/home/Feature"))
const CTA = dynamic(() => import("@/components/home/CTA"))

export default async function LangHome({
  params: { lang },
}: {
  params: { lang: string };
}) {
  // const langName = (lang && lang[0]) || defaultLocale;
  // let langName =
  //   lang && lang[0] && lang[0] !== "index" ? lang[0] : defaultLocale;

  const langName = lang !== "" ? lang : defaultLocale;

  console.log("lang: ", lang);
  console.log("langName: ", langName);

  const dict = await getDictionary(langName);

  return (
    <>
      {/* Hero Section */}
      <Hero locale={dict.Hero} CTALocale={dict.CTAButton} />
      {/* <ImageUploader  id="Uploader" locale={dict.UploadNewPicture} langName={langName} ></ImageUploader> */}
      <ClerkProvider>
        <ImageEditor id="ImageEditor" status="UPLOADED" langName={langName} imageUrl={""} />
      </ClerkProvider>
      
      {/* <Generator id="Generator" locale={dict.Feature} langName={langName} /> */}
      <Intro locale={dict.Intro}></Intro>
      {/* <ImageWall locale={dict.ImageWall} /> */}

      <SocialProof locale={dict.SocialProof} />
      {/* display technology stack, partners, project honors, etc. */}
      {/* <ScrollingLogos /> */}

      {/* USP (Unique Selling Proposition) */}
      <Feature id="Features" locale={dict.Feature} langName={langName} />

      {/* Testimonials / Wall of Love */}
      {/* <WallOfLove id="WallOfLove" locale={dict.WallOfLove} /> */}

      {/* Pricing */}
      <Pricing id="Pricing" locale={dict.Pricing} langName={langName} />

      {/* FAQ (Frequently Asked Questions) */}
      <FAQ id="FAQ" locale={dict.FAQ} langName={langName} />

      {/* CTA (Call to Action) */}
      <CTA locale={dict.CTA} CTALocale={dict.CTAButton} />
    </>
  );
}

