-- =============================================================================
-- Migration 002 — V1.1 보안 강화 (URL/사기/사칭/광고/혐오/음란/도배/영어욕)
-- =============================================================================
-- 적용: Supabase Dashboard → SQL Editor → New query → 전체 복사 → Run
-- 멱등 — 여러 번 실행해도 안전 (create or replace).
--
-- 추가 차단 카테고리:
--   1. URL/링크 (외부 유도)
--   2. 카카오 오픈채팅 (SNS 차단 보강)
--   3. 금융 사기 키워드 (토스 환경 핵심)
--   4. 운영자/관리자 사칭
--   5. 광고/외부 유도 키워드
--   6. 영어 욕설
--   7. 차별/혐오 표현
--   8. 음란 표현
--   9. 도배 스팸 (반복 문자 8회 이상)
--  10. 욕설 변형 (강화 정규화 — 숫자/특수문자 제거 후 매칭)
--
-- 자살/자해는 여기서 차단하지 않음 — 클라이언트에서 1393 안내 토스트 노출.
-- =============================================================================

create or replace function public.check_message_clean()
returns trigger
language plpgsql
as $$
declare
  normalized text;
  bad_word text;
  bad_words text[] := array[
    -- 한국어 욕설
    '씨발', '시발', 'ㅅㅂ', '병신', 'ㅂㅅ', '개새끼', '지랄', '꺼져',
    '좆', '존나', '씹새', '미친년', '미친놈', 'ㅈㄴ', '조까', '새끼',
    '또라이', '등신', '머저리', '빡친', '죽일',
    -- 영어 욕설
    'fuck', 'fck', 'shit', 'sht', 'bitch', 'btch', 'asshole', 'dick',
    'pussy', 'motherfucker',
    -- 차별/혐오
    '짱깨', '쪽바리', '깜둥이', '좆본', '한남충', '꼴페미', '메갈', '일베',
    '좌좀', '우좀', '게이새끼', '레즈새끼', '트젠새끼',
    -- 음란
    '자위', '발기', '오르가즘', '딸딸이', '섹스해', '강간', '야동', '야사'
  ];
begin
  -- 1) 길이 가드
  if char_length(new.content) < 1 or char_length(new.content) > 40 then
    raise exception 'CONTENT_LENGTH_INVALID' using errcode = '22001';
  end if;

  -- 2) PII — 전화/이메일/주민
  if new.content ~ '\m\d{2,3}-?\d{3,4}-?\d{4}\M' then
    raise exception 'PII_PHONE_DETECTED' using errcode = '22000';
  end if;
  if new.content ~* '[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}' then
    raise exception 'PII_EMAIL_DETECTED' using errcode = '22000';
  end if;
  if new.content ~ '\m\d{6}-?\d{7}\M' then
    raise exception 'PII_RRN_DETECTED' using errcode = '22000';
  end if;

  -- 3) SNS 유도 (보강: 카톡 오픈채팅, 라인, 위챗, 텔레그램 핸들 추가)
  if new.content ~* '(인스타|insta|카톡|kakao|텔레|telegram|디스코드|discord|라인id|line\s*id|위챗|wechat)\s*[:：]?\s*\S+' then
    raise exception 'PII_SNS_DETECTED' using errcode = '22000';
  end if;
  if new.content ~* '(open\.kakao|오픈채팅|오픈톡|오카방|오픈카톡)' then
    raise exception 'OPEN_CHAT_NOT_ALLOWED' using errcode = '22000';
  end if;

  -- 4) URL/링크 차단 (외부 유도 — 토스 정책 위반 위험)
  if new.content ~* '(https?://|www\.|\.(com|net|org|kr|co\.kr|io|gg|me|ly|im|to|app|live|xyz|info|biz)(/|\s|$|\?))' then
    raise exception 'URL_NOT_ALLOWED' using errcode = '22000';
  end if;

  -- 5) 금융 사기 (토스 환경 핵심)
  if new.content ~* '(투자\s*수익|수익\s*보장|코인\s*리딩|리딩\s*방|선물\s*거래|단타|비트코인.*투자|이더리움.*투자|현금\s*화|불법\s*대출|일\s*수|급전|주식\s*리딩)' then
    raise exception 'FINANCIAL_SCAM_DETECTED' using errcode = '22000';
  end if;

  -- 6) 운영자/관리자/토스 사칭
  if new.content ~* '(운영자\s*(입니다|이에요|예요|임)|관리자\s*(입니다|이에요|예요|임)|토스\s*(직원|운영|고객센터|관리|공지))' then
    raise exception 'IMPERSONATION_DETECTED' using errcode = '22000';
  end if;

  -- 7) 광고/외부 유도 키워드
  if new.content ~* '(초대\s*코드|할인\s*쿠폰|이벤트\s*참여|친구\s*\d+\s*명|이\s*링크|구독.*하면|좋아요.*누르면)' then
    raise exception 'PROMOTION_NOT_ALLOWED' using errcode = '22000';
  end if;

  -- 8) 도배 스팸 — 같은 글자 8회 이상 반복
  if new.content ~ '(.)\1{7,}' then
    raise exception 'SPAM_REPEAT_DETECTED' using errcode = '22000';
  end if;

  -- 9) 욕설 매칭 (강화 정규화 — 공백/숫자/특수문자 제거 후 lower)
  normalized := lower(regexp_replace(new.content, '[\s\d\!\@\#\$\%\^\&\*\.\,\?\-\_]+', '', 'g'));
  foreach bad_word in array bad_words loop
    if position(bad_word in normalized) > 0 then
      raise exception 'INAPPROPRIATE_CONTENT' using errcode = '22000';
    end if;
  end loop;

  return new;
end;
$$;

-- trigger 재바인딩 (이미 있으면 교체)
drop trigger if exists messages_check_clean on public.messages;
create trigger messages_check_clean
  before insert on public.messages
  for each row execute function public.check_message_clean();

-- =============================================================================
-- 검증
--   select tgname from pg_trigger where tgrelid = 'public.messages'::regclass;
-- =============================================================================
