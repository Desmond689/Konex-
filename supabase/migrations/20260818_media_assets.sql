create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid,
  media_type text not null check (media_type in ('image', 'video')),
  bucket text not null default 'posts',
  storage_path text not null default '',
  public_url text not null,
  thumbnail_url text,
  thumbnail_path text,
  video_id text,
  duration_sec numeric,
  file_size bigint not null check (file_size > 0 and file_size <= 52428800),
  width int,
  height int,
  mime_type text,
  status text not null default 'ready'
    check (status in ('uploading','processing','ready','failed','cancelled','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_media_assets_user on public.media_assets(user_id);
alter table public.media_assets enable row level security;

drop policy if exists media_assets_select on public.media_assets;
create policy media_assets_select on public.media_assets for select using (
  status in ('ready','processing') or user_id = auth.uid()
);
drop policy if exists media_assets_insert on public.media_assets;
create policy media_assets_insert on public.media_assets for insert with check (
  auth.uid() = user_id and file_size <= 52428800
);
