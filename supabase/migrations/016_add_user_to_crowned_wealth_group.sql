-- Add user acefayad@gmail.com (Jacob Fayad) to team "Crowned Wealth Group" as admin.
-- Prerequisite: User must already exist in auth.users (sign up in the app or create via Supabase Dashboard).

do $$
declare
  v_user_id uuid;
  v_workspace_id uuid;
  v_team_code text := 'crowned-wealth-group';
begin
  select id into v_user_id from auth.users where email = 'acefayad@gmail.com' limit 1;
  if v_user_id is null then
    raise exception 'User acefayad@gmail.com not found. Create the user in Supabase Auth (Dashboard or signup) first, then re-run this migration.';
  end if;

  select id into v_workspace_id from public.workspaces where name = 'Crowned Wealth Group' limit 1;
  if v_workspace_id is null then
    insert into public.workspaces (name, team_code, owner_id)
    values ('Crowned Wealth Group', v_team_code, v_user_id)
    returning id into v_workspace_id;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'admin')
  on conflict (workspace_id, user_id) do update set role = 'admin';
end $$;
