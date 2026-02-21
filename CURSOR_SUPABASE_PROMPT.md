# Cursor Prompt: Set Up Supabase for Pantheon

Use this prompt in Cursor to configure Supabase for the Pantheon app:

---

Set up Supabase for the Pantheon app. This is a Next.js 14 App Router project that uses Supabase Auth, Twilio SMS, and Stripe.

## 1. Database Schema & Migrations

Apply these migrations in order:
- `supabase/migrations/001_create_messages_table.sql`
- `supabase/migrations/002_create_teams_tables.sql`
- `supabase/migrations/003_workspaces_pricing_sms.sql`
- `supabase/migrations/004_phone_verification.sql`

If using Supabase CLI: run `supabase db push` or apply manually in the Supabase SQL Editor.

## 2. Auth Configuration

- Enable Email and Google OAuth providers in Supabase Dashboard
- For Google: add Client ID and Client Secret from Google Cloud Console
- Add redirect URI in Google Console: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
- Pantheon uses phone verification (SMS) for signup; new Google users complete profile with phone + birthday before verification

## 3. Environment Variables

Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
TWILIO_ACCOUNT_SID=[your Twilio SID]
TWILIO_AUTH_TOKEN=[your Twilio token]
TWILIO_PHONE_NUMBER=[or TWILIO_MESSAGING_SERVICE_SID]
STRIPE_SECRET_KEY=[for billing]
STRIPE_WEBHOOK_SECRET=[for Stripe webhooks]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[for checkout]
```

## 4. RLS Policies

Migrations include RLS for workspaces, workspace_members, subscriptions, usage_monthly, sms_credit_balance, sms_logs. The `phone_verification_codes` table is accessed via service role only.

## 5. Auth Flow

- Signup creates user with `phone_verified: false`, stores code in `phone_verification_codes`, sends SMS via Twilio
- Google OAuth: new users without phone go to `/complete-profile`; after adding phone + birthday, they verify via SMS
- Middleware redirects unverified users to `/verify-phone`

## 6. Checklist

- [ ] All four migrations applied
- [ ] Google OAuth provider enabled and configured
- [ ] All env vars set
- [ ] `join_workspace_by_code()` function works
- [ ] SMS verification sends successfully (Twilio configured)
