import { updatePictureDescription, updatePictureStatus } from '@/database/pictureRepo';
import { PictureStatus } from '@/prisma/enums';
import { UserCredits } from '@/types/user';
import { clerkClient } from '@clerk/nextjs/server';
import { generateInitialUserCredits, rechargeUserCredits } from '@/actions/credits';
import Stripe from 'stripe';
import { sendEmail } from '@/actions/sendmail';

// import { updateUserPlan } from '@/utils/subscriptionUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // 使用最新的 API 版本
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  // console.log(body);

  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  // Get the signature sent by Stripe
  const signature = req.headers.get('stripe-signature');
  if (signature === null) {
    // 处理null情况，可能抛出错误或返回一个特定的响应
    throw new Error('Signature is null');
  }

  // let sessionInfo: {
  //   customer_details: { email: string };
  //   metadata: { planId: string };
  // } | null;

  // let sessionInfo: Response | null;
  const stripEvent = stripe.webhooks.constructEvent(
    body,
    signature,
    endpointSecret,
  );
  // Handle the event
  switch (stripEvent.type) {
    case 'payment_intent.succeeded':
      // eslint-disable-next-line no-case-declarations
      const paymentIntent = stripEvent.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      // eslint-disable-next-line no-case-declarations
      const paymentMethod = stripEvent.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      console.log(paymentMethod);
      break;
    case 'checkout.session.completed':
      console.log(stripEvent.data);
      const checkoutSession = stripEvent.data.object;
      console.log(`结账会话已完成: ${checkoutSession.id}`);
      
      const sessionInfo = await stripe.checkout.sessions.retrieve(
        checkoutSession.id,
        {
          expand: ['line_items'],
        }
      );
      console.log(sessionInfo);
      
      if (sessionInfo.metadata?.paymentType === 'recharge') {
        // 处理充值
        const userId = sessionInfo.metadata.userId;
        const rechargeAmount = sessionInfo.metadata.quantity;
        await rechargeUserCredits(userId, parseInt(rechargeAmount));
        console.log(`用户 ${userId} 充值了 ${rechargeAmount} 积分`);
      } else if (sessionInfo.metadata?.pictureId) {
        // 处理图片支付
        const pictureId = sessionInfo.metadata.pictureId;
        await updatePictureStatus(pictureId, PictureStatus.PAID);
        console.log(`图片 ${pictureId} 状态已更新为已支付`);
      } else if (sessionInfo.mode === 'subscription') {
        // 处理订阅
        const userId = sessionInfo.metadata?.userId;
        const plan = sessionInfo.metadata?.plan;
        if (userId && plan) {
          const credits = getPlanCredits(plan);
          await updateUserSubscriptionCredits(userId, plan, credits);
          console.log(`用户 ${userId} 订阅了 ${plan} 计划，获得 ${credits} 积分`);
        }
      }
      
      console.log(`客户邮箱: ${sessionInfo.customer_details?.email}`);

      const email = sessionInfo.customer_details?.email;
      if (email) {
        await sendEmail('admin@guanwei.tech', `客户${email}订阅成功`, '请尽快处理 sessionInfo: ' + JSON.stringify(sessionInfo));
      }
      return Response.json({ message: 'Webhook received' });
    // ... handle other event type

    default:
      // Unexpected event type
      console.log(`Unhandled event type ${stripEvent.type}.`);
  }
  return Response.json({ error: 'Unhandled event type', status: 400 });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const plan = subscription.items.data[0].plan.metadata?.plan;
  const credits = getPlanCredits(plan as string);

  await updateUserSubscriptionCredits(userId, plan as string, credits);
}

function getPlanCredits(plan: string): number {
  switch (plan) {
    case 'Standard':
      return 100;
    case 'Premium':
      return 500;
    default:
      return 0;
  }
}

async function updateUserSubscriptionCredits(userId: string, plan: string, credits: number) {
  const user = await clerkClient.users.getUser(userId);
  console.log(user);
  const userCredits = user.privateMetadata.credits as UserCredits || generateInitialUserCredits();

  userCredits.subscription = {
    plan,
    credits: {
      total: credits,
      left: credits,
      used: 0,
    },
    nextResetDate: getNextMonthDate(),
  };

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      credits: userCredits,
    },
  });
}

function getNextMonthDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
