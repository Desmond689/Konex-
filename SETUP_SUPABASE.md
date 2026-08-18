# KONEX — Supabase setup (required)

Without this, auth, posts, chat, squads, and calls cannot work.

## 1. Create a project

1. Open https://supabase.com/dashboard
2. New project → pick org, name (e.g. `konex`), password, region
3. Wait until the project is healthy

## 2. Copy API keys into the app

Dashboard → **Project Settings → API**

- **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Edit `.env` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_NAME=KONEX
EXPO_PUBLIC_APP_SCHEME=konex
```

Never put the **service_role** key in the mobile app.

Restart Expo after saving `.env` (`npx expo start -c`).

## 3. Run SQL migrations (order matters)

Dashboard → **SQL Editor** → New query → paste and **Run** each file:

1. `supabase/migrations/20260816_konex_core_rls.sql`  
   Tables + RLS + profile-on-signup trigger + role protection
2. `supabase/migrations/20260816_konex_calls.sql`  
   Calls + participants + signals + RLS
3. `supabase/migrations/20260816_storage_buckets.sql`  
   Notes only — create buckets in UI (step 4)

If a statement errors because an object already exists, read the error; do not ignore auth/RLS failures.

## 4. Storage buckets

Dashboard → **Storage** → New bucket (public read is fine for avatars/logos; tighten later):

| Bucket        | Public |
|---------------|--------|
| avatars       | yes    |
| posts         | yes    |
| stories       | yes    |
| communities   | yes    |
| squads        | yes    |
| chat          | no     |
| tournaments   | yes    |
| badges        | yes    |

Policies (example for avatars): allow authenticated upload when folder = `auth.uid()`; allow public read if bucket is public.

## 5. Auth

Dashboard → **Authentication → Providers**

- Enable **Email**
- For local testing you can disable “Confirm email” under Auth → Providers → Email  
  (or confirm users manually in Auth → Users)

## 6. Realtime

Dashboard → **Database → Publications** (or table replication)

Enable Realtime for at least:

- `messages`
- `chats`
- `calls`
- `call_signals`
- `call_participants`
- `notifications` (optional)
- `posts` (optional)

## 7. First users + admin

1. Sign up two users from the app (or Auth → Users → Add)
2. Promote one admin (SQL Editor, as project owner):

```sql
update public.users
set role = 'admin'
where email = 'your-admin@email.com';
```

Normal clients cannot escalate their own `role` (trigger in core migration).

## 8. Smoke checks

```sql
select tablename from pg_tables where schemaname = 'public' order by 1;
select email, role from public.users;
```

App:

1. Sign up / login  
2. Create a post as user A  
3. Login as user B — see post if RLS allows  
4. DM A ↔ B  
5. Admin chip only for admin role  

## Status until keys + migrations are applied

| Item                         | Status              |
|-----------------------------|---------------------|
| Live API connection         | NOT VERIFIED        |
| Schema applied              | NOT VERIFIED        |
| RLS applied                 | NOT VERIFIED        |
| Storage                     | NOT VERIFIED        |
| Two-account social spine    | NOT VERIFIED        |

