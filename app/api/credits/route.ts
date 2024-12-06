import { consumeUserCredits, getUserCredits, rechargeUserCredits } from "@/actions/credits";
import { sendEmail } from "@/actions/sendmail";
import { updatePictureStatus } from "@/database/pictureRepo";
import { PictureStatus } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    const ret = JSON.stringify({ credits: 0, error: "unauthorized" });
    return new NextResponse(ret, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userCredits = await getUserCredits(userId);
  const left = userCredits.free.left + (userCredits.purchased?.left || 0) + (userCredits.subscription?.credits.left || 0);
  const ret = JSON.stringify({ credits: left });

  return new NextResponse(ret, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { pictureId, processType } = await req.json();
    if (!pictureId) {
      return new NextResponse(JSON.stringify({ error: "Missing pictureId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    let creditsNeeded = 10;

    if (processType === 'texture') {
      creditsNeeded = 10; // Assume each operation requires 10 credits
    } else  {
      creditsNeeded = 10; // Assume each operation requires 100 credits
    }

    const deductResult = await consumeUserCredits(userId, creditsNeeded);
    if (!deductResult.success) {
      return new NextResponse(JSON.stringify({ error: deductResult.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // 更新图片状态
    const updateResult = await updatePictureStatus(pictureId, PictureStatus.PAID);
    if (updateResult) {
      // 如果更新成功，发送邮件给管理员
      try {
        await sendEmail('admin@guanwei.tech', '图片状态更新通知', `图片ID ${pictureId} 的状态已更新为已支付。`);
      } catch (error) {
        console.error('发送邮件失败:', error);
      }
    } else {
      // 如果更新失败，退还积分
      await rechargeUserCredits(userId, creditsNeeded);
      return new NextResponse(JSON.stringify({ error: '更新图片状态失败' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 返回成功响应
    return new NextResponse(JSON.stringify({ success: true, message: "操作成功" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error occurred while processing request:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
