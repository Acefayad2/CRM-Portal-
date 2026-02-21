-- Pantheon Migration 003: Billing, subscriptions, and SMS management
-- Builds on workspaces from 002

-- plans: pricing tiers with limits (team, business, enterprise)
create table if not exists plans (
  id text primary key,
  price_monthly int not null,
  max_members int not null,
  max_admins int not null,
  included_sms int not null default 0,
  stripe_price_id text
);

insert into plans (id, price_monthly, max_members, max_admins, included_sms) values
  ('team', 5900, 10, 1, 250),
  ('business', 12900, 30, 3, 1000),
  ('enterprise', 29900, 100, 10, 3000)
on conflict (id) do update set
  price_monthly = excluded.price_monthly,
  max_members = excluded.max_members,
  max_admins = excluded.max_admins,
  included_sms = excluded.included_sms;

-- subscriptions: links workspace to plan and Stripe
create table if not exists subscriptions (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  plan_id text not null references plans(id),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- usage_monthly: tracks monthly SMS usage per workspace (month as date = first of month, encodes year)
create table if not exists usage_monthly (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  month date not null,
  sms_sent int not null default 0,
  primary key (workspace_id, month)
);

create index if not exists usage_monthly_workspace_id_idx on usage_monthly (workspace_id);

-- sms_credit_balance: per-workspace SMS credits from pack purchases
create table if not exists sms_credit_balance (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  balance int not null default 0,
  updated_at timestamptz default now()
);

-- sms_packs: available SMS pack products
create table if not exists sms_packs (
  id text primary key,
  sms_credits int not null,
  price_cents int not null,
  stripe_price_id text
);

insert into sms_packs (id, sms_credits, price_cents) values
  ('pack_s', 500, 1500),
  ('pack_m', 2000, 4500),
  ('pack_l', 5000, 9900)
on conflict (id) do update set
  sms_credits = excluded.sms_credits,
  price_cents = excluded.price_cents;

-- sms_purchases: purchase history for SMS packs
create table if not exists sms_purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  pack_id text not null references sms_packs(id),
  sms_credits_added int not null,
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

create index if not exists sms_purchases_workspace_id_idx on sms_purchases (workspace_id);

-- sms_logs: detailed send/receive logs per workspace
create table if not exists sms_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  to_phone text not null,
  from_phone text not null,
  body text not null,
  provider_message_id text,
  created_at timestamptz default now()
);

create index if not exists sms_logs_workspace_id_idx on sms_logs (workspace_id);
create index if not exists sms_logs_created_at_idx on sms_logs (created_at desc);

-- Enable RLS on all new tables
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table usage_monthly enable row level security;
alter table sms_credit_balance enable row level security;
alter table sms_packs enable row level security;
alter table sms_purchases enable row level security;
alter table sms_logs enable row level security;

-- RLS policies
create policy "plans_select" on plans for select using (true);

create policy "subscriptions_select" on subscriptions for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "subscriptions_all" on subscriptions for all
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "usage_monthly_select" on usage_monthly for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "usage_monthly_insert" on usage_monthly for insert
  with check (is_workspace_member(workspace_id, auth.uid()));
create policy "usage_monthly_update" on usage_monthly for update
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "sms_credit_balance_select" on sms_credit_balance for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "sms_credit_balance_all" on sms_credit_balance for all
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "sms_purchases_select" on sms_purchases for select
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "sms_logs_select" on sms_logs for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "sms_logs_insert" on sms_logs for insert
  with check (is_workspace_member(workspace_id, auth.uid()));

create policy "sms_packs_select" on sms_packs for select using (true);

-- Update join_workspace_by_code to enforce subscription and plan member limits
create or replace function join_workspace_by_code(p_team_code text, p_user_id uuid default auth.uid())
returns jsonb as $$
declare
  v_workspace workspaces%rowtype;
  v_sub subscriptions%rowtype;
  v_plan plans%rowtype;
  v_member_count int;
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

  select * into v_sub from subscriptions where workspace_id = v_workspace.id and status = 'active';
  if not found then
    return jsonb_build_object('success', false, 'error', 'Workspace has no active subscription');
  end if;

  select * into v_plan from plans where id = v_sub.plan_id;

  select count(*) into v_member_count from workspace_members where workspace_id = v_workspace.id;
  if v_member_count >= v_plan.max_members then
    return jsonb_build_object('success', false, 'error', 'Workspace has reached maximum members');
  end if;

  insert into workspace_members (workspace_id, user_id, role) values (v_workspace.id, p_user_id, 'member');

  return jsonb_build_object('success', true, 'workspace_id', v_workspace.id);
end;
$$ language plpgsql security definer;
