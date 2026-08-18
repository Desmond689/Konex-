# api.video + KONEX

## Security
- API key is used ONLY in Supabase Edge Functions (`api-video-create`, `api-video-status`).
- It is NOT in EXPO_PUBLIC env or the mobile JS bundle.

## Deploy
```bash
supabase login
supabase link --project-ref chxgpshhqwbhaochwssn
supabase secrets set API_VIDEO_KEY=CKgMLCAfVYIaSKIUGRvVzWmtEfzkqsogFSg9AlwE736
supabase functions deploy api-video-create
supabase functions deploy api-video-status
```

## SQL
Run `supabase/migrations/20260818_media_assets.sql`

## Storage
Create bucket `posts` for images.

## Client flow
Video: validate → edge create → upload to api.video → poll status → thumbnail from api.video → create post
Image: validate → Supabase Storage → create post
