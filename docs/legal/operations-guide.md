# 운영 가이드 — 정책 문서 호스팅 + 고객센터 셋업

> Tier 1 출시 차단 항목 #8 (개인정보 처리방침), #9 (이용약관), #10 (고객센터)을
> 한꺼번에 처리하기 위한 실전 가이드.

---

## 🎯 30분 안에 끝내는 최단 코스

| 단계 | 작업 | 예상 |
|------|------|------|
| 1 | 정책 문서 운영자 정보 채우기 | 5분 |
| 2 | 고객센터 이메일 결정 | 5분 |
| 3 | GitHub Pages 또는 Notion 으로 호스팅 | 15분 |
| 4 | 토스 콘솔에 URL·이메일 등록 | 5분 |

---

## 1단계: 정책 문서 운영자 정보 채우기

[`privacy-policy.md`](./privacy-policy.md) 와 [`terms-of-service.md`](./terms-of-service.md)
의 다음 부분을 직접 수정하세요.

```diff
- | 책임자 | **[운영자 이름 또는 닉네임]** |
- | 이메일 | **[연락 받을 이메일 주소]** |
+ | 책임자 | **홍길동** (또는 닉네임 OK)
+ | 이메일 | **support@example.com**
```

> **개인 식별 우려가 있다면 닉네임도 가능해요.** "today-office 운영자" 정도로 적어도 무방합니다.

이용약관 제1조 운영자 표기도 동일하게 수정.

---

## 2단계: 고객센터 이메일 결정

### 옵션 A: 새 이메일 (권장)

새 Gmail 계정 하나 만들어서 분리:

- 추천 이름 패턴: `today.office.support@gmail.com`, `today.office.help@gmail.com`
- 장점: 개인 메일과 분리, 양도·이양 쉬움, 무료
- 소요: 2분

### 옵션 B: 기존 이메일 + 라벨

기존 Gmail 에 필터 추가:

- 토스 콘솔에 등록할 메일은 기존 메일 그대로 (`eunhwanyu87@gmail.com`)
- Gmail → 설정 → 필터 → "받는 사람: 본인 메일 + 제목에 today-office 포함" → 라벨 적용
- 장점: 새 계정 불필요
- 단점: 개인정보(본명) 노출 가능 — 닉네임 도메인이면 OK

### 자동 응답 템플릿

Gmail → 설정 → 자동답장(휴가 답장) 켜기 — 다음 템플릿 사용:

```
안녕하세요, "오늘도 출근합니다" 운영자입니다.

문의 주셔서 감사합니다. 1인 운영 미니앱이라 답신까지 평일 기준 1~3일이 걸릴 수 있어요.

* 신고 / 차단 요청 — 메시지 ID 와 사유를 함께 보내주시면 더 빠르게 처리할 수 있어요.
* 버그 / 개선 제안 — 발생 시각, 사용 기기(iOS/Android), 어떤 화면에서 일어났는지를 알려주세요.

빠른 시일 안에 답변드리겠습니다.
```

---

## 3단계: 정책 문서 호스팅

토스 콘솔은 **공개된 URL** 을 요구합니다. 다음 중 하나 선택.

### 옵션 A: GitHub Pages (가장 추천 — 무료·영구·검색 잘됨)

```bash
# 0) docs/legal/ 의 .md 파일 그대로 사용 가능. GitHub Pages 가 자동으로 마크다운 → HTML.

# 1) GitHub 에 commutenote 저장소가 없다면 만들고 push
gh repo create today-office --public --source=. --remote=origin
git add . && git commit -m "feat: legal docs"
git push -u origin main

# 2) GitHub repo → Settings → Pages
#    - Source: Deploy from a branch
#    - Branch: main, /docs 폴더 선택
#    - Save
```

발급되는 URL:
- 개인정보 처리방침: `https://<user>.github.io/today-office/legal/privacy-policy`
- 이용약관: `https://<user>.github.io/today-office/legal/terms-of-service`

> ⚠️ Pages 는 보통 5~10분 안에 활성화돼요.

### 옵션 B: Notion 공개 페이지 (가장 빠름)

1. Notion 새 페이지 생성 → 본 마크다운 파일 내용 복사·붙여넣기
2. 우측 상단 "공유" → "웹에서 게시" 토글 ON
3. 발급된 URL 복사 (`https://www.notion.so/...`)
4. 두 문서 각각 동일하게 1~3 반복

> 장점: 5분 완료 / 단점: URL 이 길고 못생김

### 옵션 C: Vercel/Netlify Static Site

GitHub Pages 와 유사하지만 더 예쁜 도메인 가능. 시간 여유 있으면 추천.

---

## 4단계: 토스 콘솔 등록

[Apps in Toss 콘솔](https://console.apps-in-toss.com) 에서:

| 콘솔 항목 | 입력 값 |
|----------|--------|
| 개인정보 처리방침 URL | (3단계에서 발급된 privacy-policy URL) |
| 이용약관 URL | (3단계에서 발급된 terms-of-service URL) |
| 고객센터 이메일 | (2단계에서 결정한 이메일) |
| 고객센터 응대 시간 | 평일 10:00~18:00 |

---

## 📋 셀프 체크 (검수 직전)

- [ ] privacy-policy.md 의 `[운영자 이름]` `[이메일]` 모두 채워짐
- [ ] terms-of-service.md 의 `[운영자 이름]` 채워짐
- [ ] 호스팅 URL 두 개 모두 브라우저에서 접속 시 마크다운이 깔끔히 렌더링됨
- [ ] 등록한 이메일로 본인이 테스트 메일 한 통 보내고 자동 응답 잘 가는지 확인
- [ ] 토스 콘솔 4개 항목 모두 입력 완료
- [ ] 변호사 또는 법무 검토 (예산 있으면 권장, MVP 라면 생략 가능)

---

## ⚖️ 법적 면책

본 가이드와 첨부된 정책 문서는 일반적인 익명 채팅 미니앱을 위한 **출시 템플릿**이에요.
다음과 같은 경우엔 반드시 법무 검토를 받으세요.

- 광고·결제·구독 등 수익화 기능을 추가할 때
- 위치·연락처·사진 등 추가 권한을 사용할 때
- 14세 미만 이용자가 주된 대상이 될 때 (아동 개인정보 별도 보호 필요)
- 해외 거주자 데이터를 처리할 때 (GDPR 등 추가 검토 필요)

---

## 🔗 참고 자료

- 개인정보 보호위원회 - 처리방침 작성지침: https://www.pipc.go.kr
- 한국인터넷진흥원 (KISA) - 정책 가이드: https://www.kisa.or.kr
- 앱인토스 - 출시 정책: https://developers-apps-in-toss.toss.im/intro/guide.md
