# commutenote (오늘도 출근합니다) — 개발 회고 / V1 출시 보고서

> 작성: 2026-05-13 (검수 신청 직후 시점)
> 코드 규모: src/ 약 5,500줄 (TS/TSX/CSS) · 커밋 12개

---

## 1. 무엇을 만들었나

**오늘도 출근합니다** — 앱인토스(Apps in Toss) 미니앱.
지하철 한 칸을 무대로, 같은 노선·칸의 출근러들이 **10초 후 자동 삭제되는 휘발성 말풍선**으로 떠드는 익명 채팅.

- 별도 회원가입 없음 (토스 익명키로 식별)
- 캐릭터 꾸미기 (헤어/표정/옷/소품/가방)
- 시간대·요일에 맞춰 변하는 더미 대화 + 멘탈케어 티커 + 배경 톤 + 헤더("출근행/퇴근행/...")
- 출석체크 (연속 출근일 스트릭, localStorage)
- 캐릭터 이동 (모바일=탭, PC=키보드) + 다른 승객 자동 배회
- 서버측(Supabase) 욕설/PII/길이 검증 + 6초 쿨타임

---

## 2. 소요 기간

| 구간 | 기간 | 내용 |
|---|---|---|
| 코어 개발 (이전 세션) | ~5/6 ~ 5/7 | 채팅·휘발 메시지·아바타 SVG·노선/칸·티커 — 첫 커밋(5/7) |
| Supabase 연동 + 보안 | 5/7 ~ 5/11 | 실시간 멀티유저, RLS/GRANT, 욕설/PII trigger, 쿨타임 |
| 디자인 이터레이션 | 5/11 | 픽셀아트 시도 → 롤백 → GPT 3D 토이 자산 통합 → 흰배경 투명화 → 캐릭터는 SVG 유지 |
| 출시 준비 | 5/11 ~ 5/12 | 앱 아이콘·OG·정책문서, 콘솔 등록, getAnonymousKey, safe-area, ait build/deploy, 피처 테스트 |
| 기능 추가 (출시 직전) | 5/12 | 시간대별 더미대화·티커·배경, 출석체크, 호선 5→12개, nav bar 중복 제거, 캐릭터 이동, 프로필 재구성 |
| 인프라 마무리 | 5/12 ~ 5/13 | git 히스토리 정리(.ait 57MB 제거), GitHub push, GitHub Pages(정책 URL), 검토 요청 |

**달력 기준 약 1주.** 단, 띄엄띄엄 진행이라 실제 hands-on 누적 시간은 추정 **~20~30시간** (대부분 디자인 이터레이션 + 출시 절차 학습 + 실기기 디버깅).

---

## 3. 주요 기술 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 식별 | 토스 익명키(`getAnonymousKey`) + UUID 폴백 | 회원가입 없는 익명 채팅, 정책 부담 최소 |
| 라우팅 | `page` 상태 + `history.pushState`/`popstate` | 가벼움. 토스 nav bar 뒤로가기와 연동 (커스텀 ← 제거) |
| 캐릭터 | SVG (PNG 3D 시도했다 롤백) | 표정·아이템 인터랙션 필요 → 코드로 그리는 게 유리. PNG는 손/눈 위치 고정이라 아이템이 둥둥 |
| 배경 | GPT 생성 3D 토이 PNG + 시간대 CSS 오버레이 | 만들기 어려운 영역은 GPT가 잘함. 다크 PNG 없이 filter+gradient로 퇴근/심야 처리 |
| 흰배경 PNG | 런타임 canvas flood-fill 투명화 | GPT 자산이 알파 채널 없어서 — 가장자리부터 흰픽셀만 제거 (티셔츠 내부는 보존) |
| 출석체크 | localStorage (로그인 X) | 출시 일정 안 밀리게. 토스 로그인은 정책 업데이트 + 검수 재신청 필요 → V1.1 |
| 보안 | Supabase Postgres trigger | 클라이언트 필터는 우회됨 → 서버에서 욕설/PII/길이/쿨타임 막음 |
| 수익화 | 안 함 | DAU·리텐션 100명+ 안정되면 보상형 광고부터 (검수 재신청 필요하니 V1.1+) |

---

## 4. 겪은 문제 & 해결

