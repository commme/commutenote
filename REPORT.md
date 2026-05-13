# commutenote (오늘도 출근합니다) — 개발 회고 / V1 출시 보고서

> 작성: 2026-05-13 (검수 신청 직후) · 코드 규모: src/ 약 5,500줄 (TS/TSX/CSS) · 커밋 12개

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
| 코어 개발 | ~5/6 ~ 5/7 | 채팅·휘발 메시지·아바타 SVG·노선/칸·티커 — 첫 커밋(5/7) |
| Supabase 연동 + 보안 | 5/7 ~ 5/11 | 실시간 멀티유저, RLS/GRANT, 욕설/PII trigger, 쿨타임 |
| 디자인 이터레이션 | 5/11 | 픽셀아트 시도 → 롤백 → GPT 3D 토이 자산 통합 → 흰배경 투명화 → 캐릭터는 SVG 유지 |
| 출시 준비 | 5/11 ~ 5/12 | 앱 아이콘·OG·정책문서, 콘솔 등록, getAnonymousKey, safe-area, ait build/deploy, 피처 테스트 |
| 기능 추가 (출시 직전) | 5/12 | 시간대별 더미대화·티커·배경, 출석체크, 호선 5→12개, nav bar 중복 제거, 캐릭터 이동, 프로필 재구성 |
| 인프라 마무리 | 5/12 ~ 5/13 | git 히스토리 정리(.ait 57MB 제거), GitHub push, GitHub Pages(정책 URL), 검토 요청 |

**달력 기준 약 1주.** 띄엄띄엄 진행이라 실제 hands-on 누적은 추정 **~20~30시간**.
출시 절차 학습 + 디자인 이터레이션 + AI 어시스턴트의 사전점검 누락으로 인한 재작업이 시간의 큰 부분.

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

| 문제 | 원인 | 책임 | 해결 |
|---|---|---|---|
| Supabase 404 | `.env` URL에 `/rest/v1` 붙음 | 설정 | `sanitizeSupabaseUrl()` 방어 코드 + README 경고 |
| Supabase 401 | GRANT 누락 | 스키마 | `grant select,insert on messages to anon` 추가 |
| `invalid uuid` | 자체 createId 포맷이 UUID 아님 | 코드 | `crypto.randomUUID()` 로 교체 |
| 멀티탭 동일유저 | 같은 브라우저 = 같은 localStorage | (사양) | `?u=alice` URL 핵 (dev용) |
| 디자인 픽셀아트 "촌스러움" | **CSS만으로 진짜 픽셀아트 불가 — AI가 과신하고 시도** | AI | 사용자 피드백("촌스럽다") → GPT 3D 자산으로 전환 |
| PNG 흰배경이 캐릭터 가림 | 알파 채널 없는 RGB PNG | 자산 | 런타임 투명화 유틸 |
| nav bar 화살표 2개 | 토스 nav 뒤로가기 + 커스텀 ← 중복 (검수 규칙 위반) | 설계 | 커스텀 ← 제거 + pushState/popstate |
| `ait deploy` 4031 | `appName` 불일치 — **AI가 콘솔 appName 확인 안 하고 빌드** | AI | 콘솔 appName 확인 → granite.config 수정 → 재빌드 |
| `ait token add` 실패 | 별칭 자리에 API 키 입력 → `{"키":"키"}` 저장 | 입력 | `~/.ait/credentials` 를 `{"default":"키"}` 로 직접 수정 |
| `.ait` 57MB가 git에 | **AI가 gitignore 전에 `git add -A` 커밋** | AI | `git filter-branch` 로 제거 → .git 88MB→33MB |
| GitHub Pages 빌드 실패 ×2 | **AI가 `_config.yml` 없이 Pages 켬 — `docs/skills/*.md` Liquid 충돌 미예측** | AI | `docs/_config.yml` 로 skills/ 등 제외 |
| `gh auth login` 반복 타임아웃 | AI 백그라운드 bash 가 인터랙티브 인증 중 끊김 | AI/환경 | Windows Credential Manager에 이미 인증 캐시 → API로 repo 생성 + `git push` |
| 출근 게이지 진행 바 0% | **AI 계산식 오류 (prev milestone)** | AI | `prevMilestone()` / `milestoneProgress()` 추가 |

