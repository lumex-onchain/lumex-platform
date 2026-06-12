import { Sep12CustomerResponse, KycError } from '@lumex/shared';
import { getUserByStellarAddress } from '../utils/db';
import { TIER_FIELD_REQUIREMENTS } from './tierRequirements';

/**
 * Returns KYC status and required fields for a given Stellar address.
 * The Anchor Platform calls this before allowing deposits or withdrawals.
 *
 * TODO (wave:medium): Add caching layer to reduce DB queries per request.
 * TODO (wave:medium): Implement webhook-based KYC status push to reduce polling.
 */
export async function getCustomer(
  query: Record<string, string>,
): Promise<Sep12CustomerResponse> {
  const { account, memo, memo_type, id } = query;

  if (!account && !id) {
    throw new KycError('Either account or id must be provided');
  }

  const user = await getUserByStellarAddress(account ?? id);

  if (!user) {
    // New user — return required fields for TIER_1
    return {
      id: 'new',
      status: 'NEEDS_INFO',
      fields: TIER_FIELD_REQUIREMENTS.TIER_1,
    };
  }

  if (user.kycStatus === 'APPROVED') {
    return {
      id: user.id,
      status: 'ACCEPTED',
      provided_fields: buildProvidedFields(user.kycTier),
    };
  }

  if (user.kycStatus === 'REJECTED') {
    return {
      id: user.id,
      status: 'REJECTED',
      message: 'KYC verification failed. Contact support.',
    };
  }

  return {
    id: user.id,
    status: 'PROCESSING',
    message: 'KYC verification in progress.',
  };
}

function buildProvidedFields(tier: string) {
  return {
    first_name: { description: 'Legal first name', type: 'string', status: 'ACCEPTED' },
    last_name:  { description: 'Legal last name',  type: 'string', status: 'ACCEPTED' },
    email_address: { description: 'Email address', type: 'string', status: 'ACCEPTED' },
    ...(tier !== 'TIER_1' ? {
      photo_id_front: { description: 'Government ID front', type: 'binary', status: 'ACCEPTED' },
      photo_id_back:  { description: 'Government ID back',  type: 'binary', status: 'ACCEPTED' },
    } : {}),
  };
}
