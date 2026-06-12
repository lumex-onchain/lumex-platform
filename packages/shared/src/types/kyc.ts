/** SEP-12 customer field values */
export interface Sep12CustomerFields {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  address?: string;
  country_code?: string;
  id_type?: 'drivers_license' | 'passport' | 'national_id';
  id_number?: string;
  photo_id_front?: Buffer;
  photo_id_back?: Buffer;
  notarized_proof_of_address?: Buffer;
}

export interface Sep12CustomerResponse {
  id: string;
  status: 'ACCEPTED' | 'PROCESSING' | 'NEEDS_INFO' | 'REJECTED';
  fields?: Record<string, { description: string; type: string; optional?: boolean }>;
  provided_fields?: Record<string, { description: string; type: string; status: string }>;
  message?: string;
}

export interface KycProviderResult {
  externalId: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  rejectionReason?: string;
  completedAt?: Date;
}
