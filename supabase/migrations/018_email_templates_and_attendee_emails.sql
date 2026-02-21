-- Email templates per workspace (null workspace_id = system defaults)
create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  subject text not null default '',
  body_html text not null default '',
  body_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One system template per name (workspace_id null); one per-workspace override per name
create unique index if not exists email_templates_system_name_unique on email_templates (name) where workspace_id is null;
create unique index if not exists email_templates_workspace_name_unique on email_templates (workspace_id, name) where workspace_id is not null;
create index if not exists email_templates_workspace_name_idx on email_templates (workspace_id, name);

comment on column email_templates.name is 'Slug: appointment_reminder, booking_confirmation, time_slot_request, workspace_invite';
comment on column email_templates.body_html is 'HTML body; placeholders: {{clientName}}, {{date}}, {{time}}, {{title}}, {{location}}, {{requesterName}}, {{joinUrl}}, {{workspaceName}}, etc.';

-- Allow reminder/confirmation emails to attendees
alter table calendar_events add column if not exists attendee_emails jsonb not null default '[]';
comment on column calendar_events.attendee_emails is 'Array of email addresses to receive reminder/confirmation emails';

-- Seed system default templates (workspace_id null)
insert into email_templates (workspace_id, name, subject, body_html, body_text) values
  (null, 'appointment_reminder', 'Reminder: {{title}} on {{date}}', 
   '<p>Hi{{#clientName}} {{clientName}}{{/clientName}},</p><p>This is a reminder that you have an appointment <strong>{{title}}</strong> on <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p>{{#location}}<p>Location: {{location}}</p>{{/location}}<p>See you then!</p>',
   'Reminder: You have an appointment "{{title}}" on {{date}} at {{time}}. {{#location}}Location: {{location}}{{/location}}'),
  (null, 'booking_confirmation', 'Confirmed: {{title}} on {{date}}',
   '<p>Hi there,</p><p>Your meeting has been confirmed.</p><p><strong>{{title}}</strong><br/>{{date}} at {{time}}{{#location}}<br/>{{location}}{{/location}}</p>',
   'Your meeting is confirmed: {{title}} on {{date}} at {{time}}. {{#location}}Location: {{location}}{{/location}}'),
  (null, 'time_slot_request', '{{requesterName}} requested a time slot: {{date}} {{time}}',
   '<p>{{requesterName}} has requested a time slot on your calendar.</p><p><strong>{{date}}</strong>, {{time}}{{#title}} – {{title}}{{/title}}</p>{{#message}}<p>Message: {{message}}</p>{{/message}}',
   '{{requesterName}} requested a time slot: {{date}}, {{time}}. {{#title}}Title: {{title}}. {{/title}}{{#message}}Message: {{message}}{{/message}}'),
  (null, 'workspace_invite', 'You''re invited to join {{workspaceName}}',
   '<p>You''re invited to join <strong>{{workspaceName}}</strong>.</p><p><a href="{{joinUrl}}">Accept invitation</a></p><p>Or copy this link: {{joinUrl}}</p>',
   'You''re invited to join {{workspaceName}}. Accept here: {{joinUrl}}')
on conflict (name) where (workspace_id is null) do nothing;
