import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { updatePictureStatus } from '@/database/pictureRepo';

export async function POST(request: Request) {
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

    // 解析请求体
    const { pictureId, newStatus } = await request.json();

    if (!pictureId || !newStatus) {
      return NextResponse.json({ message: '缺少必要参数' }, { status: 400 });
    }

    // 更新图片状态
    const updatedPicture = await updatePictureStatus(pictureId, newStatus);

    if (!updatedPicture) {
      return NextResponse.json({ message: '图片不存在或更新失败' }, { status: 404 });
    }

    return NextResponse.json({
      message: '图片状态更新成功',
      success: true
    });

  } catch (error) {
    console.error('更新图片状态失败:', error);
    return NextResponse.json({ message: '更新图片状态失败' }, { status: 500 });
  }
}
