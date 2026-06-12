# Lumex API Reference

All services run locally via `npm run docker:up`. Base URLs:
- Business server: `http://localhost:3001`
- Bridge core:     `http://localhost:3002`
- Anchor Platform: `http://localhost:8080`
- Frontend:        `http://localhost:3000`

---

## Business Server (port 3001)

### `GET /health`
Returns service health. No auth required.
```json
{ "status": "ok", "service": "lumex-business-server" }
```

### `GET /sep12/customer`
Returns KYC status and required fields for a Stellar address.

Query params: `account` (Stellar address) or `id` (internal customer ID)

Auth: `Authorization: Bearer <JWT>`

```json
{
  "id": "uuid",
  "status": "NEEDS_INFO | PROCESSING | ACCEPTED | REJECTED",
  "fields": { "first_name": { "description": "...", "type": "string" } }
}
```

### `PUT /sep12/customer`
Submit KYC fields. Accepts `multipart/form-data` for document uploads.

### `DELETE /sep12/customer`
GDPR erasure. Removes PII, retains anonymised audit record.

### `GET /sep38/prices`
Returns indicative exchange rates for all corridor pairs.

Query params: `sell_asset` (optional, e.g. `iso4217:USD`), `sell_amount`

```json
{
  "buy_assets": [
    { "asset": "iso4217:NGN", "price": "1550.00", "decimals": 2 }
  ]
}
```

### `POST /sep38/quote`
Returns a firm quote valid for 60 seconds.

Body: `{ sell_asset, sell_amount, buy_asset, context }`

```json
{
  "id": "uuid",
  "expires_at": "ISO8601",
  "price": "1550.00",
  "sell_asset": "iso4217:USD",
  "sell_amount": "100",
  "buy_asset": "iso4217:NGN",
  "buy_amount": "155000",
  "fee": { "total": "0.50", "asset": "iso4217:USD" }
}
```

---

## Bridge Core (port 3002)

All endpoints require `X-Lumex-Signature` HMAC header.

### `GET /health`
Returns service health. No auth required.

### `POST /deposit/complete`
Called by Anchor Platform on deposit completion. Triggers escrow lock + MT4 credit.

Body: `DepositCallbackPayload` (see `@lumex/shared`)

```json
{ "ok": true, "mt4CreditTxId": "string" }
```

### `POST /trade/event`
Called by MT4 bridge plugin on trade close. Triggers P&L calculation.

Body: `TradeEvent` (see `@lumex/shared`)

```json
{ "ok": true, "netPnl": "95.42" }
```

### `POST /withdrawal/request`
Initiates a withdrawal from MT4 balance.

Body: `{ userId, amount, asset, bankDetails }`

```json
{ "status": "ANCHOR_SUBMITTED | MULTISIG_PENDING", "withdrawalId": "string" }
```

### `POST /withdrawal/approve`
Submit a multi-sig approval for a large withdrawal.

Body: `{ withdrawalId, signature, keyId }`

---

## Webhook signatures

All webhooks from Anchor Platform and MT4 bridge plugin must include:
```
X-Lumex-Signature: <hmac-sha256-hex>
```
Computed as: `HMAC-SHA256(WEBHOOK_SECRET, JSON.stringify(body))`

TODO (wave:medium): Add `X-Lumex-Timestamp` header and replay attack protection.

---

## Error format

All errors return:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable description"
}
```

Common error codes:
- `UNAUTHORIZED` (401) — missing or invalid signature/token
- `KYC_ERROR` (403) — user KYC insufficient for this operation
- `DEPOSIT_ERROR` (400) — invalid deposit payload
- `WITHDRAWAL_ERROR` (400) — invalid withdrawal request
- `MT4_ERROR` (502) — MetaApi / bridge plugin unavailable
- `MULTISIG_ERROR` (403) — multi-sig threshold not met
- `INTERNAL_ERROR` (500) — unexpected server error
