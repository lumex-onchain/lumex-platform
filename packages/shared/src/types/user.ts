/** KYC trust tier mapped to MT4 account group */
export type KycTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface LumexUser {
  id: string;
  stellarAddress: string;
  mt4AccountId: string;
  kycTier: KycTier;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  corridor: CorridorCode;
  createdAt: Date;
  updatedAt: Date;
}

export type CorridorCode = 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'BRL' | 'USD' | 'EUR';

/** MT4 account group mapped from KYC tier */
export const KYC_TIER_MT4_GROUP: Record<KycTier, string> = {
  TIER_1: 'retail_micro',     // no leverage, max $500 position
  TIER_2: 'retail_standard',  // up to 1:30 leverage
  TIER_3: 'retail_pro',       // exotic pairs, institutional limits
};
