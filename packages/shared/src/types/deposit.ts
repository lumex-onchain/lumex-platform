export type DepositStatus =
  | 'INITIATED'
  | 'KYC_PENDING'
  | 'AWAITING_BANK'
  | 'ESCROW_LOCKED'
  | 'MT4_CREDITED'
  | 'COMPLETE'
  | 'FAILED';

export interface DepositRecord {
  id: string;
  userId: string;
  stellarTxHash?: string;
  anchorTransactionId: string;
  amount: string;        // decimal string, e.g. "100.00"
  asset: string;         // e.g. "USDC", "MGUSD", "EURC"
  corridor: string;
  status: DepositStatus;
  mt4CreditTxId?: string;
  sorobanEscrowTxHash?: string;
  bankConfirmationRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload sent by Stellar Anchor Platform on deposit completion */
export interface DepositCallbackPayload {
  transaction_id: string;
  stellar_transaction_id?: string;
  kind: 'deposit';
  status: 'completed' | 'pending_external' | 'error';
  amount_in: string;
  amount_out: string;
  amount_fee: string;
  asset_code: string;
  to: string;       // user's Stellar address
  from?: string;
  started_at: string;
  completed_at?: string;
  external_extra?: string;
}
