-- KONEX core schema alignment + RLS
-- Apply in Supabase SQL Editor (or CLI) on a dedicated project.
-- This matches src/api/types/database.types.ts intent used by the app services.

-- Extensions
create extension if not exists "pgcrypto";

-- ========== USERS (profile, extends auth.users) ==========
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  email text,
  phone_number text,
  profile_picture text,
  cover_photo text,
  bio text,
  country text default '',
  city text,
  region text,
  gender text,
  birth_date date,
  favorite_games text[] default '{}',
  platforms text[] default '{}',
  gaming_skills jsonb default '{}'::jsonb,
  followers text[] default '{}',
  following text[] default '{}',
  friends text[] default '{}',
  blocked text[] default '{}',
  badges text[] default '{}',
  posts text[] default '{}',
  squads text[] default '{}',
  communities text[] default '{}',
  stats jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  role text not null default 'user' check (role in ('user','moderator','admin','super_admin')),
  is_verified boolean default false,
  is_active boolean default true,
  is_suspended boolean default false,
  is_banned boolean default false,
  suspension_reason text,
  ban_reason text,
  last_active timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Prevent non-admins from changing role / ban flags via client
create or replace function public.protect_user_security_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select role into caller_role from public.users where id = auth.uid();
  if caller_role is null or caller_role not in ('admin','super_admin') then
    if new.role is distinct from old.role then
      raise exception 'Not allowed to change role';
    end if;
    if new.is_banned is distinct from old.is_banned then
      raise exception 'Not allowed to change ban status';
    end if;
    if new.is_suspended is distinct from old.is_suspended then
      raise exception 'Not allowed to change suspension';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_protect_user_security on public.users;
create trigger trg_protect_user_security
  before update on public.users
  for each row execute function public.protect_user_security_columns();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== POSTS ==========
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'text',
  category text not null default 'general',
  author uuid not null references public.users(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',
  status text not null default 'published',
  tags text[] default '{}',
  game_tags text[] default '{}',
  mentions text[] default '{}',
  likes text[] default '{}',
  comments text[] default '{}',
  shares int default 0,
  saves int default 0,
  reports text[] default '{}',
  is_pinned boolean default false,
  is_edited boolean default false,
  is_featured boolean default false,
  is_sponsored boolean default false,
  parent_post_id uuid,
  community_id uuid,
  squad_id uuid,
  tournament_id uuid,
  lfg_id uuid,
  scheduled_for timestamptz,
  stats jsonb default '{}'::jsonb,
  analytics jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_posts_author on public.posts(author);
create index if not exists idx_posts_status_created on public.posts(status, created_at desc);

-- ========== COMMENTS ==========
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author uuid not null references public.users(id) on delete cascade,
  content jsonb not null,
  parent_id uuid,
  likes text[] default '{}',
  status text default 'visible',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========== CHATS / MESSAGES ==========
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text,
  avatar text,
  participants uuid[] not null default '{}',
  last_message jsonb,
  last_message_at timestamptz,
  unread_count jsonb default '{}'::jsonb,
  status text default 'active',
  is_pinned boolean default false,
  settings jsonb default '{}'::jsonb,
  squad_id uuid,
  community_id uuid,
  created_by uuid not null references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'text',
  content jsonb not null,
  status text default 'sent',
  is_deleted boolean default false,
  is_edited boolean default false,
  reactions jsonb default '{}'::jsonb,
  reply_to uuid,
  forwarded_from uuid,
  read_by uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
create index if not exists idx_messages_chat_created on public.messages(chat_id, created_at);

-- ========== SQUADS ==========
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo text,
  cover_image text,
  description text,
  type text not null default 'public',
  game text not null default 'general',
  game_mode text not null default 'any',
  skill_level text not null default 'any',
  rank text,
  status text default 'active',
  max_members int default 10,
  members jsonb default '[]'::jsonb,
  pending_requests text[] default '{}',
  banned_members text[] default '{}',
  posts text[] default '{}',
  chat_id uuid,
  tournaments text[] default '{}',
  leader uuid not null references public.users(id),
  co_leaders uuid[] default '{}',
  moderators uuid[] default '{}',
  tags text[] default '{}',
  requirements jsonb default '{}'::jsonb,
  stats jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  is_verified boolean default false,
  is_active boolean default true,
  is_featured boolean default false,
  created_by uuid not null references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz
);

