# today-office 출시 체크리스트

> 운영 출시까지 필요한 항목을 우선순위별로 정리한 문서.
> 동일한 내용을 [`launch-checklist.csv`](./launch-checklist.csv) 로 받으면 Excel/Google Sheets 에서 표 형태로 볼 수 있어요.

마지막 갱신: 2026-05-07

---

## ✅ Tier 1 진행 현황 (2026-05-07 업데이트)

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | getAnonymousKey() 통합 | ✅ **코드 완료** | 토스 앱 안에서만 실제 호출. 브라우저 미리보기에선 fallback UUID. |
| 2 | TDS Navigation 바 | ⚠️ **부분 완료** | iOS safe-area-inset-top 적용 완료. TDS `Navigation` 컴포넌트 추가는 보류 (현재 헤더로 충분 판단) |
| 3 | 앱 아이콘 256×256 | ⏳ **사용자 작업** | GPT/Midjourney 생성 후 콘솔 등록 |
| 4 | OG 공유 이미지 | ⏳ **사용자 작업** | 동일 |
| 5 | 서버측 길이 검증 | ✅ **SQL 준비됨** | `supabase/migration-001-security.sql` 실행 필요 |
| 6 | 서버측 욕설/PII 필터 | ✅ **SQL 준비됨** | 동일 — Postgres trigger |
| 7 | 서버측 쿨타임 (6초) | ✅ **SQL 준비됨** | 동일 — Postgres trigger |
| 8 | 개인정보 처리방침 URL | ✅ **템플릿 작성 완료** | [`docs/legal/privacy-policy.md`](./legal/privacy-policy.md) — 운영자 이름·이메일만 채우면 됨 |
| 9 | 이용약관 URL | ✅ **템플릿 작성 완료** | [`docs/legal/terms-of-service.md`](./legal/terms-of-service.md) — 운영자 이름만 채우면 됨 |
| 10 | 고객센터 연락처 | ✅ **가이드 작성 완료** | [`docs/legal/operations-guide.md`](./legal/operations-guide.md) — 호스팅·등록 30분 코스 |

### 🎯 지금 사용자가 해야 할 일 3가지

1. **Supabase 마이그레이션 실행** — Dashboard → SQL Editor → New query → [`supabase/migration-001-security.sql`](../supabase/migration-001-security.sql) 전체 복사 → Run
   - 욕설/PII/길이 trigger + 6초 쿨타임 trigger + reports 테이블이 한 번에 생성돼요.
   - 멱등이라 여러 번 실행해도 안전해요.
