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
```

## 2. Enable Google in Supabase

1. **Authentication → Providers → Google** → Enable.
2. You’ll need a **Client ID** and **Client Secret** from Google Cloud.

## 3. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select a project.
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins:**
   - `http://localhost:3000` (local)
   - `https://yourdomain.com` (production)
6. **Authorized redirect URIs:**
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - In Supabase: **Authentication → URL Configuration** → copy the Site URL or Auth callback URL.

   Supabase callback format:  
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

7. Copy **Client ID** and **Client Secret** into Supabase **Authentication → Providers → Google**.

## 4. Supabase URL configuration

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (local) or `https://yourdomain.com`
- **Redirect URLs**: add `http://localhost:3000/auth/callback` and your production callback URL.

## 5. Restart the dev server

```bash
npm run dev
```

After this, “Sign in with Google” should work.
