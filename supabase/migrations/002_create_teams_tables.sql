-- Pantheon Migration 002: Workspace and team management
-- Workspaces are teams that agents join via team_code (invite code)

-- workspaces: each workspace has an owner and unique team_code for joining
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  team_code text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- workspace_members: links users to workspaces with role
create table if not exists workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  primary key (workspace_id, user_id)
);

-- Indexes for performance
create index if not exists workspaces_owner_id_idx on workspaces (owner_id);
create index if not exists workspaces_team_code_idx on workspaces (team_code);
create index if not exists workspace_members_user_id_idx on workspace_members (user_id);
create index if not exists workspace_members_workspace_id_idx on workspace_members (workspace_id);

-- Add FK from messages.workspace_id to workspaces (messages created in 001)
alter table messages
  add constraint messages_workspace_id_fkey
  foreign key (workspace_id) references workspaces(id) on delete cascade;

-- Helper: returns true if user is a member of the workspace
create or replace function is_workspace_member(ws_id uuid, u_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspace_members where workspace_id = ws_id and user_id = u_id
  );
$$ language sql security definer stable;

-- Enable RLS on all tables
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table messages enable row level security;

-- RLS: workspaces - members can read, owner can insert
create policy "workspaces_select" on workspaces for select
  using (is_workspace_member(id, auth.uid()));

create policy "workspaces_insert" on workspaces for insert
  with check (owner_id is null or auth.uid() = owner_id);

create policy "workspaces_update" on workspaces for update
  using (is_workspace_member(id, auth.uid()));

-- RLS: workspace_members - members can read and manage
create policy "workspace_members_select" on workspace_members for select
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "workspace_members_insert" on workspace_members for insert
  with check (is_workspace_member(workspace_id, auth.uid()));

create policy "workspace_members_update" on workspace_members for update
  using (is_workspace_member(workspace_id, auth.uid()));

-- RLS: messages - workspace members can read and insert
create policy "messages_select" on messages for select
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "messages_insert" on messages for insert
  with check (is_workspace_member(workspace_id, auth.uid()));

-- Basic join function (003 adds subscription/plan limit checks)
create or replace function join_workspace_by_code(p_team_code text, p_user_id uuid default auth.uid())
returns jsonb as $$
declare
  v_workspace workspaces%rowtype;
begin
  if p_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_workspace from workspaces where lower(trim(team_code)) = lower(trim(p_team_code));
  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid team code');
  end if;

  if exists (select 1 from workspace_members where workspace_id = v_workspace.id and user_id = p_user_id) then
    return jsonb_build_object('success', false, 'error', 'Already a member');
  end if;

  insert into workspace_members (workspace_id, user_id, role) values (v_workspace.id, p_user_id, 'member');

  return jsonb_build_object('success', true, 'workspace_id', v_workspace.id);
end;
$$ language plpgsql security definer;
