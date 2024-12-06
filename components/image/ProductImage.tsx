import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/imageUtils';
export default function ProductImage({ url, size = 64 }: { url: string, size?: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        const resolvedUrl = await getImageUrl(url);
        setImageUrl(resolvedUrl);
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImageUrl();
  }, [url]);

  if (isLoading) {
    return <div className={`w-${size} h-${size} animate-pulse bg-gray-200 rounded-md`} />;
  }

  if (!imageUrl) {
    return <div className={`w-${size} h-${size} bg-gray-100 rounded-md flex items-center justify-center`}>Error</div>;
  }

  return (
    <Image
      alt="Product Image"
      className="rounded-md object-cover"
      height={size}
      width={size}
      src={imageUrl}
      quality={75}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    />
  );
} 