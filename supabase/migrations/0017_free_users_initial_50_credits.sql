-- One-time backfill: give free users with balance 0 an initial 50 credits.
update public.user_credits
set balance = 50, updated_at = now()
where plan = 'free' and balance = 0;
