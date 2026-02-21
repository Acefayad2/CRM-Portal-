-- Pantheon Migration 006: Team chat messages
-- Internal team messaging per workspace

create table if not exists team_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists team_messages_workspace_id_idx on team_messages (workspace_id);
create index if not exists team_messages_created_at_idx on team_messages (created_at desc);

alter table team_messages enable row level security;

create policy "team_messages_select" on team_messages for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = team_messages.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "team_messages_insert" on team_messages for insert
  with check (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = team_messages.workspace_id and wm.user_id = auth.uid()
    )
  );
