# KONEX verification status

## Environment

| Item | Status |
|------|--------|
| EXPO_PUBLIC_SUPABASE_URL | **EMPTY** |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | **EMPTY** |
| Live schema inspection | **NOT POSSIBLE** |
| Live RLS verification | **NOT POSSIBLE** |
| Two-account E2E | **NOT POSSIBLE** |

## Prepared artifacts (not applied to a live project)

- `supabase/migrations/20260816_konex_core_rls.sql` — tables + RLS + role protection trigger
- `supabase/migrations/20260816_storage_buckets.sql` — bucket/policy checklist
- `supabase/VERIFY.md` — operator steps

## Rule

No feature is VERIFIED until tested against a real project with the matrix below.
