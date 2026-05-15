# Google Sign-In Setup

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
# Canonical public URL (metadata, invite links when unset). Production:
NEXT_PUBLIC_SITE_URL=https://pantheonportal.com
NEXT_PUBLIC_APP_URL=https://pantheonportal.com
```
For **local only**, set those two to `http://localhost:5436` instead, or omit them so the app derives the origin from the request.

## 2. Enable Google in Supabase

1. **Authentication → Providers → Google** → Enable.
2. You’ll need a **Client ID** and **Client Secret** from Google Cloud.

## 3. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select a project.
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins:**
   - `http://localhost:5436` (local — this repo’s dev server uses port **5436**)
   - `http://127.0.0.1:5436` (optional, if you open the app via 127.0.0.1)
   - `https://pantheonportal.com` (production)
6. **Authorized redirect URIs:**
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - In Supabase: **Authentication → URL Configuration** → copy the Site URL or Auth callback URL.

   Supabase callback format:  
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

7. Copy **Client ID** and **Client Secret** into Supabase **Authentication → Providers → Google**.

## 4. Supabase URL configuration

In **Authentication → URL Configuration**:

- **Site URL (local dev):** `http://localhost:5436`  
- **Site URL (production):** `https://pantheonportal.com`  
  (Switch in the dashboard when you cut over, or use separate Supabase projects for dev/prod.)

- **Redirect URLs** (add each on its own line; Supabase must allow the exact URL your app uses after OAuth):

  - `http://localhost:5436/auth/callback`
  - `http://127.0.0.1:5436/auth/callback` (optional)
  - `https://pantheonportal.com/auth/callback`

## 5. Restart the dev server

```bash
npm run dev
```

After this, “Sign in with Google” should work.
