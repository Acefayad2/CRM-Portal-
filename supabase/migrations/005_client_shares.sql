-- Pantheon Migration 005: Client shares - send client contacts to teammates
-- Stores shared client records so recipients can view them

create table if not exists client_shares (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  client_data jsonb not null,
  created_at timestamptz default now()
);

create index if not exists client_shares_workspace_id_idx on client_shares (workspace_id);
create index if not exists client_shares_to_user_id_idx on client_shares (to_user_id);
create index if not exists client_shares_from_user_id_idx on client_shares (from_user_id);
create index if not exists client_shares_created_at_idx on client_shares (created_at desc);

alter table client_shares enable row level security;

-- Only workspace members can read shares in their workspace
create policy "client_shares_select" on client_shares for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = client_shares.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- Only workspace members can insert (share) to other members
create policy "client_shares_insert" on client_shares for insert
  with check (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = client_shares.workspace_id
        and wm.user_id = auth.uid()
    )
  );
