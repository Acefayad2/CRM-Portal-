-- Calendar appointment reminders: link to CRM client and track reminder sent; store attendee phones for SMS.
alter table calendar_events
  add column if not exists client_id uuid references clients(id) on delete set null,
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists attendee_phones jsonb not null default '[]';

create index if not exists calendar_events_client_id_idx on calendar_events (client_id);
create index if not exists calendar_events_reminder_sent_at_idx on calendar_events (reminder_sent_at) where reminder_sent_at is null;

comment on column calendar_events.client_id is 'Optional CRM client for this appointment (receives reminder SMS)';
comment on column calendar_events.reminder_sent_at is 'When the 24h-before reminder was sent (null = not yet sent)';
comment on column calendar_events.attendee_phones is 'Array of E.164 phone numbers for other parties to receive reminder SMS';
