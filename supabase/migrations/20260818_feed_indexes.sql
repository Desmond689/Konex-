
-- Feed performance indexes
create index if not exists idx_posts_status_created_at
  on public.posts (status, created_at desc);

create index if not exists idx_posts_author_created_at
  on public.posts (author, created_at desc);

create index if not exists idx_posts_community_created_at
  on public.posts (community_id, created_at desc)
  where community_id is not null;

create index if not exists idx_posts_squad_created_at
  on public.posts (squad_id, created_at desc)
  where squad_id is not null;
