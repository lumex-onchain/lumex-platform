import { Mt4Error, logger } from '@lumex/shared';

/**
 * Thin wrapper around the MetaApi SDK for MT4/5 account operations.
 *
 * MetaApi abstracts the raw MetaTrader Manager API into a clean REST/WebSocket interface.
 * In production, replace with direct Manager API C++ binding if vendor-specific features needed.
 *
 * TODO (wave:high): Implement full MetaApi SDK integration.
 *   - Connect to MetaApi cloud account
 *   - Implement creditMt4Account using MetaApi MetaTrader account management API
 *   - Add connection health check and auto-reconnect
 *   See: https://metaapi.cloud/docs/client/
 *
 * TODO (wave:medium): Add circuit breaker pattern — if MT4 API fails N times,
 *   stop trying and alert ops rather than hammering a broken connection.
 *
 * TODO (wave:trivial): Write unit tests with MetaApi SDK mocked.
 */

export interface Mt4CreditResult {
  txId: string;
  newBalance: number;
}

export async function creditMt4Account(params: {
  mt4AccountId: string;
  amount: number;
  comment: string;
}): Promise<Mt4CreditResult> {
  logger.info('[mt4] Crediting account (STUB)', params);

  // STUB — replace with real MetaApi call:
  //
  // const metaApi = new MetaApi(process.env.METAAPI_TOKEN);
  // const account = await metaApi.metatraderAccountApi.getAccount(params.mt4AccountId);
  // const connection = account.getRPCConnection();
  // await connection.connect();
  // const result = await connection.createDeal({
  //   symbol: 'DEPOSIT',
  //   actionType: 'DEAL_TYPE_BALANCE',
  //   volume: params.amount,
  //   comment: params.comment,
  // });
  // return { txId: result.id, newBalance: result.balance };

  return {
    txId: `mt4-stub-${Date.now()}`,
    newBalance: params.amount,
  };
}

export async function debitMt4Account(params: {
  mt4AccountId: string;
  amount: number;
  comment: string;
}): Promise<Mt4CreditResult> {
  logger.info('[mt4] Debiting account (STUB)', params);
  // TODO (wave:high): Implement debit via MetaApi SDK (same pattern as credit)
  return {
    txId: `mt4-debit-stub-${Date.now()}`,
    newBalance: 0,
  };
}

export async function getMt4Balance(mt4AccountId: string): Promise<number> {
  // TODO (wave:medium): Fetch live balance from MetaApi
  void mt4AccountId;
  return 0;
}

export async function createMt4Account(params: {
  name: string;
  group: string;
  currency: string;
  leverage: number;
}): Promise<string> {
  // TODO (wave:high): Create MT4 account via bridge plugin REST API
  // Returns new mt4AccountId
  void params;
  return `demo-${Date.now()}`;
}
