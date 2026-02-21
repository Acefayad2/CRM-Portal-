-- Allow workspace invites by email (phone optional)
alter table workspace_invites alter column phone drop not null;
alter table workspace_invites add column if not exists email text;
create index if not exists workspace_invites_email_idx on workspace_invites (email) where email is not null;
