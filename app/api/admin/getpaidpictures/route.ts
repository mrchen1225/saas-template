import { NextResponse } from 'next/server';
import { bucketName, supabase } from '@/components/utils/supabaseClient';
import { headers } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { findPictures } from '@/database/pictureRepo';

export async function GET(request: Request) {
  try {
    // 获取请求头
    const headersList = headers();
    const authHeader = headersList.get('aidisturbanceauth');

    // 检查特定请求头
    if (authHeader && authHeader.startsWith('abc123aidisturbance')) {
      // 如果有特定请求头，直接通过验证
    } else {
      // 验证Clerk用户身份
      const { userId } = auth();
      const user = userId ? await clerkClient.users.getUser(userId) : null;
      // 检查用户邮箱
      if (user?.emailAddresses[0]?.emailAddress !== 'guanwei1225@gmail.com') {
        return NextResponse.json({ message: '未授权访问' }, { status: 401 });
      }
    }

    // 从数据库中获取status为PAID的图片列表
    const paidPictures = await findPictures({ status: 'PAID' });

    if (!paidPictures || paidPictures.length === 0) {
      return NextResponse.json({ message: '没有找到已支付的图片' }, { status: 404 });
    }

    // 获取最新的已支付图片
    const latestPaidPicture = paidPictures[0];
    // 从数据库中获取status为PAID的最新图片

    // 生成图片的签名下载链接
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from(bucketName) // 请替换为您的实际存储桶名称
      .createSignedUrl(latestPaidPicture.url, 60); // 60秒有效期，可以根据需要调整

    if (signedUrlError) throw signedUrlError;

    return NextResponse.json({
      paidPictures: paidPictures,
      latestPaidPicturesignedUrl: signedUrlData.signedUrl,
      latestPaidPicture: latestPaidPicture,
      message: '获取已支付图片成功'
    });

  } catch (error) {
    console.error('获取已支付图片失败:', error);
    return NextResponse.json({ message: '获取已支付图片失败' }, { status: 500 });
  }
}