-- ========== COMMUNITIES / GAMES ==========
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo text,
  cover_image text,
  type text not null default 'game',
  category text not null default 'gaming',
  visibility text default 'public',
  game text,
  region text,
  country text,
  city text,
  rules jsonb default '{}'::jsonb,
  members jsonb default '[]'::jsonb,
  posts text[] default '{}',
  squads text[] default '{}',
  tournaments text[] default '{}',
  lfg text[] default '{}',
  moderators text[] default '{}',
  stats jsonb default '{}'::jsonb,
  tags text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  is_featured boolean default false,
  created_by uuid not null references public.users(id),
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo text,
  banner text,
  description text,
  genre text,
  platforms text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ========== LFG / TOURNAMENTS / STORIES ==========
create table if not exists public.lfg (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  game_mode text not null,
  map text,
  mode text not null default 'casual',
  skill_level text not null default 'any',
  players_needed int not null default 1,
  players_joined int not null default 1,
  current_players text[] default '{}',
  creator_id uuid not null references public.users(id),
  platform text[] default '{}',
  language text[] default '{}',
  region text not null default 'global',
  country text default '',
  description text,
  requirements jsonb default '{}'::jsonb,
  mic_required boolean default false,
  voice_chat_platform text,
  start_time timestamptz,
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  game text,
  game_id text,
  status text default 'draft',
  rules jsonb default '{}'::jsonb,
  schedule jsonb default '{}'::jsonb,
  brackets jsonb default '{}'::jsonb,
  teams jsonb default '{}'::jsonb,
  players text[] default '{}',
  community_id uuid,
  squad_id uuid,
  created_by uuid not null references public.users(id),
  moderators text[] default '{}',
  stats jsonb default '{}'::jsonb,
  is_public boolean default true,
  is_verified boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  media jsonb not null,
  text text,
  seen_by text[] default '{}',
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========== SOCIAL GRAPH ==========
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_id, following_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

-- ========== MODERATION ==========
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id),
  target_type text not null,
  target_id text not null,
  reason text,
  description text,
  status text default 'pending',
  moderator_id uuid,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  moderator_id uuid,
  action_type text not null,
  reason text,
  details text,
  target_type text,
  target_id text,
  created_at timestamptz default now()
);

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  item_type text,
  item_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  priority text default 'normal',
  status text default 'unread',
  action jsonb,
  created_at timestamptz default now(),
  read_at timestamptz,
  dismissed_at timestamptz
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  category text,
  is_active boolean default true
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  event text,
  payload jsonb,
  user_id uuid,
  created_at timestamptz default now()
);

-- ========== HELPERS ==========
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','super_admin','moderator')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','super_admin')
  );
$$;

-- ========== RLS ==========
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.squads enable row level security;
alter table public.communities enable row level security;
alter table public.lfg enable row level security;
alter table public.tournaments enable row level security;
alter table public.stories enable row level security;
alter table public.follows enable row level security;
alter table public.friend_requests enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.notifications enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.games enable row level security;
alter table public.analytics enable row level security;

-- USERS policies
drop policy if exists users_select on public.users;
create policy users_select on public.users for select using (true);
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update using (auth.uid() = id);
drop policy if exists users_staff_all on public.users;
create policy users_staff_all on public.users for all using (public.is_staff());

-- POSTS
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select using (
  status = 'published' or author = auth.uid() or public.is_staff()
);
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (auth.uid() = author);
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (auth.uid() = author or public.is_staff());
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete using (auth.uid() = author or public.is_staff());

-- COMMENTS
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select using (status = 'visible' or author = auth.uid() or public.is_staff());
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert with check (auth.uid() = author);
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update using (auth.uid() = author or public.is_staff());

-- CHATS / MESSAGES
drop policy if exists chats_select on public.chats;
create policy chats_select on public.chats for select using (
  auth.uid() = any(participants) or public.is_staff()
);
drop policy if exists chats_insert on public.chats;
create policy chats_insert on public.chats for insert with check (auth.uid() = created_by);
drop policy if exists chats_update on public.chats;
create policy chats_update on public.chats for update using (
  auth.uid() = any(participants) or public.is_staff()
);

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select using (
  exists (
    select 1 from public.chats c
    where c.id = chat_id and (auth.uid() = any(c.participants) or public.is_staff())
  )
);
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.chats c where c.id = chat_id and auth.uid() = any(c.participants)
  )
);

