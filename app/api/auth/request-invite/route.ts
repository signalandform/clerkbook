import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  let body: { email?: string; invite_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const inviteCode = typeof body.invite_code === 'string' ? body.invite_code.trim() : '';

  if (!email || !inviteCode) {
    return NextResponse.json(
      { error: 'Email and invite code are required' },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  const { data: row, error: fetchError } = await admin
    .from('invite_codes')
    .select('code, max_uses, uses, expires_at')
    .eq('code', inviteCode)
    .single();

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Invalid or expired invite code' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  if (row.expires_at && row.expires_at < now) {
    return NextResponse.json(
      { error: 'Invalid or expired invite code' },
      { status: 400 }
    );
  }

  if (row.uses >= row.max_uses) {
    return NextResponse.json(
      { error: 'Invalid or expired invite code' },
      { status: 400 }
    );
  }

  const { error: insertRedemptionError } = await admin
    .from('invite_redemptions')
    .insert({ code: inviteCode, email });

  if (insertRedemptionError) {
    return NextResponse.json(
      { error: 'Could not redeem invite' },
      { status: 400 }
    );
  }

  const { error: updateError } = await admin
    .from('invite_codes')
    .update({ uses: row.uses + 1 })
    .eq('code', inviteCode);

  if (updateError) {
    return NextResponse.json(
      { error: 'Could not redeem invite' },
      { status: 500 }
    );
  }

  const anon = createClient(supabaseUrl, supabaseAnonKey);
  const redirectUrl = request.headers.get('origin') || request.url.replace(/\/api\/auth\/request-invite.*/, '');
  const { error: otpError } = await anon.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${redirectUrl}/` },
  });

  if (otpError) {
    return NextResponse.json(
      { error: 'Could not send magic link. Try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Check your email for a magic link to sign in.',
  });
}
