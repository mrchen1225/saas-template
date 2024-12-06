import Image from 'next/image';
import { bucketName, supabase } from '@/components/utils/supabaseClient';
import { useState, useEffect } from 'react';

function ProductImage({ url }: { url: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getImageUrl() {
      // 如果是完整的URL(新的Cloudflare链接),直接使用
      if (url.startsWith('http')) {
        setImageUrl(url);
        return;
      }

      // 否则按照旧的Supabase逻辑处理
      try {
        const { data } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(url, 10 * 60);
        setImageUrl(data?.signedUrl || '');
      } catch (error) {
        console.error('获取图片URL失败:', error);
        setImageUrl('');
      }
    }

    getImageUrl();
  }, [url]);

  if (!imageUrl) {
    return null; // 或者显示一个加载指示器
  }

  return (
    <Image
      alt="Picture"
      className="aspect-square rounded-md object-cover"
      height={64}
      src={imageUrl}
      width={64}
      unoptimized
    />
  );
}

export default ProductImage;
