export type WithdrawalStatus =
  | 'REQUESTED'
  | 'MULTISIG_PENDING'
  | 'ANCHOR_SUBMITTED'
  | 'BANK_PENDING'
  | 'COMPLETE'
  | 'FAILED';

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: string;
  asset: string;
  corridor: string;
  bankDetails: BankDetails;
  status: WithdrawalStatus;
  anchorWithdrawId?: string;
  multisigApprovals: string[];   // list of approving key IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  country: string;
}

/** Trade event sent by MT4 bridge plugin on position close */
export interface TradeEvent {
  mt4AccountId: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  profit: number;        // in account currency (USD)
  commission: number;
  swap: number;
  comment?: string;
}

export interface PnLRecord {
  id: string;
  userId: string;
  mt4Ticket: number;
  grossPnl: string;
  commission: string;
  swap: string;
  netPnl: string;
  settledAt?: Date;
  zkProofHash?: string;   // on-chain ZK proof reference
  createdAt: Date;
}