| 문제 | 원인 | 해결 |
|---|---|---|
| Supabase 404 | `.env` URL에 `/rest/v1` 붙음 | `sanitizeSupabaseUrl()` 방어 코드 + README 경고 |
| Supabase 401 | GRANT 누락 | `grant select,insert on messages to anon` 추가 |
| `invalid uuid` | 자체 createId 포맷이 UUID 아님 | `crypto.randomUUID()` 로 교체 |
| 멀티탭 동일유저 | 같은 브라우저 = 같은 localStorage | `?u=alice` URL 핵 (dev용) |
| 디자인 픽셀아트 "촌스러움" | CSS만으로 진짜 픽셀아트 불가 | 솔직히 인정 → GPT 3D 자산으로 전환 |
| PNG 흰배경이 캐릭터 가림 | 알파 채널 없는 RGB PNG | 런타임 투명화 유틸 |
| nav bar 화살표 2개 | 토스 nav 뒤로가기 + 커스텀 ← 중복 (검수 규칙 위반) | 커스텀 ← 제거 + pushState/popstate 로 토스 버튼이 내부 이동 처리 |
| `ait deploy` 4031 | `appName` 불일치 (today-office vs commutenote) | 콘솔의 appName 확인 → granite.config 수정 → 재빌드 |
| `ait token add` 안 됨 | 별칭 자리에 API 키 입력 → `{"키":"키"}` 저장됨 | `~/.ait/credentials` 를 `{"default":"키"}` 로 직접 수정 |
| `.ait` 57MB가 git 히스토리에 | gitignore 전에 커밋됨 | `git filter-branch` 로 제거 → .git 88MB→33MB |
| GitHub Pages 빌드 실패 ×2 | `docs/skills/*.md` 의 Liquid 문법 충돌 | `docs/_config.yml` 로 skills/ 등 제외 |
| `gh auth login` 반복 타임아웃 | Claude 백그라운드 bash 가 인터랙티브 인증 중 끊김 | Windows Credential Manager에 이미 GitHub 인증 캐시돼 있어서 → API로 repo 생성 + `git push` (gh CLI 불필요) |
| 출근 게이지 진행 바 0% | 계산식 오류 (prev milestone 계산 틀림) | `prevMilestone()` / `milestoneProgress()` 추가 |

---

## 5. 현재 상태 (2026-05-13)

- ✅ 코드 완성 (위 기능 전부) — GitHub `commme/commutenote` 에 push
- ✅ 토스 배포 (deploymentId `019e1c95-5b3e-7deb-8530-1c61a3e8a0c2`)
- ✅ 피처 테스트 1회 이상 완료
- ✅ 정책 문서 GitHub Pages 호스팅 (`commme.github.io/commutenote/legal/...`)
- ✅ 서버측 보안 trigger 적용 (실DB 검증됨)
- ✅ **검토 요청 제출 완료** → 검수 3~7일 대기 중
- ⬜ 검수 통과 → 콘솔 "출시하기"
- ⬜ 토스 API 키 재발급 (`cHpLykQ3k7...` 채팅 노출됨 — 출시 무관, 지금 가능)

---

## 6. 보완할 점

1. **번들 1.37MB (gzip 432KB)** — TDS Mobile + Supabase 라이브러리 통째. lazy-load / manualChunks 로 코드 스플릿 필요 (V1.5)
2. **캐릭터가 SVG 도형** — 진짜 귀여움은 아티스트/AI 일러스트 필요. 표정·옷별 PNG 세트 만들면 SVG 자리에 swap 가능
3. **빈 상태/에러 화면 일러스트 없음** — 메시지 0개일 때, React Error Boundary 화면
4. **Sentry 등 모니터링 없음** — 운영 중 에러 추적 불가
5. **만료 메시지 DB cleanup 없음** — 클라이언트가 필터만 함. `pg_cron` 으로 주기 DELETE 권장
6. **신고/차단 기능 없음** — `reports` 테이블은 만들어뒀지만 UI 미연결
7. **`.git` 33MB** — GPT 자산 PNG들(1254×1254)이 큼. WebP 변환하면 30~50% 감소
8. **정책 문서 변호사 미검토** — MVP 템플릿 수준. 수익화/권한 추가 시 검토 필요
9. **iOS 더 큰 텍스트 모드 미테스트** — 160% 설정에서 레이아웃 점검 안 함

---

## 7. ⏱️ 다음 프로젝트에서 시간 줄이는 법 (핵심)

이번에 시간을 가장 많이 잡아먹은 것들 + 처방:

### (1) 디자인 방향을 코딩 전에 못 박기 — 가장 큰 시간 낭비였음
- 픽셀아트 시도 → "촌스럽다" → 롤백 → GPT 3D → 캐릭터만 다시 SVG. **버려진 작업이 수 시간.**
- **처방**: 스타일 코드 짜기 전에 ① Pinterest/Dribbble 레퍼런스 5~10장 모으기 ② 그걸로 "이 톤" 확정 ③ 복잡한 아트(배경·캐릭터)는 처음부터 GPT/Midjourney로 생성 — CSS/SVG로 그리려 하지 말 것. 모먹업 1장이 코드 3시간 아낌.

