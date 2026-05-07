-- =============================================================================
-- Migration 001 — 서버측 보안 강화
-- =============================================================================
-- 적용 방법: Supabase Dashboard → SQL Editor → New query → 전체 복사 → Run
--
-- 무엇이 추가되나:
--   1. 욕설/PII/길이 검증 trigger (BEFORE INSERT)
--   2. 같은 user_id 6초내 재INSERT 차단 (rate limit)
--   3. 위 둘은 클라이언트 우회 방지용 마지막 방어선
--
-- 멱등 — 여러 번 실행해도 안전.
-- =============================================================================

-- =============================================================================
-- 1. 메시지 내용 검증 trigger
-- =============================================================================
create or replace function public.check_message_clean()
returns trigger
language plpgsql
as $$
declare
  normalized text;
  bad_word text;
  bad_words text[] := array[
    '씨발', '시발', 'ㅅㅂ', '병신', 'ㅂㅅ', '개새끼', '지랄', '꺼져',
    '좆', '존나', '씹새', '미친년', '미친놈', 'ㅈㄴ', '조까'
  ];
begin
  -- 1) 길이 가드 (DB CHECK 외에 명시적 에러 메시지용)
  if char_length(new.content) < 1 or char_length(new.content) > 40 then
    raise exception 'CONTENT_LENGTH_INVALID' using errcode = '22001';
  end if;

  -- 2) PII 패턴 차단
  --    전화번호 / 이메일 / SNS 유도 (인스타, 카톡, 텔레그램 등)
  if new.content ~ '\m\d{2,3}-?\d{3,4}-?\d{4}\M' then
    raise exception 'PII_PHONE_DETECTED' using errcode = '22000';
  end if;
  if new.content ~* '[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}' then
    raise exception 'PII_EMAIL_DETECTED' using errcode = '22000';
  end if;
  if new.content ~* '(인스타|insta|카톡|kakao|텔레|telegram|디스코드|discord)\s*[:：]?\s*\S+' then
    raise exception 'PII_SNS_DETECTED' using errcode = '22000';
  end if;
  -- 주민번호 패턴
  if new.content ~ '\m\d{6}-?\d{7}\M' then
    raise exception 'PII_RRN_DETECTED' using errcode = '22000';
  end if;

  -- 3) 욕설 매칭 (공백 제거 후 매칭)
  normalized := lower(regexp_replace(new.content, '\s+', '', 'g'));
  foreach bad_word in array bad_words loop
    if position(bad_word in normalized) > 0 then
      raise exception 'INAPPROPRIATE_CONTENT' using errcode = '22000';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists messages_check_clean on public.messages;
create trigger messages_check_clean
  before insert on public.messages
  for each row execute function public.check_message_clean();


-- =============================================================================
-- 2. 쿨타임 (서버측 rate limit)
--    같은 user_id 가 6초 내 재INSERT 시도하면 차단.
--    클라이언트는 8초로 잡혀있어 정상 사용은 통과, 봇/우회만 차단.
-- =============================================================================
create or replace function public.check_message_rate()
returns trigger
language plpgsql
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
    from public.messages
   where user_id = new.user_id
     and created_at > now() - interval '6 seconds';

  if recent_count > 0 then
    raise exception 'RATE_LIMITED' using errcode = '23P01';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_check_rate on public.messages;
create trigger messages_check_rate
  before insert on public.messages
  for each row execute function public.check_message_rate();


-- =============================================================================
-- 3. (선택) reports 테이블 — 신고/차단용 미리 만들어둠
--    Tier 2 #18 작업 시 사용. 지금 만들어두면 마이그레이션 한 번 덜 함.
-- =============================================================================
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.messages(id) on delete cascade,
  reporter_id text not null,
  reason      text not null check (char_length(reason) <= 100),
  created_at  timestamptz not null default now()
);

create index if not exists reports_by_message on public.reports(message_id);

alter table public.reports enable row level security;

drop policy if exists "reports insert anon" on public.reports;
create policy "reports insert anon"
  on public.reports for insert
  with check (true);

grant insert on public.reports to anon;

-- =============================================================================
-- 검증: 다음 SELECT 로 trigger 가 제대로 등록됐는지 확인 가능
--   select tgname from pg_trigger where tgrelid = 'public.messages'::regclass;
-- 결과에 messages_check_clean, messages_check_rate 두 개가 보여야 함.
-- =============================================================================
