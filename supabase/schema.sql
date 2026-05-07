-- =============================================================================
-- today-office (오늘도 출근합니다) — Supabase 스키마
-- =============================================================================
-- 사용 방법:
--   1) supabase 프로젝트 생성
--   2) Dashboard → SQL Editor 에서 이 파일 전체를 복사 → 실행
--   3) Database → Replication 에서 messages, likes 테이블의 Realtime 활성화 확인
--      (이 스크립트가 publication 도 자동 등록함)
-- =============================================================================

-- gen_random_uuid() 사용을 위해
create extension if not exists pgcrypto;

-- =============================================================================
-- messages: 10초 휘발 메시지
-- =============================================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  nickname    text not null,
  content     text not null check (char_length(content) between 1 and 40),
  line_id     text not null,
  car_id      int  not null,
  slot_index  int  not null default -1,
  avatar      jsonb not null,
  items       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  like_count  int  not null default 0
);

-- 활성 메시지 빠르게 조회
create index if not exists messages_active_idx
  on public.messages (line_id, car_id, expires_at desc);

-- =============================================================================
-- likes: 같은 기기에서 중복 좋아요 방지
-- =============================================================================
create table if not exists public.likes (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

-- =============================================================================
-- 좋아요 카운터 (트리거)
-- =============================================================================
create or replace function public.bump_like_count()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.messages
     set like_count = like_count + 1
   where id = new.message_id;
  return new;
end;
$$;

drop trigger if exists likes_after_insert on public.likes;
create trigger likes_after_insert
  after insert on public.likes
  for each row execute function public.bump_like_count();

-- =============================================================================
-- RLS — 익명 앱이므로 anon 키로 read/insert 허용
-- =============================================================================
alter table public.messages enable row level security;
alter table public.likes    enable row level security;

drop policy if exists "messages select anon" on public.messages;
create policy "messages select anon"
  on public.messages for select
  using (true);

drop policy if exists "messages insert anon" on public.messages;
create policy "messages insert anon"
  on public.messages for insert
  with check (
    char_length(content) between 1 and 40
    and expires_at > now()
    and expires_at < now() + interval '30 seconds'
  );

drop policy if exists "likes select anon" on public.likes;
create policy "likes select anon"
  on public.likes for select
  using (true);

drop policy if exists "likes insert anon" on public.likes;
create policy "likes insert anon"
  on public.likes for insert
  with check (true);

-- =============================================================================
-- 테이블 GRANT — RLS 만으론 부족, base 권한도 필요
-- =============================================================================
grant usage on schema public to anon;
grant select, insert on public.messages to anon;
grant select, insert on public.likes to anon;

-- =============================================================================
-- Realtime publication 등록
-- (Supabase 는 supabase_realtime 라는 publication 을 기본 제공)
-- =============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and tablename = 'likes'
  ) then
    execute 'alter publication supabase_realtime add table public.likes';
  end if;
end $$;

-- =============================================================================
-- (선택) 만료 메시지 자동 정리 — pg_cron 활성화 후 사용 가능
-- supabase Dashboard → Database → Extensions 에서 pg_cron 활성화
-- =============================================================================
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'cleanup-expired-messages',
--   '*/5 * * * *',
--   $$delete from public.messages where expires_at < now() - interval '10 minutes'$$
-- );
