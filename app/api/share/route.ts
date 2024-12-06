import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { auth } from '@clerk/nextjs/server';
import { addFreeCredits } from '@/actions/credits';
import { createShareActivation, createShareLink, findShareActivationByShareLinkIdAndUserId, findShareLinkByShareLink, findShareLinkByUserId } from '@/database/shreLinkRepo';


export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'need login' }, { status: 401 });
    }

    // 检查用户是否已有分享链接
    const shareLink = await findShareLinkByUserId(userId);

    if (!shareLink) {
      // 创建新的分享链接
      const newShareLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${nanoid(10)}`;
      await createShareLink({userId, shareLink: newShareLink});
      return NextResponse.json({ shareLink: newShareLink });
    }
    return NextResponse.json({ shareLink: shareLink.shareLink });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');

    if (!userId) {
      return NextResponse.json({ error: 'need login' }, { status: 401 });
    }

    if (!ref) {
      return NextResponse.json({ error: 'Invalid referral link' }, { status: 400 });
    }

    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${ref}`;

    // 查找分享链接对应的用户
    const referrerShareLink = await findShareLinkByShareLink(shareLink);

    if (!referrerShareLink) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userId === referrerShareLink.userId) {
      return NextResponse.json({ error: 'Cannot use your own share link' }, { status: 400 });
    }

    // 检查当前用户是否已经使用过此推荐链接
    const existingActivation = await findShareActivationByShareLinkIdAndUserId(referrerShareLink.id, userId);

    if (existingActivation) {
      return NextResponse.json({ message: 'Already used this share link' });
    }

    // 记录激活
    await createShareActivation({
      shareLinkId: referrerShareLink.id,
      activatedByUserId: userId
    });

    // 更新引荐者的积分
    // 使用 actions/credits 中的函数来增加积分
    await addFreeCredits(referrerShareLink.userId, 10);

    return NextResponse.json({ message: 'Credits successfully added to referrer' });
  } catch (error) {
    console.error('Error processing referral:', error);
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
  }
}
