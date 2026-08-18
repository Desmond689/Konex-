# KONEX Supabase setup

This app cannot create your cloud project for you. In the Supabase SQL editor:

1. Ensure tables match `src/api/types/database.types.ts` (especially `squads.leader`, `squads.members`, `posts`, `messages`, `users.role`).
2. Enable RLS on all public tables.
3. Example policies (adjust to your schema):

```sql
-- users: read public profiles, update own
alter table users enable row level security;
create policy "read users" on users for select using (true);
create policy "update own user" on users for update using (auth.uid() = id);

-- posts
alter table posts enable row level security;
create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author_id);

-- messages
alter table messages enable row level security;
create policy "read own messages" on messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id or squad_id is not null
);
create policy "send messages" on messages for insert with check (auth.uid() = sender_id);

-- Admin: set users.role = 'admin' | 'super_admin' only via service role / dashboard
-- Frontend AdminNavigator checks profile.role — always enforce admin writes with RLS too
```

4. Put `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.
5. Test with two accounts (Test 1–7 in project docs).
