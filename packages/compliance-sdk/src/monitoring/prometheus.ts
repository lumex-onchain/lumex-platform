/**
 * Prometheus metrics for Lumex operational monitoring.
 *
 * TODO (wave:medium): Implement Prometheus client_nodejs integration.
 *   Expose /metrics endpoint on each service for Prometheus scraping.
 *
 * Key metrics to instrument:
 *   - lumex_deposits_total{status, corridor, asset}
 *   - lumex_deposit_duration_seconds{corridor}
 *   - lumex_withdrawals_total{status, corridor}
 *   - lumex_mt4_credit_errors_total
 *   - lumex_escrow_locks_total
 *   - lumex_aml_flags_total{risk_level}
 *   - lumex_pnl_settlements_total{zk_proof_included}
 */

export const METRIC_NAMES = {
  DEPOSITS_TOTAL:          'lumex_deposits_total',
  DEPOSIT_DURATION:        'lumex_deposit_duration_seconds',
  WITHDRAWALS_TOTAL:       'lumex_withdrawals_total',
  MT4_CREDIT_ERRORS:       'lumex_mt4_credit_errors_total',
  ESCROW_LOCKS_TOTAL:      'lumex_escrow_locks_total',
  AML_FLAGS_TOTAL:         'lumex_aml_flags_total',
  PNL_SETTLEMENTS_TOTAL:   'lumex_pnl_settlements_total',
} as const;

export function recordDeposit(_params: {
  status: string; corridor: string; asset: string;
}) {
  // TODO (wave:medium): increment lumex_deposits_total counter
}

export function recordMt4Error() {
  // TODO (wave:medium): increment lumex_mt4_credit_errors_total counter
}
