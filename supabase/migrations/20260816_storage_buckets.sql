-- Run after creating buckets in Dashboard OR via storage API.
-- Bucket names used by KONEX: avatars, posts, stories, communities, squads, chat, tournaments, badges

-- Example policies (bucket must exist first)
-- Storage policies are per-bucket in storage.objects

-- AVATARS: users upload to folder = their uid
-- create policy "avatars read" on storage.objects for select using (bucket_id = 'avatars');
-- create policy "avatars upload own" on storage.objects for insert with check (
--   bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- For communities logos: staff only write
-- create policy "communities read" on storage.objects for select using (bucket_id = 'communities');
-- create policy "communities staff write" on storage.objects for insert with check (
--   bucket_id = 'communities' and public.is_staff()
-- );

-- MANUAL STEPS IN DASHBOARD:
-- 1. Storage → New bucket: avatars (public), posts (public), stories (public),
--    communities (public), squads (public), chat (private), tournaments (public), badges (public)
-- 2. Add policies as above
-- 3. Authentication → enable Email provider
-- 4. Create users A/B; set one users.role = 'admin' via SQL as service role:
--    update public.users set role = 'admin' where email = 'you@example.com';
