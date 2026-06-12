/**
 * Field requirements per KYC tier.
 * TIER_1 — email/phone only, micro-positions, no leverage
 * TIER_2 — full document KYC, up to 1:30 leverage
 * TIER_3 — accredited investor attestation, institutional limits
 *
 * TODO (wave:medium): Add TIER_3 fields — accredited investor attestation documents,
 * tax residency certificate, and source-of-funds declaration.
 */
export const TIER_FIELD_REQUIREMENTS = {
  TIER_1: {
    first_name:    { description: 'Legal first name',  type: 'string' },
    last_name:     { description: 'Legal last name',   type: 'string' },
    email_address: { description: 'Email address',     type: 'string' },
    phone_number:  { description: 'Mobile number',     type: 'string', optional: true },
  },
  TIER_2: {
    first_name:       { description: 'Legal first name',       type: 'string' },
    last_name:        { description: 'Legal last name',        type: 'string' },
    email_address:    { description: 'Email address',          type: 'string' },
    phone_number:     { description: 'Mobile number',          type: 'string' },
    country_code:     { description: 'Country of residence',   type: 'string' },
    id_type:          { description: 'ID document type',       type: 'string' },
    id_number:        { description: 'ID document number',     type: 'string' },
    photo_id_front:   { description: 'ID document front scan', type: 'binary' },
    photo_id_back:    { description: 'ID document back scan',  type: 'binary' },
    notarized_proof_of_address: {
      description: 'Proof of address (utility bill, bank statement)',
      type: 'binary',
      optional: true,
    },
  },
  TIER_3: {
    // TODO (wave:medium): Define TIER_3 field requirements
    // Should include: accredited investor form, source of funds, tax residency
  },
} as const;
