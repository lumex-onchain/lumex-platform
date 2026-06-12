import { LumexUser } from '@lumex/shared';

/**
 * TODO (wave:medium): Implement full PostgreSQL data access layer.
 * Use `pg` Pool with connection string from DATABASE_URL env var.
 * All queries must use parameterised statements — no string interpolation.
 */
export async function getUserByStellarAddress(address: string): Promise<LumexUser | null> {
  // Stub — replace with real DB query
  void address;
  return null;
}

export async function upsertUser(user: Partial<LumexUser>): Promise<LumexUser> {
  // TODO (wave:medium): Implement upsert with conflict resolution on stellar_address
  throw new Error('upsertUser not yet implemented');
}
