import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('user_settings')
    .select('has_completed_onboarding')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Could not load settings' }, { status: 500 });
  }

  return NextResponse.json({
    has_completed_onboarding: data?.has_completed_onboarding ?? false,
  });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { has_completed_onboarding?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const hasCompleted =
    typeof body.has_completed_onboarding === 'boolean' ? body.has_completed_onboarding : undefined;
  if (hasCompleted === undefined) {
    return NextResponse.json({ error: 'has_completed_onboarding is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from('user_settings').upsert(
    {
      user_id: user.id,
      has_completed_onboarding: hasCompleted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Could not update settings' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
