# Supabase migrations

## Running migrations

With the Supabase CLI (recommended):

```bash
# Link your project (if not already)
supabase link --project-ref YOUR_REF

# Run all pending migrations
supabase db push
```

Or apply the SQL manually in the Supabase Dashboard (SQL Editor) in order:

1. `001_create_messages_table.sql`
2. `002_create_teams_tables.sql`
3. `003_workspaces_pricing_sms.sql`
4. `004_phone_verification.sql`
5. `005_client_shares.sql`
6. `006_team_chat.sql`
7. `007_courses_and_profiles.sql`
8. `008_seed_courses.sql`

## Courses and admin (007, 008)

- **007** creates `profiles`, `courses`, `modules`, `lessons`, `lesson_quiz_items`, `user_lesson_progress`, plus RLS.
- New users get a `profiles` row with `role = 'member'` via trigger. To make a user an admin, run in SQL Editor:

```sql
-- Replace YOUR_USER_UUID with the auth.users id (e.g. from Authentication > Users in dashboard)
insert into profiles (id, role)
values ('YOUR_USER_UUID', 'admin')
on conflict (id) do update set role = 'admin';
```

- **008** seeds three courses (Licensing, CFT Training, Appointment Training) with one module and lessons each, converted from the existing Resources training modules.
