import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getBalance, listCreditLedger } from '@/lib/credits';

export type UsageResponse = {
  plan: string;
  credits_balance: number;
  monthly_grant: number;
  ledger: { id: string; created_at: string; delta: number; reason: string; job_id?: string; item_id?: string; comparison_id?: string }[];
};

export async function GET() {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const balanceResult = await getBalance(admin, user.id);
  const ledger = await listCreditLedger(admin, user.id, 20);

  const response: UsageResponse = {
    plan: balanceResult.plan,
    credits_balance: Math.max(0, balanceResult.balance),
    monthly_grant: balanceResult.monthlyGrant,
    ledger: ledger.map((e) => ({
      id: e.id,
      created_at: e.created_at,
      delta: e.delta,
      reason: e.reason,
      ...(e.job_id != null && { job_id: e.job_id }),
      ...(e.item_id != null && { item_id: e.item_id }),
      ...(e.comparison_id != null && { comparison_id: e.comparison_id }),
    })),
  };

  return NextResponse.json(response);
}
