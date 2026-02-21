-- Pantheon Migration 010: Scripts table - script library per workspace/user

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in (
    'presentation', 'cold-call', 'recruiting', 'email', 'objection-handling', 'follow-up'
  )),
  content text not null default '',
  tags text[] not null default '{}',
  author text not null default 'You',
  is_template boolean not null default false,
  usage_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scripts_workspace_id_idx on scripts (workspace_id);
create index if not exists scripts_user_id_idx on scripts (user_id);
create index if not exists scripts_workspace_user_idx on scripts (workspace_id, user_id);
create index if not exists scripts_updated_at_idx on scripts (updated_at desc);

alter table scripts enable row level security;

create policy "scripts_select" on scripts for select
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "scripts_insert" on scripts for insert
  with check (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "scripts_update" on scripts for update
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "scripts_delete" on scripts for delete
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );
