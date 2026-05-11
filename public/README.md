# 정적 자산 폴더 (public/)

Vite 가 자동으로 root 경로에서 서빙해요.
예: `public/characters/pax-1.png` → 코드에서 `<img src="/characters/pax-1.png" />`

---

## 📁 폴더 별 용도 + 권장 파일명

### 🧑 `public/characters/` — 승객 캐릭터
무엇: 한 사람씩 그려진 PNG (배경 투명)
크기: **256x256 또는 512x512** (정사각형, 발끝에서 머리까지 꽉 차게)
형식: PNG (투명 배경) 또는 WebP

권장 파일명 (제가 코드 연결할 때 쓸 이름):
```
pax-coffee.png       ← 커피 들고 있는 캐릭터
pax-sleepy.png       ← 졸린 표정
pax-headphones.png   ← 이어폰 낀 캐릭터
pax-smile.png        ← 웃는 캐릭터
pax-tired.png        ← 지친 캐릭터
pax-reading.png      ← 책 보는 캐릭터
pax-mask.png         ← 마스크 쓴 캐릭터
pax-default.png      ← 기본 캐릭터
```

→ 5~8개 정도 만들면 좌석 다양성 충분.

### ☕ `public/items/` — 아이템 (커피·이어폰·가방 등)
무엇: 작은 액세서리 PNG
크기: **128x128**, 투명 배경

권장 파일명:
```
item-coffee.png
item-earphones.png
item-bag-laptop.png
item-bag-tote.png
item-glasses.png
item-mask.png
```

### 🎬 `public/lottie/` — 움직이는 애니메이션
무엇: LottieFiles 에서 다운받은 JSON
[lottiefiles.com/free-animations](https://lottiefiles.com/free-animations) 에서 검색

추천 검색 키워드:
- `subway`, `train`, `commute`
- `coffee`, `sleepy`, `tired worker`
- `loading`, `success`, `heart`

권장 파일명:
```
loading.json         ← 로딩 화면용
empty-train.json     ← 빈 칸 안내
heart-burst.json     ← 좋아요 폭발 효과
sleeping-worker.json ← 캐릭터 졸기 애니메이션
```

### 🎨 `public/illustrations/` — 빈 상태/에러 일러스트
무엇: 한 화면 가득 채우는 큰 일러스트 (uDraw, Storyset 등)
크기: **800x600 또는 1200x900** PNG/SVG

추천 사이트:
- [Storyset](https://storyset.com) — 컬러·표정 커스터마이즈 가능, 무료
- [unDraw](https://undraw.co) — 토스 톤, 색상 변경 가능
- [Pixeltrue](https://www.pixeltrue.com/free-illustrations) — 둥글둥글, 무료

권장 파일명:
```
empty-state.svg      ← 메시지 없을 때
error-screen.svg     ← 에러 화면
welcome.svg          ← 첫 진입 환영
```

---

## 🔗 다운로드 받을 때 추천 사이트

| 종류 | 사이트 | 비용 |
|---|---|---|
| 캐릭터 일러스트 | [Storyset](https://storyset.com) | 무료 (저작자 표시 권장) |
| 캐릭터 일러스트 | [unDraw](https://undraw.co) | 무료 (저작자 표시 X) |
| 캐릭터 PNG (생성형 AI) | [Bing Image Creator](https://www.bing.com/images/create) | 무료 (DALL·E 3, 하루 25장) |
| Lottie 애니메이션 | [LottieFiles](https://lottiefiles.com) | 무료 (free 필터) |
| 아이콘 | [Iconify](https://icon-sets.iconify.design) | 무료 |
| 픽셀 게임 자산 | [OpenGameArt](https://opengameart.org) | 무료 (CC 라이선스) |

---

## 📌 다운로드 후

자산 넣으면 **저한테 알려주세요**:
1. 파일 이름 (예: `pax-coffee.png`, `pax-sleepy.png`)
2. 어떤 컴포넌트에 적용할지 (캐릭터 / 아이템 / 로딩 / 빈 상태 등)

→ 제가 코드에서 SVG 대신 이미지로 swap 해드릴게요.

---

## ⚠️ 주의

- **저작권 확인 필수** — 사이트마다 라이선스 다름 (CC0/CC-BY/Free for commercial use 등)
- **이미지 용량** — 각 PNG 200KB 이하 권장 (앱 크기 영향)
- **WebP 형식이 PNG보다 30~50% 작음** — Squoosh.app 으로 변환 가능
- **public/ 안 파일은 git 에 커밋됨** — 라이선스 문서도 같이 넣어두면 안전
