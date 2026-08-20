# KONEX Media setup

## Client (.env) — safe keys only
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

Never put SUPABASE_SERVICE_ROLE_KEY or media processor secrets in the Expo app.

## Server secrets (Supabase Dashboard → Edge Functions → Secrets)
SUPABASE_SERVICE_ROLE_KEY=...
MEDIA_PROCESSOR_API_KEY=...   # your video processor key (not in the mobile binary)

## SQL
Run: supabase/migrations/20260818_media_assets.sql

## Storage buckets
Create public (or signed) bucket: posts (and avatars, stories, etc.)

## Edge function (server-side 50MB check)
supabase functions deploy media-validate

## Client behavior implemented
- 50 MB client validation
- Image compress before upload
- Video optional auto-thumbnail (expo-video-thumbnails)
- Upload progress + cancel
- Post created only after media upload succeeds
- Media binary in Storage; metadata in media_assets when table exists
