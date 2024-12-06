import { getUserCredits } from "@/actions/credits";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    const ret = JSON.stringify({ error: "未授权" });
    return new NextResponse(ret, {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const userCredits = await getUserCredits(userId);
  
  let subscriptionInfo = {
    hasPlan: false,
    plan: '',
    credits: {
      total: 0,
      used: 0,
      left: 0
    },
    nextResetDate: new Date()
  };

  if (userCredits.subscription) {
    subscriptionInfo = {
      hasPlan: true,
      plan: userCredits.subscription.plan,
      credits: userCredits.subscription.credits,
      nextResetDate: userCredits.subscription.nextResetDate
    };
  }

  const ret = JSON.stringify({
    subscription: subscriptionInfo,
    freeCredits: userCredits.free,
    purchasedCredits: userCredits.purchased || { total: 0, used: 0, left: 0 }
  });

  return new NextResponse(ret, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
