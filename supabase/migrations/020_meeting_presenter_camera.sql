-- Meeting presenter camera state for host/client presentation rooms.
alter table if exists meeting_state
  add column if not exists host_camera_frame text,
  add column if not exists host_camera_updated_at timestamptz,
  add column if not exists show_host_camera boolean not null default true;
