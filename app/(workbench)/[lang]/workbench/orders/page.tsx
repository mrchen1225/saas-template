'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Slider from '@/components/ui/slider';
import { Divider, Tooltip } from '@nextui-org/react';
import { FaQuestionCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function OrdersPage() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    hasPlan: false,
    plan: '',
    credits: { total: 0, used: 0, left: 0 },
    nextResetDate: new Date()
  });
  const [freeCredits, setFreeCredits] = useState({ total: 0, used: 0, left: 0 });
  const [purchasedCredits, setPurchasedCredits] = useState({ total: 0, used: 0, left: 0 });
  const [shareLink, setShareLink] = useState('');
  useEffect(() => {
    // Fetch credits and subscription information
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        if (data.subscription) {
          setSubscriptionInfo(data.subscription);
        }
        setFreeCredits(data.freeCredits || { total: 0, used: 0, left: 0 });
        setPurchasedCredits(data.purchasedCredits || { total: 0, used: 0, left: 0 });
        setCredits(
          (data.freeCredits?.left || 0) + 
          (data.purchasedCredits?.left || 0) + 
          (data.subscription?.credits?.left || 0)
        );
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleRecharge = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType: 'recharge',
          amount: rechargeAmount,
          origin: window.location.origin,
          callbackUrl: '/workbench/orders',
        }),
      });
      const { session } = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error('Recharge request failed:', error);
    }
  };

  const handleSubscribe = async (plan: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType: 'subscription',
          plan: plan.toLowerCase(),
          origin: window.location.origin,
          callbackUrl: '/workbench/orders',
        }),
      });
      const { session } = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error('Subscription request failed:', error);
    }
  };

  const handleGetShareLink = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success('Share link generated and copied to clipboard, go share it with your friends!');
        // You can add functionality to copy the link to clipboard here
        navigator.clipboard.writeText(result.shareLink);
        setShareLink(result.shareLink);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to generate share link: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate share link, please try again later');
    }
  }
  const handleHelp = async () => {
    toast.info('These credits are earned by sharing the app with friends.');
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4 text-center">User Information and Recharge</h1>
      
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Email: {user?.primaryEmailAddress?.emailAddress}</p>
          <div className="text-sm mb-2">
            Available Credits: <Badge variant="secondary" className="text-sm px-2 py-0.5">{credits}</Badge>
          </div>
          <Divider className="my-2" />
          <div className="text-sm mb-2 flex flex-wrap items-center gap-2">
            Free Credits: <Badge variant="secondary" className="text-sm px-2 py-0.5 mx-1">{freeCredits.left}/{freeCredits.total}</Badge>
              <FaQuestionCircle className="h-4 w-4 text-gray-400 cursor-help" onClick={handleHelp}/>
              <Badge variant="default" className="text-sm px-2 py-0.5 mx-1 cursor-pointer" onClick={handleGetShareLink}>Get Share Link</Badge>
              {shareLink && <span className="text-xs text-gray-500 truncate w-full mt-1">{shareLink}</span>}
          </div>
          <p className="text-sm mb-2">
            Purchased Credits: <Badge variant="secondary" className="text-sm px-2 py-0.5">{purchasedCredits.left}/{purchasedCredits.total}</Badge>
          </p>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm mb-2">
              Current Subscription: <Badge variant="secondary" className="text-sm px-2 py-0.5 mt-1 inline-block">
                {subscriptionInfo.hasPlan ? `${subscriptionInfo.plan} (${subscriptionInfo.credits.total} credits/month)` : 'None'}
              </Badge>
            </div>
            {subscriptionInfo.hasPlan && (
              <p className="text-sm mb-2">
                Next Reset Date: {new Date(subscriptionInfo.nextResetDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm mb-2">
              Subscription Credits: <Badge variant="secondary" className="text-sm px-2 py-0.5">{subscriptionInfo.credits.left}/{subscriptionInfo.credits.total}</Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Recharge Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            defaultValue={[50]}
            max={200}
            step={50}
            onValueChange={(value) => setRechargeAmount(value[0])}
            className="mb-4"
          />
          <p className="text-sm mb-3">Selected Amount: {rechargeAmount} credits</p>
          <Button size="sm" onClick={handleRecharge}>Recharge {rechargeAmount} credits</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">Subscribe to get monthly credits. Unused credits will expire at the end of each month.</p>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Card className="w-full sm:w-1/2 shadow-sm mb-4 sm:mb-0">
              <CardHeader>
                <CardTitle className="text-lg">Standard Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">100 credits/month</p>
                <p className="text-sm mb-3">$9.9/month</p>
                <Button size="sm" onClick={() => handleSubscribe('Basic')}>Subscribe to Standard Plan</Button>
              </CardContent>
            </Card>
            <Card className="w-full sm:w-1/2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Premium Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">500 credits/month</p>
                <p className="text-sm mb-3">$39/month</p>
                <Button size="sm" onClick={() => handleSubscribe('Premium')}>Subscribe to Premium Plan</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
