-- Pantheon Migration 013: Generic SMS verification for personal info changes
-- Used for profile updates, etc. Code valid 5 minutes. Service role only.

create table if not exists sms_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  purpose text not null default 'profile_update',
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz default now()
);

create index if not exists sms_verification_codes_user_purpose_idx on sms_verification_codes (user_id, purpose);
create index if not exists sms_verification_codes_expires_at_idx on sms_verification_codes (expires_at);

alter table sms_verification_codes enable row level security;

create policy "sms_verification_codes_service_only" on sms_verification_codes
  for all using (false) with check (false);