2. **이미지 자산 생성** — [이미지 자산 가이드](#)에서 안내한 대로 GPT/Midjourney로 1순위 2개 (앱 아이콘 + OG) 생성
3. **정책 문서 작성** — 개인정보 처리방침 / 이용약관 / 고객센터 (가장 오래 걸리는 항목 — 미리 시작 권장)

### 🤖 코드 변경 요약 (이번 세션)

- `src/services/userIdService.ts` — `ensureUserId()` async + 토스 `getAnonymousKey()` 시도 + UUID fallback
- `src/services/profileService.ts` — `defaultProfile(idOverride?)` 으로 토스 키 주입 가능
- `src/contexts/AppContext.tsx` — 부트 시퀀스 동안 `<SplashScreen />` 노출, 컨슈머는 항상 non-null profile 보장
- `src/styles/train.css` — `.train-header` 에 `env(safe-area-inset-top)` 적용
- `src/styles/pages.css` — `.profile__header`, `.line-select` 에 동일 적용
- `supabase/migration-001-security.sql` — 신규 (욕설/PII trigger + rate limit trigger + reports 테이블)

---

## 🔍 한 페이지 요약

| 단계 | 항목 수 | 누적 시간 | 출시 가능? |
|------|--------|-----------|-----------|
| **Tier 1 — 출시 차단** | 10 | ~3-4일 | ❌ 못함 |
| **Tier 2 — 출시 후 1주** | 10 | ~5일 | ⚠️ 권장 |
| **Tier 3 — V1.5** | 9 | ~2주 | ✅ 후속 |
| **Tier 4 — V2+** | 5 | ~3주+ | ✅ 후속 |
| **인프라** | 6 | ~3일 | 운영 시점 결정 |

---

## 🚨 Tier 1 — 출시 차단 (검수 통과 필수)

| # | 카테고리 | 항목 | 현재 상태 | 해야 할 일 | 시간 | 담당 |
|---|---------|------|-----------|-----------|------|------|
| 1 | 식별 | `getAnonymousKey()` 통합 | localStorage 랜덤 UUID | `@apps-in-toss/web-framework` 의 `getAnonymousKey` 연동 + `userIdService` 분기 처리 | 15분 | 개발 |
| 2 | UI | TDS Navigation 바 | 없음 | TDS Navigation 컴포넌트로 헤더 위에 뒤로/닫기 추가 | 30분 | 개발 |
| 3 | 자산 | 앱 아이콘 256×256 | placeholder | 디자이너 의뢰 또는 생성형 AI 시안 → 256×256 PNG → 콘솔 등록 | 1일 | 디자인 |
| 4 | 자산 | OG 공유 이미지 | 없음 | 1200×630 PNG 디자인 + 콘솔 등록 | 반나절 | 디자인 |
| 5 | 보안 | 서버측 길이 검증 | 일부 (40자 CHECK 있음) | 기존 CHECK 보강 검토 | 30분 | 개발 |
| 6 | 보안 | **서버측 욕설/PII 필터** | 클라이언트만 | Postgres trigger 또는 Edge Function 으로 INSERT 시 검증 | 2시간 | 개발 |
| 7 | 보안 | **서버측 쿨타임** | 클라이언트만 (8초) | RLS 또는 trigger 로 `user_id` 기준 last-insert 검사 | 2시간 | 개발 |
| 8 | 정책 | 개인정보 처리방침 URL | 없음 | 페이지 작성 또는 외부 호스팅 → 콘솔 등록 | 1일 | 운영 |
| 9 | 정책 | 이용약관 URL | 없음 | 템플릿 기반 작성 → 콘솔 등록 | 1일 | 운영 |
| 10 | 정책 | 고객센터 연락처 | 없음 | 이메일/채팅 결정 후 콘솔 등록 | 30분 | 운영 |

> 합계: 약 **3-4 영업일** (정책 문서 작성이 가장 김)

---

## ⚠️ Tier 2 — 출시 후 1주 안 (UX/운영 안정성)

| # | 카테고리 | 항목 | 현재 | 해야 할 일 | 시간 |
|---|---------|------|------|-----------|------|
| 11 | 데이터 | 만료 메시지 cleanup | 클라이언트만 필터 | Supabase `pg_cron` 활성화 → 5분마다 만료 row DELETE | 10분 |
| 12 | 모니터링 | Sentry 통합 | 없음 | `@sentry/react` 설치 + DSN 설정 + ErrorBoundary | 1시간 |
| 13 | UX | 로딩 스켈레톤 | 빈 배경 | TDS Skeleton 첫 진입/칸 전환에 적용 | 1시간 |
| 14 | UX | 빈 상태 안내 | 무음 | 짧은 안내 문구 또는 마스코트 | 30분 |
| 15 | UX | 네트워크 끊김 처리 | 멈춤 | Supabase disconnect 감지 → 토스트 + 재연결 | 1시간 |
| 16 | UX | iOS Safe Area 전체 | 입력바만 | 헤더 `env(safe-area-inset-top)` 적용 | 15분 |
| 17 | UX | 더 큰 텍스트 모드 | 미테스트 | 160% 설정에서 레이아웃 점검 | 1시간 |
| 18 | 보안 | 신고/차단 | 없음 | 말풍선 ··· → 신고 → reports 테이블 + 자동 차단 룰 | 1일 |
| 19 | UX | 에러 화면 | white screen | React Error Boundary + 친절한 안내 | 30분 |
| 20 | 자산 | Granite 빌드 검증 | Vite build 만 | `ait build` → 토스 샌드박스 실제 동작 확인 | 1시간 |

---

## 📈 Tier 3 — V1.5 (운영 안정화 후)

| # | 카테고리 | 항목 | 시간 |
|---|---------|------|------|
| 21 | 분석 | 사용자 행동 로깅 (DAU 등) | 2시간 |
| 22 | 분석 | 운영 대시보드 (Supabase + Analytics) | 1일 |
| 23 | 기능 | **칸별 시각 차별화** (커피칸/월요병칸 다른 톤) | 1일 |
| 24 | 기능 | 푸시 알림 (출근 시간 리마인드) | 1일 |
| 25 | 기능 | 공유 리워드 (`contactsViral`) | 반나절 |
| 26 | UI | 다크모드 자동 대응 | 2시간 |
| 27 | 성능 | 번들 사이즈 최적화 (lazy load) | 2시간 |
| 28 | UX | **캐릭터 자산 업그레이드** (Lottie) | 1주+ |
| 29 | UX | 모바일 캐릭터 드래그 | 2시간 |

---

## 🚀 Tier 4 — V2+ (성장 단계)

| # | 카테고리 | 항목 | 시간 |
|---|---------|------|------|
| 30 | 게이미피케이션 | 출석 미션 (7일 연속 등) | 3일 |
| 31 | 게이미피케이션 | 아이템 해금 시스템 | 2일 |
| 32 | 사회적 | 친구 초대 표시 | 1주 |
| 33 | 수익 | 인앱 광고 (`IntegratedAd`) | 2일 |
| 34 | 수익 | 토스 페이 / IAP | 1주 |

---

## 🔧 인프라 (별도 카테고리)

| # | 항목 | 시간 |
|---|------|------|
| 35 | 환경 분리 (dev/staging/prod) | 2시간 |
| 36 | 자동 배포 CI (PR merge 시 staging) | 반나절 |
| 37 | DB 백업 정책 (Supabase Pro 또는 자체 pg_dump) | 1일 |
| 38 | 운영 모니터링 대시보드 | 1일 |
| 39 | 서비스 점검 안내 (콘솔 기능) | 30분 |
| 40 | 서비스 종료 절차 (수년 후) | 추후 |

---

## 🎯 추천 작업 순서

### 최단 출시 코스 (1주)

```
1. getAnonymousKey 통합              (15분)   ┐
2. Navigation 바                      (30분)   │ Tier 1 핵심
3. 서버측 쿨타임 + 욕설 필터          (4시간)  │
4. 만료 메시지 cleanup                (10분)   │ Tier 2 핵심  
5. iOS Safe Area + 에러 화면          (45분)   │
6. 앱 아이콘 + OG 이미지              (1일)    │ 디자인 병행
7. 개인정보 처리방침 + 약관           (1-2일)  │ 운영 병행
8. ait build + 샌드박스 검증          (1시간)  ┘
9. ait deploy → 검수 신청
   → 검수 3-7일
   → 출시
```

### 여유 있는 코스 (2-3주)

위 + Tier 2 전체 + Sentry 통합까지 끝내고 출시. 사용자 첫 인상 + 운영 안정성 더 좋음.

---

## 📋 진행 상황 추적

이 문서를 진행 추적용으로 쓰려면, 각 항목에 다음 상태를 메모하세요:
- `TODO` — 아직
- `IN_PROGRESS` — 작업 중
- `DONE` — 완료
- `BLOCKED` — 막힘 (사유 적기)
- `N/A` — 해당 없음

CSV 파일로 받아서 Excel 에서 필터/정렬하시는 게 가장 편합니다.