> **마찰 원인 구분**: 위 표에서 "AI" 표시된 6건이 AI 어시스턴트가 사전점검을 안 해서 생긴 재작업. `.gitignore`·`appName`·`_config.yml`은 시작 시 5분이면 막을 수 있던 것들. 사용자 쪽 마찰은 거의 없었음 — 디자인 피드백·인증·콘솔 작업·스코프 결정은 빠르고 깔끔했음.

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

## 6. 제품 보완할 점 (출시 후 V1.1+)

1. **번들 1.37MB (gzip 432KB)** — TDS Mobile + Supabase 통째. lazy-load / manualChunks 코드 스플릿
2. **캐릭터가 SVG 도형** — 표정·옷별 PNG 일러스트 세트 만들면 swap 가능 (GPT/디자이너)
3. **빈 상태/에러 화면 일러스트 없음** — 메시지 0개, React Error Boundary 화면
4. **모니터링 없음** — Sentry 통합 (운영 중 에러 추적)
5. **만료 메시지 DB cleanup 없음** — `pg_cron` 으로 주기 DELETE
6. **신고/차단 UI 미연결** — `reports` 테이블은 만들어둠
7. **`.git` 33MB** — GPT 자산 PNG(1254×1254) WebP 변환하면 30~50% ↓
8. **정책 문서 변호사 미검토** — MVP 템플릿. 수익화/권한 추가 시 검토 필요
9. **iOS 더 큰 텍스트 모드 미테스트** — 160% 설정 레이아웃 점검

---

## 7. ⏱️ 다음 프로젝트에서 시간 줄이는 법

이번 마찰의 큰 부분이 **AI 어시스턴트가 사전점검 없이 진행한 것**이었음. 처방도 그 관점에서:

### (1) 인프라를 첫 1시간에 — AI에게 시키고 결과 검증받기
- 이번엔 `.ait`가 git에 들어가서 filter-branch, `appName` 불일치로 deploy 4031, Pages Jekyll 빌드 실패를 **사후에** 처리.
- **처방**: 시작하자마자 AI에게 한 번에 시키고 *체크리스트로 확인*:
  - `.gitignore`: `*.ait`, `.env`, `dist/`, `node_modules/`, `.claude/`, `.omc/`, `.bkit/` — **첫 커밋 전에**
  - `granite.config.ts` 의 `appName` = 콘솔에 등록한 이름과 **정확히 일치** (콘솔 먼저 만들고 그 이름 복사 — AI에게 "콘솔 appName 뭔지 먼저 확인하고 맞춰라" 지시)
  - GitHub repo + Pages: `/docs` 폴더 + `_config.yml`(불필요 파일 exclude) 미리 — 또는 정책 문서는 Notion으로 (더 간단)
  - Supabase 프로젝트 + schema + GRANT 한 번에
  - `.env.example` 작성
- 즉 "AI야 인프라부터 다 세팅하고 뭐가 빠졌는지 체크리스트로 보여줘" → 검증 → 그 다음 기능 개발.

### (2) 디자인 방향을 코딩 전에 못 박기
- 픽셀아트 시도 → "촌스럽다" → 롤백 → GPT 3D → 캐릭터 다시 SVG. **AI가 "CSS로 픽셀아트 되겠지" 과신**한 게 컸음.
- **처방**: 스타일 코드 전에 ① Pinterest/Dribbble 레퍼런스 5~10장 ② 그걸로 톤 확정 ③ 복잡한 아트(배경·캐릭터)는 처음부터 GPT/Midjourney로 생성 — CSS/SVG로 그리려 하지 말 것. AI한테도 "이거 코드로 될 것 같냐, 자산이 나을 것 같냐" 먼저 물어볼 것. 모먹업 1장이 코드 3시간 아낌.

