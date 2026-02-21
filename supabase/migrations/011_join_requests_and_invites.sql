-- Pantheon Migration 011: Join requests (admin approval) and SMS invites
-- 1) User submits team code -> pending request; admin accepts/rejects.
-- 2) Admin sends SMS invite -> link with token; recipient signs up/logs in and joins.

-- Join requests: user requested to join with team code; admin must accept
create table if not exists workspace_join_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  responded_by uuid references auth.users(id) on delete set null,
  unique (workspace_id, user_id)
);

create index if not exists workspace_join_requests_workspace_id_idx on workspace_join_requests (workspace_id);
create index if not exists workspace_join_requests_user_id_idx on workspace_join_requests (user_id);
create index if not exists workspace_join_requests_status_idx on workspace_join_requests (status);

alter table workspace_join_requests enable row level security;

-- Workspace admins can see and update join requests for their workspace
create policy "workspace_join_requests_select" on workspace_join_requests for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_join_requests.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "workspace_join_requests_insert" on workspace_join_requests for insert
  with check (user_id = auth.uid());

create policy "workspace_join_requests_update" on workspace_join_requests for update
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_join_requests.workspace_id
        and wm.user_id = auth.uid() and wm.role = 'admin'
    )
  );

-- SMS invites: token in link; when used, add user to workspace
create table if not exists workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  phone text not null,
  token text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists workspace_invites_workspace_id_idx on workspace_invites (workspace_id);
create index if not exists workspace_invites_token_idx on workspace_invites (token);
create index if not exists workspace_invites_expires_at_idx on workspace_invites (expires_at);

alter table workspace_invites enable row level security;

create policy "workspace_invites_select_own_workspace" on workspace_invites for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "workspace_invites_insert_admin" on workspace_invites for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id and wm.user_id = auth.uid() and wm.role = 'admin'
    )
  );

create policy "workspace_invites_update" on workspace_invites for update
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id and wm.user_id = auth.uid()
    )
  );

-- RPC: request to join workspace (creates pending request; does not add to workspace_members)
create or replace function request_to_join_workspace(p_team_code text, p_user_id uuid default auth.uid())
returns jsonb as $$
declare
  v_workspace workspaces%rowtype;
  v_sub subscriptions%rowtype;
  v_plan plans%rowtype;
  v_member_count int;
  v_pending_count int;
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

  if exists (select 1 from workspace_join_requests where workspace_id = v_workspace.id and user_id = p_user_id and status = 'pending') then
    return jsonb_build_object('success', false, 'error', 'You already have a pending request for this team');
  end if;

  select * into v_sub from subscriptions where workspace_id = v_workspace.id and status = 'active';
  if not found then
    return jsonb_build_object('success', false, 'error', 'Workspace has no active subscription');
  end if;

  select * into v_plan from plans where id = v_sub.plan_id;
  select count(*) into v_member_count from workspace_members where workspace_id = v_workspace.id;
  select count(*) into v_pending_count from workspace_join_requests where workspace_id = v_workspace.id and status = 'pending';

  if (v_member_count + v_pending_count) >= v_plan.max_members then
    return jsonb_build_object('success', false, 'error', 'Workspace has reached maximum members');
  end if;

  insert into workspace_join_requests (workspace_id, user_id, status)
  values (v_workspace.id, p_user_id, 'pending')
  on conflict (workspace_id, user_id) do update set status = 'pending', requested_at = now();

  return jsonb_build_object('success', true, 'workspace_id', v_workspace.id, 'pending', true);
end;
$$ language plpgsql security definer;
