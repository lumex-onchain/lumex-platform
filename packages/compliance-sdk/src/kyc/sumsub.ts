import axios from 'axios';
import crypto from 'crypto';
import { KycProviderResult, logger } from '@lumex/shared';

const SUMSUB_BASE   = 'https://api.sumsub.com';
const APP_TOKEN     = process.env.SUMSUB_APP_TOKEN ?? '';
const SECRET_KEY    = process.env.SUMSUB_SECRET_KEY ?? '';

/**
 * Creates a Sumsub applicant for a new user.
 *
 * TODO (wave:medium): Implement full Sumsub SDK integration:
 *   - Create applicant with POST /resources/applicants
 *   - Generate access token for web SDK
 *   - Handle webhook for status updates (COMPLETED, rejected, etc.)
 *   - Map Sumsub review result to Lumex KYC tier
 *   See: https://developers.sumsub.com/api-reference/
 *
 * TODO (wave:trivial): Add HMAC signature generation for all Sumsub API calls.
 */
export async function createApplicant(params: {
  externalUserId: string;
  levelName: string;
  email?: string;
  phone?: string;
}): Promise<string> {
  logger.info('[kyc:sumsub] Creating applicant (STUB)', { userId: params.externalUserId });
  // STUB — replace with real Sumsub POST /resources/applicants
  return `sumsub-stub-${Date.now()}`;
}

export async function getApplicantStatus(applicantId: string): Promise<KycProviderResult> {
  logger.info('[kyc:sumsub] Getting applicant status (STUB)', { applicantId });
  // TODO (wave:medium): GET /resources/applicants/{applicantId}/status
  return {
    externalId: applicantId,
    status: 'PENDING',
    tier: 'TIER_1',
  };
}

export async function generateAccessToken(userId: string, levelName: string): Promise<string> {
  // TODO (wave:medium): POST /resources/accessTokens — returns short-lived token for web SDK
  logger.info('[kyc:sumsub] Generating access token (STUB)', { userId, levelName });
  return `stub-token-${Date.now()}`;
}

function buildSignature(method: string, url: string, body: string, ts: number): string {
  const data = `${ts}${method.toUpperCase()}${url}${body}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
}
