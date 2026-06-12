import { KycError } from '@lumex/shared';

/**
 * TODO (wave:trivial): Implement GDPR deleteCustomer.
 * Should nullify PII fields in users table but retain anonymised audit record.
 */
export async function deleteCustomer(query: Record<string, string>): Promise<void> {
  const { account, id } = query;
  if (!account && !id) throw new KycError('account or id required');
  // TODO: UPDATE users SET first_name=NULL, last_name=NULL, ... WHERE stellar_address=$1
}
