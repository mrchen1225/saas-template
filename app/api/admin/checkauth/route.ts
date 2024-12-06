import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // 获取请求头
    const headersList = headers();
    const authHeader = headersList.get('aidisturbanceauth');

    // 检查特定请求头
    if (authHeader && authHeader.startsWith('abc123aidisturbance')) {
      return NextResponse.json({ message: '认证通过' }, { status: 200 });
    }

    // 验证Clerk用户身份
    const { userId } = auth();
    const user = userId ? await clerkClient.users.getUser(userId) : null;

    // 检查用户ID
    if (userId === 'user_2lTLLoLn4I4sxz0l1ruSlYr4pwS' || userId === 'user_2kbsJ0hADwZpu2DzNaRfeScHOrD') {
      return NextResponse.json({ message: '认证通过' }, { status: 200 });
    }

    // 如果都不符合条件，返回未授权
    return NextResponse.json({ message: '未授权访问' }, { status: 401 });

  } catch (error) {
    console.error('认证检查失败:', error);
    return NextResponse.json({ message: '认证检查失败' }, { status: 500 });
  }
}
