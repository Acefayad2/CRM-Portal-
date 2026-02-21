-- Meetings: presentation meeting rooms (host + client viewer)
-- Host owns meetings and slide decks; clients join via expiring invite token.

-- 1) meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Meeting',
  status text not null default 'draft' check (status in ('draft', 'live', 'ended')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists meetings_host_user_id_idx on meetings (host_user_id);
create index if not exists meetings_status_idx on meetings (status);

-- 2) meeting_invites (guest join link)
create table if not exists meeting_invites (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  invite_token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists meeting_invites_meeting_id_idx on meeting_invites (meeting_id);
create index if not exists meeting_invites_invite_token_idx on meeting_invites (invite_token);

-- 3) slide_decks
create table if not exists slide_decks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Deck',
  created_at timestamptz not null default now()
);

create index if not exists slide_decks_owner_user_id_idx on slide_decks (owner_user_id);

-- 4) slides (one per page; storage_path = Supabase Storage path to PDF or image)
create table if not exists slides (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references slide_decks(id) on delete cascade,
  slide_index int not null,
  storage_path text not null,
  speaker_notes text,
  created_at timestamptz not null default now()
);

create index if not exists slides_deck_id_idx on slides (deck_id);
create unique index if not exists slides_deck_index_unique on slides (deck_id, slide_index);

-- 5) meeting_state (current slide; only host updates)
create table if not exists meeting_state (
  meeting_id uuid primary key references meetings(id) on delete cascade,
  current_slide_index int not null default 0,
  allow_client_navigation boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Optional: link meeting to a deck (for knowing which deck to show)
alter table meetings add column if not exists deck_id uuid references slide_decks(id) on delete set null;
create index if not exists meetings_deck_id_idx on meetings (deck_id);

-- RLS
alter table meetings enable row level security;
alter table meeting_invites enable row level security;
alter table slide_decks enable row level security;
alter table slides enable row level security;
alter table meeting_state enable row level security;

-- meetings: host can do everything
create policy "meetings_select_host" on meetings for select
  using (auth.uid() = host_user_id);

create policy "meetings_insert_host" on meetings for insert
  with check (auth.uid() = host_user_id);

create policy "meetings_update_host" on meetings for update
  using (auth.uid() = host_user_id);

create policy "meetings_delete_host" on meetings for delete
  using (auth.uid() = host_user_id);

-- meeting_invites: host can manage; no direct select for guests (guests use API with token)
create policy "meeting_invites_select_host" on meeting_invites for select
  using (exists (select 1 from meetings m where m.id = meeting_invites.meeting_id and m.host_user_id = auth.uid()));

create policy "meeting_invites_insert_host" on meeting_invites for insert
  with check (exists (select 1 from meetings m where m.id = meeting_invites.meeting_id and m.host_user_id = auth.uid()));

create policy "meeting_invites_delete_host" on meeting_invites for delete
  using (exists (select 1 from meetings m where m.id = meeting_invites.meeting_id and m.host_user_id = auth.uid()));

-- slide_decks: owner CRUD
create policy "slide_decks_select_owner" on slide_decks for select
  using (auth.uid() = owner_user_id);

create policy "slide_decks_insert_owner" on slide_decks for insert
  with check (auth.uid() = owner_user_id);

create policy "slide_decks_update_owner" on slide_decks for update
  using (auth.uid() = owner_user_id);

create policy "slide_decks_delete_owner" on slide_decks for delete
  using (auth.uid() = owner_user_id);

-- slides: via deck owner
create policy "slides_select_owner" on slides for select
  using (exists (select 1 from slide_decks d where d.id = slides.deck_id and d.owner_user_id = auth.uid()));

create policy "slides_insert_owner" on slides for insert
  with check (exists (select 1 from slide_decks d where d.id = slides.deck_id and d.owner_user_id = auth.uid()));

create policy "slides_update_owner" on slides for update
  using (exists (select 1 from slide_decks d where d.id = slides.deck_id and d.owner_user_id = auth.uid()));

create policy "slides_delete_owner" on slides for delete
  using (exists (select 1 from slide_decks d where d.id = slides.deck_id and d.owner_user_id = auth.uid()));

-- meeting_state: only host can select and update (viewers get state via API with invite token)
create policy "meeting_state_select_host" on meeting_state for select
  using (exists (select 1 from meetings m where m.id = meeting_state.meeting_id and m.host_user_id = auth.uid()));

create policy "meeting_state_insert_host" on meeting_state for insert
  with check (exists (select 1 from meetings m where m.id = meeting_state.meeting_id and m.host_user_id = auth.uid()));

create policy "meeting_state_update_host" on meeting_state for update
  using (exists (select 1 from meetings m where m.id = meeting_state.meeting_id and m.host_user_id = auth.uid()));

-- Storage: policy for bucket 'slide-decks'. Create the bucket in Dashboard (Storage) if it does not exist.
-- Path format: {user_id}/{deck_id}/{filename}.pdf so owner-only access by first path segment = auth.uid()
drop policy if exists "slide_decks_storage_owner" on storage.objects;
create policy "slide_decks_storage_owner" on storage.objects for all
using (
  bucket_id = 'slide-decks'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'slide-decks'
  and (storage.foldername(name))[1] = auth.uid()::text
);
