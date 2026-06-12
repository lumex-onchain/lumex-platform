export class LumexError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'LumexError';
  }
}

export class KycError extends LumexError {
  constructor(message: string) {
    super(message, 'KYC_ERROR', 403);
    this.name = 'KycError';
  }
}

export class DepositError extends LumexError {
  constructor(message: string) {
    super(message, 'DEPOSIT_ERROR', 400);
    this.name = 'DepositError';
  }
}

export class WithdrawalError extends LumexError {
  constructor(message: string) {
    super(message, 'WITHDRAWAL_ERROR', 400);
    this.name = 'WithdrawalError';
  }
}

export class Mt4Error extends LumexError {
  constructor(message: string) {
    super(message, 'MT4_ERROR', 502);
    this.name = 'Mt4Error';
  }
}

export class MultisigError extends LumexError {
  constructor(message: string) {
    super(message, 'MULTISIG_ERROR', 403);
    this.name = 'MultisigError';
  }
}
