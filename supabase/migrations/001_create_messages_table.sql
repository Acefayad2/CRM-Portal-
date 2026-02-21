-- Pantheon Migration 001: Messages table for SMS/communication logging
-- Stores inbound and outbound messages per workspace
-- Note: Foreign key to workspaces is added in migration 002

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  phone_number text not null,
  message text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  status text not null,
  created_at timestamptz default now()
);

-- Indexes for workspace lookups, date sorting, phone and direction filters
create index if not exists messages_workspace_id_idx on messages (workspace_id);
create index if not exists messages_created_at_idx on messages (created_at desc);
create index if not exists messages_phone_number_idx on messages (phone_number);
create index if not exists messages_direction_idx on messages (direction);
