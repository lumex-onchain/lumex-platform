import { Sep12CustomerResponse } from '@lumex/shared';

/**
 * TODO (wave:medium): Implement putCustomer — see GitHub issue #12
 * Accepts multipart form data, creates Sumsub applicant, returns PROCESSING status.
 */
export async function putCustomer(body: unknown): Promise<Sep12CustomerResponse> {
  void body;
  return { id: 'stub', status: 'PROCESSING', message: 'Implementation pending' };
}
