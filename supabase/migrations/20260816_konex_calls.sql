-- KONEX voice calls (DM 1:1 + squad voice rooms)
-- Signaling metadata only. Audio is WebRTC, not stored in Postgres.

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dm', 'squad')),
  status text not null default 'calling'
    check (status in (
      'idle','calling','ringing','connecting','connected','reconnecting',
      'ended','declined','missed','busy','failed','cancelled','no_answer','disconnected'
    )),
  caller_id uuid not null references public.users(id) on delete cascade,
  callee_id uuid references public.users(id) on delete set null,
  chat_id uuid references public.chats(id) on delete set null,
  squad_id uuid references public.squads(id) on delete set null,
  end_reason text,
  created_at timestamptz not null default now(),
  ringing_at timestamptz,
  connected_at timestamptz,
  ended_at timestamptz
);

create index if not exists idx_calls_callee_status on public.calls(callee_id, status);
create index if not exists idx_calls_caller on public.calls(caller_id, created_at desc);
create index if not exists idx_calls_squad on public.calls(squad_id, status);

create table if not exists public.call_participants (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member',
  is_muted boolean not null default false,
  is_speaking boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (call_id, user_id)
);

create table if not exists public.call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid references public.users(id) on delete cascade,
  signal_type text not null check (signal_type in (
    'offer','answer','ice','hangup','accept','decline','busy','cancel','join','leave'
  )),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_call_signals_call on public.call_signals(call_id, created_at);

alter table public.calls enable row level security;
alter table public.call_participants enable row level security;
alter table public.call_signals enable row level security;

-- Helper: is participant of call
create or replace function public.is_call_participant(p_call uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.call_participants cp
    where cp.call_id = p_call and cp.user_id = auth.uid() and cp.left_at is null
  ) or exists (
    select 1 from public.calls c
    where c.id = p_call and (c.caller_id = auth.uid() or c.callee_id = auth.uid())
  );
$$;

create or replace function public.is_squad_member(p_squad uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.squads s
    where s.id = p_squad and (
      s.leader = auth.uid()
      or s.created_by = auth.uid()
      or s.members::text like '%' || auth.uid()::text || '%'
    )
  );
$$;

-- CALLS policies
drop policy if exists calls_select on public.calls;
create policy calls_select on public.calls for select using (
  caller_id = auth.uid()
  or callee_id = auth.uid()
  or public.is_call_participant(id)
  or (type = 'squad' and squad_id is not null and public.is_squad_member(squad_id))
  or public.is_staff()
);

drop policy if exists calls_insert on public.calls;
create policy calls_insert on public.calls for insert with check (
  auth.uid() = caller_id
);

drop policy if exists calls_update on public.calls;
create policy calls_update on public.calls for update using (
  caller_id = auth.uid() or callee_id = auth.uid() or public.is_call_participant(id) or public.is_staff()
);

-- PARTICIPANTS
drop policy if exists call_participants_select on public.call_participants;
create policy call_participants_select on public.call_participants for select using (
  public.is_call_participant(call_id) or user_id = auth.uid() or public.is_staff()
);
drop policy if exists call_participants_insert on public.call_participants;
create policy call_participants_insert on public.call_participants for insert with check (
  user_id = auth.uid()
);
drop policy if exists call_participants_update on public.call_participants;
create policy call_participants_update on public.call_participants for update using (
  user_id = auth.uid() or public.is_staff()
);

-- SIGNALS: only participants
drop policy if exists call_signals_select on public.call_signals;
create policy call_signals_select on public.call_signals for select using (
  from_user = auth.uid() or to_user = auth.uid() or public.is_call_participant(call_id) or public.is_staff()
);
drop policy if exists call_signals_insert on public.call_signals;
create policy call_signals_insert on public.call_signals for insert with check (
  from_user = auth.uid() and public.is_call_participant(call_id)
);

-- Realtime: enable in dashboard for calls, call_signals, call_participants
