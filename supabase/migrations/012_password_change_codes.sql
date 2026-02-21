-- Pantheon Migration 012: Password change verification via SMS
-- Code sent to user's phone; valid for 5 minutes. Service role only (RLS blocks all).

create table if not exists password_change_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz default now()
);

create unique index if not exists password_change_codes_user_id_idx on password_change_codes (user_id);
create index if not exists password_change_codes_expires_at_idx on password_change_codes (expires_at);

alter table password_change_codes enable row level security;

create policy "password_change_codes_service_only" on password_change_codes
  for all using (false) with check (false);
