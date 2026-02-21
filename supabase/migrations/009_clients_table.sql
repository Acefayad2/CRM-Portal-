-- Pantheon Migration 009: Clients table - CRM clients per workspace/user
-- Each user has their own clients within a workspace; client_shares handles sharing.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  status text not null default 'New Lead' check (status in (
    'New Lead', 'Working', 'Presentation Set', 'Follow-Up', 'Lost', 'Do Not Contact'
  )),
  stage text not null default 'Prospect' check (stage in (
    'Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'
  )),
  assigned_agent text not null default '',
  tags text[] not null default '{}',
  next_appointment timestamptz,
  last_contact timestamptz,
  notes text not null default '',
  files jsonb not null default '[]',
  contact_history jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_workspace_id_idx on clients (workspace_id);
create index if not exists clients_user_id_idx on clients (user_id);
create index if not exists clients_workspace_user_idx on clients (workspace_id, user_id);
create index if not exists clients_created_at_idx on clients (created_at desc);

alter table clients enable row level security;

-- Users can only see and manage their own clients in workspaces they belong to
create policy "clients_select" on clients for select
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "clients_insert" on clients for insert
  with check (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "clients_update" on clients for update
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );

create policy "clients_delete" on clients for delete
  using (
    is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()
  );
