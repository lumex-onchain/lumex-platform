import { handleDepositComplete } from '../deposit/depositHandler';
import * as ledger from '../ledger/dualLedger';
import * as escrow from '../soroban/escrowClient';
import * as mt4 from '../mt4/mt4Client';

jest.mock('../ledger/dualLedger');
jest.mock('../soroban/escrowClient');
jest.mock('../mt4/mt4Client');

const mockLedger = ledger as jest.Mocked<typeof ledger>;
const mockEscrow = escrow as jest.Mocked<typeof escrow>;
const mockMt4 = mt4 as jest.Mocked<typeof mt4>;

const validPayload = {
  transaction_id: 'test-tx-001',
  stellar_transaction_id: 'stellar-hash-abc',
  kind: 'deposit' as const,
  status: 'completed' as const,
  amount_in: '100.00',
  amount_out: '100.00',
  amount_fee: '0.50',
  asset_code: 'USDC',
  to: 'GTEST123STELLARADDRESS',
  from: undefined,
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
};

describe('handleDepositComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLedger.resolveLedgerEntry.mockResolvedValue({
      userId: 'user-001',
      stellarAddress: 'GTEST123STELLARADDRESS',
      mt4AccountId: 'mt4-12345',
      kycTier: 'TIER_2',
      corridor: 'USD',
    });
    mockEscrow.lockEscrow.mockResolvedValue({ txHash: 'soroban-hash-xyz', ledger: 100 });
    mockMt4.creditMt4Account.mockResolvedValue({ txId: 'mt4-credit-001', newBalance: 100 });
    mockLedger.recordDeposit.mockResolvedValue(undefined);
  });

  it('processes a valid deposit end-to-end', async () => {
    const result = await handleDepositComplete(validPayload);
    expect(result.mt4CreditTxId).toBe('mt4-credit-001');
    expect(result.escrowTxHash).toBe('soroban-hash-xyz');
    expect(mockEscrow.lockEscrow).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-001', amount: '100.00' }),
    );
    expect(mockMt4.creditMt4Account).toHaveBeenCalledWith(
      expect.objectContaining({ mt4AccountId: 'mt4-12345', amount: 100 }),
    );
  });

  it('throws DepositError for missing amount_out', async () => {
    await expect(
      handleDepositComplete({ ...validPayload, amount_out: '' }),
    ).rejects.toMatchObject({ code: 'DEPOSIT_ERROR' });
  });

  it('throws DepositError for zero amount', async () => {
    await expect(
      handleDepositComplete({ ...validPayload, amount_out: '0' }),
    ).rejects.toMatchObject({ code: 'DEPOSIT_ERROR' });
  });

  it('throws DepositError when no ledger entry found', async () => {
    mockLedger.resolveLedgerEntry.mockResolvedValue(null);
    await expect(handleDepositComplete(validPayload)).rejects.toMatchObject({
      code: 'DEPOSIT_ERROR',
    });
  });

  // TODO (wave:high): Add idempotency test — calling with same transaction_id twice
  //   should return the same result without double-crediting MT4.
  it.todo('is idempotent for duplicate transaction_id');

  // TODO (wave:high): Add test for MT4 credit failure → escrow refund triggered
  it.todo('refunds escrow when MT4 credit fails');
});
