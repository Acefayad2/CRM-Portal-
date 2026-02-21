-- Calendar events (portal is source of truth); sync to Google/mobile via ICS feed and optional Google push
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  title text not null,
  start_time text not null,
  end_time text not null,
  date date not null,
  description text,
  location text,
  color text,
  is_visible boolean not null default true,
  is_time_block boolean not null default false,
  attendees jsonb not null default '[]',
  recurrence_pattern text,
  recurrence_end_date date,
  google_event_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists calendar_events_user_id_idx on calendar_events (user_id);
create index if not exists calendar_events_date_idx on calendar_events (date);
create index if not exists calendar_events_workspace_id_idx on calendar_events (workspace_id);

alter table calendar_events enable row level security;

create policy "calendar_events_select_own" on calendar_events for select
  using (auth.uid() = user_id);

create policy "calendar_events_insert_own" on calendar_events for insert
  with check (auth.uid() = user_id);

create policy "calendar_events_update_own" on calendar_events for update
  using (auth.uid() = user_id);

create policy "calendar_events_delete_own" on calendar_events for delete
  using (auth.uid() = user_id);

-- Feed token: private URL for ICS subscription (Apple Calendar, Google "Add by URL", etc.)
create table if not exists calendar_feed_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token text not null unique,
  created_at timestamptz default now()
);

create index if not exists calendar_feed_tokens_token_idx on calendar_feed_tokens (token);

alter table calendar_feed_tokens enable row level security;

create policy "calendar_feed_tokens_select_own" on calendar_feed_tokens for select
  using (auth.uid() = user_id);

create policy "calendar_feed_tokens_insert_own" on calendar_feed_tokens for insert
  with check (auth.uid() = user_id);

create policy "calendar_feed_tokens_update_own" on calendar_feed_tokens for update
  using (auth.uid() = user_id);

-- Google Calendar integration (OAuth tokens for push)
create table if not exists calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google' check (provider in ('google')),
  access_token text,
  refresh_token text,
  calendar_id text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider)
);

create index if not exists calendar_integrations_user_id_idx on calendar_integrations (user_id);

alter table calendar_integrations enable row level security;

create policy "calendar_integrations_select_own" on calendar_integrations for select
  using (auth.uid() = user_id);

create policy "calendar_integrations_insert_own" on calendar_integrations for insert
  with check (auth.uid() = user_id);

create policy "calendar_integrations_update_own" on calendar_integrations for update
  using (auth.uid() = user_id);

create policy "calendar_integrations_delete_own" on calendar_integrations for delete
  using (auth.uid() = user_id);
