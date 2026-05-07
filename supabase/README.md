# Supabase 셋업 가이드

`today-office` 앱에 실시간 메시지/좋아요 기능을 붙이기 위한 Supabase 설정 안내입니다.

## 1. Supabase 프로젝트 생성

1. <https://supabase.com> 접속 → GitHub/Google 로 회원가입 (무료)
2. **New project** 클릭
3. 입력값
   - **Name**: `today-office` (자유)
   - **Database Password**: 강력한 비밀번호 생성 후 따로 저장
   - **Region**: `Northeast Asia (Seoul)` 추천
   - **Plan**: Free
4. 프로젝트 생성 완료까지 1~2분 대기

## 2. SQL 스키마 적용

1. 좌측 사이드바 **SQL Editor** → `+ New query`
2. 이 폴더의 [`schema.sql`](./schema.sql) 내용을 **전체 복사** → 붙여넣기 → `Run`
3. 결과창에 `Success. No rows returned` 류 메시지 확인
4. 좌측 **Table Editor** 에서 `messages`, `likes` 테이블이 생성됐는지 확인

## 3. Realtime 활성화 확인

1. **Database → Replication** 메뉴
2. `supabase_realtime` 라인의 source 가 `0/2` 같이 표시되는지 확인 (스키마가 자동 add 함)
3. 표시 안 되면 직접 토글: `messages`, `likes` 테이블 옆 토글 ON

## 4. 환경 변수 설정

1. **Project Settings → API** 메뉴
2. 다음 두 값 복사
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (긴 JWT 문자열)
3. 프로젝트 루트에 `.env` 파일 만들고 (없으면 생성):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> ⚠️ **URL 주의**: 반드시 **base URL만** 적으세요. `/rest/v1` 같은 경로 붙이면 안 됩니다.
> - ✅ `https://xxxxx.supabase.co`
> - ❌ `https://xxxxx.supabase.co/rest/v1` (404 발생)
>
> ⚠️ `.env` 는 `.gitignore` 에 들어 있어야 합니다. (이 프로젝트엔 이미 추가됨)
>
> ⚠️ Vite 는 `.env` 변경을 자동 감지 안 합니다. 수정 후엔 dev 서버를 **반드시 재시작**하세요.

## 5. 동작 확인

```bash
npm run dev
```

- 브라우저 콘솔에 `[supabase] connected` 같은 로그가 뜨면 성공
- 두 탭으로 각각 `http://localhost:5173/` 열고 같은 노선 같은 칸으로 들어가서, 한 쪽에서 메시지 보내면 다른 쪽 화면에 실시간으로 떠야 함

## 6. (선택) 만료 메시지 자동 정리

기본은 클라이언트가 `expires_at` 보고 필터링하지만, DB에 만료 메시지가 계속 쌓이는 게 신경 쓰이면:

1. **Database → Extensions** 에서 `pg_cron` 활성화
2. `schema.sql` 맨 아래 `cron.schedule(...)` 부분 주석 해제 후 다시 실행

## 7. 비용 / 무료 티어

- 무료 티어: 월 500 MB DB / 1 GB 파일 / 50K MAU / 5 GB Realtime egress
- 출근/메시지 휘발성 + 평균 30자 → 한참 부족할 일 거의 없음
- 프로젝트가 7일간 미사용 시 자동 pause 되니 운영 시 주의

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `[supabase] missing env, skipping cloud` 콘솔 로그 | `.env` 의 두 변수가 비어있음. dev server 재시작 필요 |
| 메시지가 한쪽에만 보임 | Realtime publication 미등록. Database → Replication 확인 |
| `permission denied for table messages` (401) | RLS + GRANT 둘 다 필요. SQL Editor 에서 `grant select, insert on public.messages to anon, authenticated;` (likes 도) 실행 또는 `schema.sql` 다시 실행 |
| 쿨타임이 풀렸는데도 못 보냄 | DB CHECK 제약: `content` 길이/`expires_at` 30초 이내 — contentFilter 설정과 일치하는지 확인 |
