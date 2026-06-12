import { KycProviderResult, logger } from '@lumex/shared';

/**
 * Onfido KYC provider — alternative to Sumsub.
 * Use for markets where Onfido has stronger coverage (UK, EU).
 *
 * TODO (wave:medium): Implement Onfido SDK integration:
 *   - POST /v3.6/applicants — create applicant
 *   - POST /v3.6/sdk_tokens — generate web SDK token
 *   - Handle webhook for check completion
 *   See: https://documentation.onfido.com/
 */
export async function createOnfidoApplicant(params: {
  firstName: string;
  lastName: string;
  email?: string;
}): Promise<string> {
  logger.info('[kyc:onfido] Create applicant (STUB)', params);
  return `onfido-stub-${Date.now()}`;
}

export async function getOnfidoCheckResult(checkId: string): Promise<KycProviderResult> {
  void checkId;
  return { externalId: checkId, status: 'PENDING', tier: 'TIER_1' };
}
