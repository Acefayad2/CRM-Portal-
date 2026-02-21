-- Pantheon Migration 007: Courses, modules, lessons, progress, and profiles (admin role)
-- Supports structured courses with modules/lessons, quiz items at timestamps, and user progress.

-- Profiles: app-wide user profile (for admin role check). Create on signup via trigger or app.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_role_idx on profiles (role);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own" on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);

-- Create profile on signup (so every user has a row; set role to 'admin' manually for admins)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'member')
  on conflict (id) do update set updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: true if current user is app admin
create or replace function is_app_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  level text,
  thumbnail_url text,
  is_published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists courses_category_idx on courses (category);
create index if not exists courses_is_published_idx on courses (is_published) where is_published = true;

-- modules
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists modules_course_id_idx on modules (course_id);
create index if not exists modules_course_sort_idx on modules (course_id, sort_order);

-- lessons
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  video_provider text,
  video_url text,
  duration_seconds int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists lessons_module_id_idx on lessons (module_id);
create index if not exists lessons_module_sort_idx on lessons (module_id, sort_order);

-- lesson_quiz_items: quiz at a specific timestamp (seconds) in the lesson video
create table if not exists lesson_quiz_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  timestamp_seconds int not null,
  question text not null,
  options jsonb not null default '[]',
  correct_option_index int not null,
  explanation text,
  created_at timestamptz default now()
);

create index if not exists lesson_quiz_items_lesson_id_idx on lesson_quiz_items (lesson_id);

-- user_lesson_progress
create table if not exists user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  last_watched_seconds int not null default 0,
  completed boolean not null default false,
  score numeric,
  attempts int not null default 0,
  updated_at timestamptz default now(),
  unique (user_id, lesson_id)
);

create index if not exists user_lesson_progress_user_id_idx on user_lesson_progress (user_id);
create index if not exists user_lesson_progress_lesson_id_idx on user_lesson_progress (lesson_id);

-- RLS: courses
alter table courses enable row level security;

create policy "courses_select_published" on courses for select
  using (is_published = true);

create policy "courses_all_admin" on courses for all
  using (is_app_admin())
  with check (is_app_admin());

-- RLS: modules (read if course is published; write admin only)
alter table modules enable row level security;

create policy "modules_select_published_course" on modules for select
  using (
    exists (
      select 1 from courses c where c.id = modules.course_id and c.is_published = true
    )
  );

create policy "modules_all_admin" on modules for all
  using (is_app_admin())
  with check (is_app_admin());

-- RLS: lessons
alter table lessons enable row level security;

create policy "lessons_select_published" on lessons for select
  using (
    exists (
      select 1 from modules m
      join courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.is_published = true
    )
  );

create policy "lessons_all_admin" on lessons for all
  using (is_app_admin())
  with check (is_app_admin());

-- RLS: lesson_quiz_items
alter table lesson_quiz_items enable row level security;

create policy "lesson_quiz_items_select_published" on lesson_quiz_items for select
  using (
    exists (
      select 1 from lessons l
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where l.id = lesson_quiz_items.lesson_id and c.is_published = true
    )
  );

create policy "lesson_quiz_items_all_admin" on lesson_quiz_items for all
  using (is_app_admin())
  with check (is_app_admin());

-- RLS: user_lesson_progress - users can only read/write their own rows
alter table user_lesson_progress enable row level security;

create policy "user_lesson_progress_select_own" on user_lesson_progress for select
  using (auth.uid() = user_id);

create policy "user_lesson_progress_insert_own" on user_lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "user_lesson_progress_update_own" on user_lesson_progress for update
  using (auth.uid() = user_id);

create policy "user_lesson_progress_delete_own" on user_lesson_progress for delete
  using (auth.uid() = user_id);

-- Allow admins to read courses/modules/lessons even when not published (for admin UI)
create policy "courses_select_admin" on courses for select
  using (is_app_admin());

create policy "modules_select_admin" on modules for select
  using (is_app_admin());

create policy "lessons_select_admin" on lessons for select
  using (is_app_admin());

create policy "lesson_quiz_items_select_admin" on lesson_quiz_items for select
  using (is_app_admin());
