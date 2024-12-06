export async function getImageUrl(url: string): Promise<string> {
  // 如果 URL 已经是完整的 URL，直接返回
  if (url.startsWith('http')) {
    return url;
  }
  
  // 否则，添加你的基础 URL
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
} 