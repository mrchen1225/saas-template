export interface UserCreditRecord {
  total: number;
  used: number;
  left: number;
}

export interface UserCredits {
  free: UserCreditRecord;
  purchased?: UserCreditRecord;
  subscription?: {
    plan: string;
    credits: UserCreditRecord;
    nextResetDate: Date;
  };
}
