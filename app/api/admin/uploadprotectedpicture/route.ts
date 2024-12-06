import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase, bucketName } from '@/components/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    // 验证身份
    const headersList = headers();
    const authHeader = headersList.get('aidisturbanceauth');

    if (authHeader && authHeader.startsWith('abc123aidisturbance')) {
      // 如果有特定请求头，直接通过验证
    } else {
      const { userId } = auth();
      const user = userId ? await clerkClient.users.getUser(userId) : null;
      if (user?.emailAddresses[0]?.emailAddress !== 'guanwei1225@gmail.com') {
        return NextResponse.json({ message: '未授权访问' }, { status: 401 });
      }
    }

    // 解析文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: '没有找到文件' }, { status: 400 });
    }
    // 使用原始文件名
    const fileName = `protected/${file.name}`;

    // 上传文件到 Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 更新图片状态
    return NextResponse.json({
      message: '文件上传成功',
      url: fileName
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ message: '文件上传失败' }, { status: 500 });
  }
}
