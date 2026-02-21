-- Pantheon Migration 004: Phone verification for signup
-- Codes expire after 10 minutes. Accessible only via service role (RLS blocks all user access).
-- Note: phone_verified, phone_number, date_of_birth are stored in auth.users.user_metadata (app-managed), NOT in DB tables.

create table if not exists phone_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  code text not null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz default now()
);

create index if not exists phone_verification_codes_user_id_idx on phone_verification_codes (user_id);
create index if not exists phone_verification_codes_expires_at_idx on phone_verification_codes (expires_at);

-- RLS: enable with restrictive policy so only service role (bypasses RLS) can access
alter table phone_verification_codes enable row level security;

create policy "phone_verification_codes_service_only" on phone_verification_codes
  for all using (false) with check (false);

-- Removes expired codes; returns count deleted. Run via cron or API.
create or replace function cleanup_expired_verification_codes()
returns int as $$
declare
  deleted_count int;
begin
  delete from phone_verification_codes
  where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;