-- SQUADS
drop policy if exists squads_select on public.squads;
create policy squads_select on public.squads for select using (
  type = 'public' or created_by = auth.uid() or leader = auth.uid() or public.is_staff()
);
drop policy if exists squads_insert on public.squads;
create policy squads_insert on public.squads for insert with check (auth.uid() = created_by and auth.uid() = leader);
drop policy if exists squads_update on public.squads;
create policy squads_update on public.squads for update using (
  auth.uid() = leader or auth.uid() = created_by or public.is_staff()
);

-- COMMUNITIES / GAMES / LFG / TOURNAMENTS / STORIES (read public, write own)
drop policy if exists communities_select on public.communities;
create policy communities_select on public.communities for select using (true);
drop policy if exists communities_write on public.communities;
create policy communities_write on public.communities for all using (public.is_staff() or auth.uid() = created_by);

drop policy if exists games_select on public.games;
create policy games_select on public.games for select using (true);
drop policy if exists games_staff on public.games;
create policy games_staff on public.games for all using (public.is_staff());

drop policy if exists lfg_select on public.lfg;
create policy lfg_select on public.lfg for select using (true);
drop policy if exists lfg_insert on public.lfg;
create policy lfg_insert on public.lfg for insert with check (auth.uid() = creator_id);
drop policy if exists lfg_update on public.lfg;
create policy lfg_update on public.lfg for update using (auth.uid() = creator_id or public.is_staff());

drop policy if exists tournaments_select on public.tournaments;
create policy tournaments_select on public.tournaments for select using (is_public or created_by = auth.uid() or public.is_staff());
drop policy if exists tournaments_insert on public.tournaments;
create policy tournaments_insert on public.tournaments for insert with check (auth.uid() = created_by);
drop policy if exists tournaments_update on public.tournaments;
create policy tournaments_update on public.tournaments for update using (auth.uid() = created_by or public.is_staff());

drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories for select using (expires_at > now() or user_id = auth.uid() or public.is_staff());
drop policy if exists stories_insert on public.stories;
create policy stories_insert on public.stories for insert with check (auth.uid() = user_id);
drop policy if exists stories_delete on public.stories;
create policy stories_delete on public.stories for delete using (auth.uid() = user_id or public.is_staff());

-- FOLLOWS / FRIENDS / BLOCKS
drop policy if exists follows_all on public.follows;
create policy follows_all on public.follows for all using (auth.uid() = follower_id or auth.uid() = following_id);
drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists friend_requests_all on public.friend_requests;
create policy friend_requests_all on public.friend_requests for all using (auth.uid() = from_user or auth.uid() = to_user);

drop policy if exists blocks_all on public.blocks;
create policy blocks_all on public.blocks for all using (auth.uid() = blocker_id);
drop policy if exists blocks_select on public.blocks;
create policy blocks_select on public.blocks for select using (auth.uid() = blocker_id or auth.uid() = blocked_id);

-- REPORTS / MODERATION / NOTIFICATIONS
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select using (auth.uid() = reporter_id or public.is_staff());
drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports for update using (public.is_staff());

drop policy if exists moderation_actions_staff on public.moderation_actions;
create policy moderation_actions_staff on public.moderation_actions for all using (public.is_staff());

drop policy if exists moderation_queue_staff on public.moderation_queue;
create policy moderation_queue_staff on public.moderation_queue for all using (public.is_staff());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all using (auth.uid() = user_id);

drop policy if exists badges_select on public.badges;
create policy badges_select on public.badges for select using (true);
drop policy if exists badges_staff on public.badges;
create policy badges_staff on public.badges for all using (public.is_admin());

drop policy if exists user_badges_select on public.user_badges;
create policy user_badges_select on public.user_badges for select using (true);
drop policy if exists user_badges_staff on public.user_badges;
create policy user_badges_staff on public.user_badges for all using (public.is_staff());

-- Realtime (enable in Dashboard too): messages, posts, notifications
-- alter publication supabase_realtime add table messages;

