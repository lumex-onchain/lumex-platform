import axios from 'axios';
import { logger } from '@lumex/shared';

const CHAINALYSIS_BASE = 'https://api.chainalysis.com/api/kyt/v2';
const API_KEY = process.env.CHAINALYSIS_API_KEY ?? '';

export interface AmlScreenResult {
  address: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  cluster?: string;
  exposures?: Array<{ category: string; value: number }>;
}

/**
 * Screens a Stellar address against Chainalysis KYT (Know Your Transaction).
 * Called before processing any deposit or withdrawal.
 *
 * TODO (wave:medium): Implement full Chainalysis KYT v2 API integration.
 *   - Register transfer with POST /transfers
 *   - Poll for risk assessment result
 *   - Cache results for 24h to reduce API calls
 *   See: https://docs.chainalysis.com/api/kyt/
 *
 * TODO (wave:medium): Add configurable risk threshold — deposits from HIGH/SEVERE
 *   addresses should be flagged and held for manual review.
 *
 * TODO (wave:trivial): Write unit tests with Chainalysis API mocked.
 */
export async function screenAddress(address: string): Promise<AmlScreenResult> {
  logger.info('[aml] Screening address (STUB)', { address });

  // STUB — replace with real Chainalysis API call:
  // const res = await axios.post(`${CHAINALYSIS_BASE}/users/${address}/transfers`, {
  //   network: 'STELLAR',
  //   asset: 'XLM',
  //   transferReference: address,
  //   direction: 'RECEIVED',
  // }, { headers: { Token: API_KEY } });
  // return parseRiskResult(res.data);

  return { address, risk: 'LOW' };
}

export async function screenTransaction(txHash: string, asset: string): Promise<AmlScreenResult> {
  logger.info('[aml] Screening transaction (STUB)', { txHash, asset });
  // TODO (wave:medium): Implement transaction-level KYT screening
  return { address: txHash, risk: 'LOW' };
}