### (2) 프로젝트 인프라를 첫 1시간에 제대로 세팅
- 이번엔 `.ait`가 git에 들어가서 나중에 filter-branch, `appName` 불일치로 deploy 4031, GitHub Pages Jekyll 빌드 실패 등을 **사후에** 처리하느라 시간 날림.
- **처방**: 시작하자마자 한 번에:
  - `.gitignore`: `*.ait`, `.env`, `dist/`, `node_modules/`, `.claude/`, `.omc/`, `.bkit/`
  - `granite.config.ts` 의 `appName` = 콘솔에 등록한 이름과 **정확히 일치** (콘솔 먼저 만들고 그 이름 복사)
  - GitHub repo + Pages(`/docs` + `_config.yml` 로 불필요 파일 제외) — 정책 문서 호스팅 미리
  - Supabase 프로젝트 + schema + GRANT — 한 번에
  - `.env.example` 작성

### (3) 인터랙티브 CLI 인증은 본인 터미널에서
- `gh auth login`, `ait token add` 를 AI한테 시켰다가 백그라운드 프로세스가 끊겨서 3번 넘게 재시도.
- **처방**: 브라우저 인증·디바이스코드 같은 인터랙티브 플로우는 **본인 터미널**에서 직접. 끝나면 AI가 그 결과(`~/.ait/credentials`, GCM 등)를 이어받음. + git push는 Windows Credential Manager에 이미 인증 캐시돼 있는 경우가 많으니 `git credential fill` 로 먼저 확인.

### (4) 출시 스프린트 전에 스코프 동결
- 검수 넣기 직전에 "이것만 더..."로 캐릭터 이동, 시간대, 출석체크, 호선 12개를 계속 추가 → 매번 rebuild + redeploy + 재테스트.
- **처방**: "출시 = 여기까지" 선을 긋고, 그 뒤 떠오르는 아이디어는 **V1.1 백로그**에 적기만 하기. 작은 추가도 빌드/배포/실기기테스트 사이클 30분~1시간씩 먹음.

### (5) 실기기 테스트 루프를 일찍 확립
- 포트 헷갈림(8081 vs 5173), dev 서버 죽음, 옛 QR 스캔 등으로 "안 떠요" 디버깅 반복.
- **처방**: 프로젝트 초반에 ① dev URL 고정·문서화 ② `ait build` → QR → 토스앱 루프를 한 번 끝까지 해보고 익혀두기 ③ 새 배포마다 QR 갱신 자동화(스크립트). 모바일 전용 동작(탭 이동, safe-area)은 localhost로는 못 보니 일찍 실기기로.

### (6) AI에게 더 큰 단위로 위임
- "A 할까요 B 할까요?" 식 작은 확인이 많았음.
- **처방**: 솔로 프로젝트면 "X 하고 commit + deploy 하고 끝나면 알려줘" 식으로 묶어서 맡기고, 결과만 리뷰. 디자인처럼 취향 타는 것만 중간 확인.

### (7) 체크리스트를 처음부터 따르기
- `docs/launch-checklist.md` 를 중간에 만들었는데, 처음부터 있었으면 #1~#10 순서대로 갔을 것.
- **처방**: 앱인토스 출시 = 정해진 관문(아이콘·OG·정책URL·고객센터·서버보안·nav bar·피처테스트·앱내기능·검토요청). 시작할 때 이 목록 만들고 하나씩 체크.

### 요약 — 한 줄
> **"디자인 레퍼런스 먼저 → 인프라 첫 1시간에 제대로 → 스코프 동결 → 실기기 일찍 → AI에 크게 위임"** 이 5개만 지켜도 비슷한 미니앱을 **절반 시간**에 만들 수 있음.

---

## 8. V1.1 백로그 (출시 후)

- [ ] 빈 상태 / 에러 화면 일러스트 (Storyset, unDraw)
- [ ] 신고/차단 UI 연결 (`reports` 테이블 이미 있음)
- [ ] 만료 메시지 `pg_cron` cleanup
- [ ] Sentry 통합
- [ ] 캐릭터 PNG 일러스트 (표정·옷별 세트)
- [ ] 번들 코드 스플릿 (lazy-load)
- [ ] 토스 로그인 + 출석 기록 서버 저장 (기기 바꿔도 유지) + 출석 랭킹
- [ ] 수익화: 보상형 광고 ("광고 보고 아이템 해금") — DAU 안정 후
- [ ] iOS 더 큰 텍스트 모드 점검
- [ ] GPT 자산 WebP 변환 (repo 용량 ↓)
