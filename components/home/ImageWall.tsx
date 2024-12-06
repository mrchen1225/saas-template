"use client";
import ImageGallery from "@/components/ImageGallery";
import ImageGalleryNew from "../ImageGalleryNew";
import { RoughNotation } from "react-rough-notation";
import { ROUGH_NOTATION_BACKGROUND_COLOR } from "@/config/color";
const images = [
  {
    src: "/images/arts/art1.webp",
    alt: "kortizart",
    href: "#http://www.karlaortizart.com",
    tags: ["kortizart"],
  },
  {
    src: "/images/arts/art2.webp",
    alt: "scarlettandteal",
    href: "#https://twitter.com/scarlettandteal",
    tags: ["scarlettandteal"],
  },
  {
    src: "/images/arts/art3.webp",
    alt: "zemotion from zhangjingna",
    href: "#https://www.zhangjingna.com",
    tags: ["zemotion", "zhangjingna"],
  },
];

export default function ImageWall({ locale }: { locale: any; }) {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-center text-white">
          <RoughNotation
            type="highlight"
            show={true}
            color={ROUGH_NOTATION_BACKGROUND_COLOR}
          >
            {locale.title}
          </RoughNotation>
        </h2>
        <div className="mt-4">
          <ImageGalleryNew images={images} />
        </div>
    </div>
    </>
  );
}

