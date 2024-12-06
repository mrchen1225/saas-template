import { currentUser, User  } from '@clerk/nextjs/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    if (req.method === 'POST') {
      const user = await currentUser()
      try {
        const data = await req.json();
        console.log(data);

        let session;
        switch(data.paymentType) {
          case 'oneTime':
            session = await createOneTimePaymentSession(data, user);
            break;
          case 'subscription':
            session = await createSubscriptionSession(data, user);
            break;
          case 'recharge':
            session = await createRechargeSession(data, user);
            break;
          default:
            return NextResponse.json({ message: 'Invalid payment type' }, { status: 400 });
        }


        return NextResponse.json({ session });
      } catch (err) {
        return NextResponse.json({ message: 'Error creating checkout session:', err }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Clerk API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createOneTimePaymentSession(data: { pictureId: any; callbackUrl: any; }, user: User | null) {
  const PRICE_ID = process.env.STRIPE_ONCE_PRICE_ID;
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return await stripe.checkout.sessions.create({
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    metadata: { pictureId: data.pictureId },
    customer_email: user?.emailAddresses[0].emailAddress,
    mode: 'payment',
    success_url: `${origin}${data.callbackUrl}?success=true`,
    cancel_url: `${origin}${data.callbackUrl}?canceled=true`,
    automatic_tax: {enabled: true},
  });
}

async function createSubscriptionSession(data: { plan: string; callbackUrl: any; }, user: User | null) {
  const BASIC_PRICE_ID = process.env.STRIPE_BASIC_SUBSCRIPTION_PRICE_ID;
  const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_SUBSCRIPTION_PRICE_ID;
  const priceId = data.plan === 'basic' ? BASIC_PRICE_ID : PREMIUM_PRICE_ID;
  const planNickname = data.plan === 'basic' ? 'Standard' : 'Premium';
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    customer_email: user?.emailAddresses[0].emailAddress,
    success_url: `${origin}${data.callbackUrl}?success=true`,
    cancel_url: `${origin}${data.callbackUrl}?canceled=true`,
    automatic_tax: {enabled: true},
    metadata: {
      plan: planNickname,
      userId: user?.id
    },
  });
}

async function createRechargeSession(data: { amount: any; callbackUrl: any; }, user: User | null) {
  const RECHARGE_PRICE_ID = process.env.STRIPE_RECHARGE_PRICE_ID;
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
  return await stripe.checkout.sessions.create({
    line_items: [{ price: RECHARGE_PRICE_ID, quantity: data.amount }],
    mode: 'payment',
    customer_email: user?.emailAddresses[0].emailAddress,
    success_url: `${origin}${data.callbackUrl}?success=true`,
    cancel_url: `${origin}${data.callbackUrl}?canceled=true`,
    automatic_tax: {enabled: true},
    metadata: {
      paymentType: 'recharge',
      quantity: data.amount,
      userId: user?.id
    },
  });
}