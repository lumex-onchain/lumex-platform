import { randomUUID } from 'crypto';

/**
 * Creates a firm quote valid for QUOTE_EXPIRY_SECONDS seconds.
 * Stores quote in DB so it can be retrieved by ID.
 *
 * TODO (wave:medium): Implement quote storage (PostgreSQL).
 * TODO (wave:medium): Apply spread and fee calculation per corridor config.
 * TODO (wave:trivial): Add input validation with express-validator.
 */
export async function getQuote(body: Record<string, unknown>) {
  const {
    sell_asset, sell_amount, buy_asset, context,
  } = body as Record<string, string>;

  const quoteId = randomUUID();
  const expiresAt = new Date(Date.now() + 60_000).toISOString(); // 60s firm quote

  // Stub — replace with DB persistence and real rate logic
  return {
    id: quoteId,
    expires_at: expiresAt,
    price: '1.0000',
    sell_asset,
    sell_amount,
    buy_asset,
    buy_amount: sell_amount,  // 1:1 stub
    fee: {
      total: '0.50',
      asset: sell_asset,
    },
  };
}

export async function getQuoteById(id: string) {
  // TODO (wave:medium): Fetch from DB, check expiry
  throw new Error(`Quote ${id} not found — DB lookup not yet implemented`);
}
