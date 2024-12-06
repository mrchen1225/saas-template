import { UserCredits } from "@/types/user";
import { clerkClient } from "@clerk/nextjs/server";

// Check if the user has enough credits
export async function checkUserCredits(
  userId: string,
  count: number
): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return checkCredits(credits, count);
}

// Consume user credits
export async function consumeUserCredits(userId: string, count: number) {
  var user = await clerkClient.users.getUser(userId);
  var credits = user.privateMetadata.credits
    ? (user.privateMetadata.credits as UserCredits)
    : generateInitialUserCredits();
  try {
    if (!checkCredits(credits, count)) {
      throw new Error("Insufficient credits");
    }
    
    consumeCredits(credits, count);

    // Update credit information in user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        credits: credits,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Unknown error" };
  }
}

// Get user credits
export async function getUserCredits(userId: string): Promise<UserCredits> {
  var user = await clerkClient.users.getUser(userId);
  var credits: UserCredits;
  if (!user.privateMetadata.credits) {
    // If the user has no credit record, generate initial credits
    credits = generateInitialUserCredits();
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        credits: credits,
      },
    });
  } else {
    credits = user.privateMetadata.credits as UserCredits;
    
    // Check if subscription credits need to be reset
    if (credits.subscription) {
      const now = new Date();
      if (now >= new Date(credits.subscription.nextResetDate)) {
        // Reset credits
        credits.free = {
          total: credits.subscription.credits.total,
          used: 0,
          left: credits.subscription.credits.left,
        };
        credits.subscription.nextResetDate = getNextMonthDate();

        // Update user metadata
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            credits: credits,
          },
        });
      }
    }
  }

  return credits;
}

// Consume credits
function consumeCredits(credits: UserCredits, count: number) {
  let remainingCount = count;

  // Deduct free credits
  if (credits.free.left > 0) {
    const freeUsed = Math.min(credits.free.left, remainingCount);
    credits.free.left -= freeUsed;
    credits.free.used += freeUsed;
    remainingCount -= freeUsed;
  }
  // Deduct purchased credits
  if (remainingCount > 0 && credits.purchased?.left && credits.purchased?.left > 0) {
    const purchasedUsed = Math.min(credits.purchased.left, remainingCount);
    if (credits.purchased) {
      credits.purchased.left -= purchasedUsed;
      credits.purchased.used = (credits.purchased.used || 0) + purchasedUsed;
    }
    remainingCount -= purchasedUsed;
  }
  
  // Deduct subscription credits
  if (remainingCount > 0 && credits.subscription?.credits?.left && credits.subscription.credits.left > 0) {
    const subscriptionUsed = Math.min(credits.subscription.credits.left, remainingCount);
    if (credits.subscription && credits.subscription.credits) {
      credits.subscription.credits.left -= subscriptionUsed;
      credits.subscription.credits.used = (credits.subscription.credits.used || 0) + subscriptionUsed;
      remainingCount -= subscriptionUsed;
    }
  }
  
  // If all credits are insufficient
  if (remainingCount > 0) {
    throw new Error("Insufficient credits");
  }

  // The logic of this code is as follows:
  // 1. In the previous code, we have tried to deduct the required number of credits from free credits, purchased credits, and subscription credits.
  // 2. After each deduction, we reduce the value of remainingCount.
  // 3. If remainingCount is still greater than 0 after deducting all available credits, it means that all types of user credits combined are not enough to pay for the required amount.
  // 4. In this case, we throw an error indicating that the user's credits are insufficient to complete this operation.
  // 5. Throwing an error allows the code calling this function to know that the credit deduction failed, so appropriate measures can be taken (such as prompting the user to purchase more credits).
  // 6. This design ensures that we do not continue to execute operations that may require credits when credits are insufficient, protecting the consistency of the system.
}

// 检查积分是否足够
function checkCredits(credits: UserCredits, count: number): boolean {
  let totalCredits = credits.free.left;
  
  if (credits.purchased) {
    totalCredits += credits.purchased.left;
  }
  
  if (credits.subscription?.credits?.left) {
    totalCredits += credits.subscription.credits.left;
  }
  
  return totalCredits >= count;
}

// Generate next month's date
function getNextMonthDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Generate initial user credits
export function generateInitialUserCredits(): UserCredits {
  return {
    free: {
      total: 0,
      used: 0,
      left: 0,
    },
    subscription: undefined
  };
}

// 增加用户免费积分
export async function addFreeCredits(userId: string, amount: number) {
  var user = await clerkClient.users.getUser(userId);
  var credits = user.privateMetadata.credits
    ? (user.privateMetadata.credits as UserCredits)
    : generateInitialUserCredits();

  credits.free.total += amount;
  credits.free.left += amount;

  // 更新用户元数据中的积分信息
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      credits: credits,
    },
  });

  return credits;
}

// 充值用户积分
export async function rechargeUserCredits(userId: string, amount: number) {
  var user = await clerkClient.users.getUser(userId);
  var credits = user.privateMetadata.credits
    ? (user.privateMetadata.credits as UserCredits)
    : generateInitialUserCredits();

  if (!credits.purchased) {
    credits.purchased = {
      total: amount,
      used: 0,
      left: amount
    };
  } else {
    credits.purchased.total += amount;
    credits.purchased.left += amount;
  }

  // 更新用户元数据中的积分信息
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      credits: credits,
    },
  });

  return credits;
}

// 获取用户元数据
export async function getUserMetadata(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      success: true,
      metadata: user.privateMetadata
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "获取用户数据失败" };
  }
}

// 更新用户元数据
export async function updateUserMetadata(userId: string, metadata: any) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: metadata,
    });
    return {
      success: true,
      metadata: metadata
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "更新用户数据失败" };
  }
}

