# KONEX live verification

## Blocker

This environment has:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

**No live tests can PASS until you set real values.**

## Steps for you

1. Create a Supabase project.
2. Paste URL + anon key into `.env`.
3. Run `supabase/migrations/20260816_konex_core_rls.sql` in SQL Editor.
4. Create Storage buckets (see `20260816_storage_buckets.sql`).
5. Enable Realtime for `messages` (and optionally `posts`, `notifications`).
6. Create Account A, B; promote one admin:
   `update public.users set role = 'admin' where email = '...';`
7. Run the two-account checklist and fill the matrix in the reply / VERIFICATION.md.

## What the agent cannot do without credentials

- Inspect your real DB
- Apply RLS on your project
- Run two-account auth/chat/post tests
- Verify Storage policies on your project
