export const LUMEX_VERSION = '0.1.0';

export const STELLAR_NETWORK = {
  TESTNET: 'Test SDF Network ; September 2015',
  MAINNET: 'Public Global Stellar Network ; September 2015',
};

export const SUPPORTED_ASSETS = ['USDC', 'EURC', 'MGUSD'] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

export const MULTISIG_THRESHOLD_USD = 10_000;  // withdrawals above this need 2-of-3

export const SEP_ENDPOINTS = {
  DEPOSIT:  '/sep6/deposit',
  WITHDRAW: '/sep6/withdraw',
  TRANSACTION: '/sep6/transaction',
  CUSTOMER: '/sep12/customer',
  QUOTE:    '/sep38/quote',
  PRICES:   '/sep38/prices',
} as const;

/** MT4 account group names — must match your WL provider's group config */
export const MT4_GROUPS = {
  MICRO:    'retail_micro',
  STANDARD: 'retail_standard',
  PRO:      'retail_pro',
} as const;

export const DEPOSIT_EXPIRY_MINUTES = 60;
export const ESCROW_GRACE_PERIOD_LEDGERS = 100;  // ~500 seconds on Stellar
