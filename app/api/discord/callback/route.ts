import { addFreeCredits, getUserMetadata, updateUserMetadata } from '@/actions/credits';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { MdUpdateDisabled } from 'react-icons/md';

export async function POST(req: Request) {
  try {
    const { userId } = auth(); 
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // 1. 验证用户是否真的加入了 Discord 服务器
    // 2. 检查是否已经领取过奖励
    // 获取用户的 metadata
    const userMetadata = await getUserMetadata(userId);
    // 检查是否已经领取过奖励
    const metadata = userMetadata.metadata || {};
    if (metadata.joinedDiscord) {
      return NextResponse.json(
        { success: false, message: 'You have already claimed the Discord reward' },
        { status: 400 }
      );
    }

    // 更新用户的 metadata,标记已加入 Discord
    await updateUserMetadata(userId, {
      ...metadata,
      joinedDiscord: true
    });
    // 3. 添加积分
    await addFreeCredits(userId, 50);
    // 4. 记录这次奖励

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