### (3) 인터랙티브 CLI 인증은 본인 터미널에서
- `gh auth login`, `ait token add` 를 AI 통해 시켰다가 백그라운드 끊겨 재시도 다수.
- **처방**: 브라우저 인증·디바이스코드 같은 건 본인 터미널에서 직접 → 끝나면 AI가 결과 이어받음. + git push는 Windows Credential Manager에 이미 캐시돼 있는 경우 많음 (`git credential fill`로 확인).

### (4) 출시 스프린트 전에 스코프 동결
- 검수 직전에 캐릭터 이동·시간대·출석·호선12 계속 추가 → 매번 rebuild+redeploy+재테스트.
- **처방**: "출시 = 여기까지" 선 긋고, 새 아이디어는 V1.1 백로그에. 작은 추가도 빌드/배포/실기기 사이클 30분~1시간씩.

### (5) 실기기 테스트 루프를 일찍 확립
- 포트 헷갈림(8081 vs 5173), dev 서버 죽음, 옛 QR 스캔 등 "안 떠요" 디버깅 반복.
- **처방**: 초반에 dev URL 고정·문서화, `ait build`→QR→토스앱 루프 한 번 끝까지, 새 배포마다 QR 갱신 스크립트. 모바일 전용 동작(탭 이동, safe-area)은 일찍 실기기로.

### (6) AI에게 더 큰 단위로 위임 + 사전점검 요구
- "A 할까요 B 할까요" 자잘한 확인 많았음.
- **처방**: "X 하고 commit+deploy하고 알려줘 + 진행 전에 빠진 거 체크리스트로 먼저 보여줘" 식으로 묶어 위임. 디자인처럼 취향 타는 것만 중간 확인.

### 한 줄 요약
> **"AI한테 인프라부터 세팅+사전점검 시키기 → 디자인은 레퍼런스 먼저 → 스코프 동결 → 실기기 일찍 → 크게 위임"** — 이 5개면 비슷한 미니앱을 절반 시간에.

---

## 8. 평가 (솔직하게)

| 항목 | 평가 |
|---|---|
| 결과물 | **B+** — 완성도 있고, 실제 출시 단계까지 감 (대부분 여기 못 옴). 백엔드(RLS+trigger)까지 붙임 |
| 과정 (사용자) | **잘함** — 디자인 피드백·인증·콘솔·스코프 결정 빠르고 깔끔. 헤맨 거 거의 없음 |
| 과정 (AI 어시스턴트) | **C+** — `.gitignore`/`appName`/`_config.yml` 사전점검 누락, 픽셀아트 과신, 확인 왕복 과다 |
| 종합 | **첫 앱인토스 솔로 프로젝트치곤 상위권.** 깎인 점수의 큰 덩어리는 AI 쪽 마찰 |

> caveat: 앱인토스 개발 시간 공식 통계는 없음 — 일반 개발 경험·다른 미니앱 사례 기반 추정. 정확한 백분위 아님.
> 진짜 평가는 ① 검수 통과 ② 출시 후 사용자 반응. 출시되면 DAU·리텐션 보고 V1.1 우선순위 정할 것.

---

## 9. V1.1 백로그 (출시 후)

- [ ] 빈 상태 / 에러 화면 일러스트 (Storyset, unDraw)
- [ ] 신고/차단 UI 연결 (`reports` 테이블 이미 있음)
- [ ] 만료 메시지 `pg_cron` cleanup
- [ ] Sentry 통합
- [ ] 캐릭터 PNG 일러스트 (표정·옷별 세트)
- [ ] 번들 코드 스플릿 (lazy-load)
- [ ] 토스 로그인 + 출석 기록 서버 저장 + 출석 랭킹
- [ ] 수익화: 보상형 광고 ("광고 보고 아이템 해금") — DAU 안정 후
- [ ] iOS 더 큰 텍스트 모드 점검
- [ ] GPT 자산 WebP 변환 (repo 용량 ↓)
