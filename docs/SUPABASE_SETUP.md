# Supabase setup

## 1. Env vars

Copy the example and fill in your project values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- **NEXT_PUBLIC_SUPABASE_URL** – Project URL (Dashboard → Settings → API)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** – anon/public key (same page)
- **SUPABASE_SERVICE_ROLE_KEY** – service_role key (same page; keep secret)

Without these, auth and database calls will fail or use placeholders.

## 2. Run migrations

Apply the SQL migrations so all tables and RLS policies exist.

**Option A – Supabase Dashboard**

1. Open your project → **SQL Editor**.
2. Run each migration file in `supabase/migrations/` in order (by number: 001, 002, … 019).
3. Copy the file contents and execute.

**Option B – Supabase CLI**

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

## 3. Storage bucket for Presentations

For the **Presentations** feature (slide decks):

1. In Dashboard go to **Storage**.
2. **New bucket** → name: `slide-decks`, **Private**.
3. Save. The migration already adds the RLS policy for this bucket.

## 4. Check it works

- Sign up / log in (uses Supabase Auth).
- Open **Presentations** and click **New presentation** (uses `meetings` and `meeting_state` tables).

If you see errors like `relation "meetings" does not exist`, run the migrations (step 2).
