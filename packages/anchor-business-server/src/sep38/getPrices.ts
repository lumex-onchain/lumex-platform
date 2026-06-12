import axios from 'axios';
import { logger } from '@lumex/shared';

const FX_PROVIDER_URL = process.env.FX_PROVIDER_URL ?? 'https://openexchangerates.org/api';
const FX_API_KEY      = process.env.FX_API_KEY ?? '';

interface PricesResponse {
  buy_assets: Array<{ asset: string; price: string; decimals: number; min_amount?: string; max_amount?: string }>;
}

/**
 * Returns indicative buy/sell prices for all corridor assets.
 *
 * TODO (wave:medium): Replace stub with real provider integration.
 * TODO (wave:medium): Add Redis caching — rates should not be fetched live per-request.
 * TODO (wave:trivial): Add unit tests covering edge cases (stale cache, provider timeout).
 */
export async function getPrices(query: Record<string, string>): Promise<PricesResponse> {
  const { sell_asset, sell_amount } = query;

  // Stub — replace with live rates from FX provider
  logger.info('[sep38] getPrices called', { sell_asset, sell_amount });

  return {
    buy_assets: [
      { asset: 'iso4217:USD', price: '1.0000', decimals: 7 },
      { asset: 'iso4217:NGN', price: '1550.00', decimals: 2, min_amount: '10', max_amount: '10000000' },
      { asset: 'iso4217:KES', price: '130.00',  decimals: 2, min_amount: '10', max_amount: '5000000' },
      { asset: 'iso4217:GHS', price: '15.50',   decimals: 2, min_amount: '10', max_amount: '500000' },
      { asset: 'iso4217:ZAR', price: '18.50',   decimals: 2, min_amount: '10', max_amount: '2000000' },
      { asset: 'iso4217:BRL', price: '5.10',    decimals: 2, min_amount: '10', max_amount: '1000000' },
    ],
  };
}
