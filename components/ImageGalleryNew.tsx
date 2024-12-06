// components/ImageGallery.tsx
import React from "react";
import { Image } from "@nextui-org/image";

interface ImageData {
  src: string;
  alt: string;
  href: string;
  tags: string[];
}

interface ImageGalleryNewProps {
  images: ImageData[];
}

const ImageGalleryNew: React.FC<ImageGalleryNewProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="p-2">
          <a href={image.href}>
            <Image src={image.src} alt={image.alt} width={300} className="w-full h-auto" />
          </a>
          <div className="mt-2">
            {image.tags.map((tag, i) => (
              <span key={i} className="mr-2 px-2 py-1 bg-orange-200 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGalleryNew;

