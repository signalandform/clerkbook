import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureUserCredits } from './ensure';
import { grantMonthlyCreditsIfDue } from './grant-monthly';

export type BalanceResult = {
  balance: number;
  resetAt: string;
  monthlyGrant: number;
  plan: string;
};

/**
 * Ensure user has a credits row, grant monthly if due, then return current balance and reset date.
 */
export async function getBalance(
  admin: SupabaseClient,
  userId: string
): Promise<BalanceResult> {
  await ensureUserCredits(admin, userId);
  await grantMonthlyCreditsIfDue(admin, userId);

  const { data: row, error } = await admin
    .from('user_credits')
    .select('balance, reset_at, monthly_grant, plan')
    .eq('user_id', userId)
    .single();

  if (error || !row) {
    return {
      balance: 0,
      resetAt: new Date().toISOString(),
      monthlyGrant: 0,
      plan: 'free',
    };
  }

  return {
    balance: Number(row.balance) ?? 0,
    resetAt: row.reset_at ?? new Date().toISOString(),
    monthlyGrant: Number(row.monthly_grant) ?? 0,
    plan: String(row.plan ?? 'free'),
  };
}
