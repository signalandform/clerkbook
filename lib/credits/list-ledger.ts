import type { SupabaseClient } from '@supabase/supabase-js';

export type LedgerEntry = {
  id: string;
  created_at: string;
  delta: number;
  reason: string;
  job_id: string | null;
  item_id: string | null;
  comparison_id: string | null;
};

/**
 * Return latest credit_ledger entries for a user (for Billing & Usage).
 */
export async function listCreditLedger(
  admin: SupabaseClient,
  userId: string,
  limit = 20
): Promise<LedgerEntry[]> {
  const { data: rows, error } = await admin
    .from('credit_ledger')
    .select('id, created_at, delta, reason, job_id, item_id, comparison_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));

  if (error || !rows) return [];
  return rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    delta: Number(r.delta),
    reason: String(r.reason),
    job_id: r.job_id ?? null,
    item_id: r.item_id ?? null,
    comparison_id: r.comparison_id ?? null,
  }));
}
