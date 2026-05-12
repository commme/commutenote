// =========================================================
// contextualMessages.ts
// 현재 시각(시간대) + 요일에 맞는 더미 메시지를 골라준다.
// 시간대는 3~4시간 블록 6개.
// =========================================================

type TimeSlot =
  | "night"       // 23:00 ~ 05:59  심야/새벽 (~6시간)
  | "morning"     // 06:00 ~ 10:59  출근 (~5시간)
  | "lunch"       // 11:00 ~ 13:59  점심 (~3시간)
  | "afternoon"   // 14:00 ~ 16:59  오후 (~3시간)
  | "evening"     // 17:00 ~ 20:59  퇴근 (~4시간)
  | "lateEvening";// 21:00 ~ 22:59  귀가/저녁 (~2시간)

type DayType =
  | "monday"   // 월
  | "friday"   // 금
  | "midweek"  // 화수목
  | "weekend"; // 토일

export function getTimeSlot(d: Date = new Date()): TimeSlot {
  const h = d.getHours();
  if (h < 6) return "night";        // 0~5
  if (h < 11) return "morning";     // 6~10
  if (h < 14) return "lunch";       // 11~13
  if (h < 17) return "afternoon";   // 14~16
  if (h < 21) return "evening";     // 17~20
  if (h < 23) return "lateEvening"; // 21~22
  return "night";                   // 23
}

export function getDayType(d: Date = new Date()): DayType {
  const day = d.getDay(); // 0=일 ... 6=토
  if (day === 0 || day === 6) return "weekend";
  if (day === 1) return "monday";
  if (day === 5) return "friday";
  return "midweek";
}

// 언제든 자연스러운 일반 풀 (기본 비중)
const GENERIC: string[] = [
  "오늘 하루도 무사히",
  "지하철이 따뜻하다",
  "다들 어디로 가는 걸까",
  "이 칸 사람들 다 비슷한 표정",
  "노래 한 곡 추천받아요",
  "완벽하지 않아도 괜찮아",
  "일단 탔으면 절반은 성공",
  "조용히 지나갔으면",
  "숨 한 번 쉬고 가자",
  "나만 힘든 거 아니죠",
];

// 시간대별 풀 (3~4시간 블록)
const BY_TIME: Record<TimeSlot, string[]> = {
  // 23:00 ~ 05:59
  night: [
    "이 시간에 움직이는 우리…",
    "야간 근무조 화이팅",
    "졸려요 진짜 졸려요",
    "내일의 나에게 미안하다",
    "막차/첫차 안 놓쳐서 다행",
    "이 시간 지하철은 좀 쓸쓸하네",
    "택시 탈 걸 그랬나",
  ],
  // 06:00 ~ 10:59  출근
  morning: [
    "출근길 만원 지하철 클리어",
    "오늘도 출근 성공",
    "침대를 이긴 당신 대단해요",
    "커피 한잔이 절실하다",
    "오늘 회의만 안 잡혀있길",
    "지각 안 했다 다행",
    "아침부터 사람 너무 많아",
    "해도 못 보고 출근 중",
    "오전이 제일 길다",
    "메일함 보기 무섭다",
  ],
  // 11:00 ~ 13:59  점심
  lunch: [
    "점심 뭐 먹을지 정했어요?",
    "밥 먹고 졸린 거 정상이죠",
    "점심시간이 제일 행복해",
    "오후도 버텨봅시다",
    "커피 한잔 더 하러 가는 길",
    "벌써 반나절 지났네",
    "점심 메뉴 추천받아요",
  ],
  // 14:00 ~ 16:59  오후
  afternoon: [
    "오후 3시의 나른함",
    "퇴근까지 조금만 더",
    "당 떨어진다 초콜릿 어디",
    "오늘 안에 끝낼 수 있을까",
    "이 시간만 지나면 좀 낫다",
    "졸음과의 싸움 중",
    "퇴근 시간 왜 안 와요",
  ],
  // 17:00 ~ 20:59  퇴근
  evening: [
    "드디어 퇴근이다",
    "퇴근길 지하철도 만원이네",
    "오늘 하루도 수고했어요",
    "집 가서 아무것도 안 할 거예요",
    "퇴근하니까 발걸음이 가볍다",
    "내일도 출근이라는 게 함정",
    "저녁 뭐 먹지 행복한 고민",
    "야근 안 하고 가는 길… 맞죠?",
  ],
  // 21:00 ~ 22:59  귀가
  lateEvening: [
    "집 가는 길이 제일 좋아",
    "오늘 하루 잘 버텼다",
    "내일 생각은 내일 하기로",
    "이 시간 지하철은 좀 한산하네",
    "야근하고 가는 길… 고생했어요",
    "씻고 바로 누울 거예요",
  ],
};

// 요일별 풀
const BY_DAY: Record<DayType, string[]> = {
  monday: [
    "월요일은 왜 이렇게 빨리 와요",
    "월요병 다들 무사하신가요",
    "주말이 짧았어요 너무 짧았어요",
    "이번 주도 시작이네요",
    "월요일 출근러 손",
  ],
  friday: [
    "불금이다 드디어 금요일",
    "오늘만 버티면 주말",
    "금요일은 발걸음부터 다르다",
    "주말 계획 있으신가요",
    "이번 주도 다들 고생했어요",
  ],
  midweek: [
    "주중반 무사히 넘어가는 중",
    "주말까지 며칠 안 남았어요",
    "오늘만 지나면 좀 낫다",
    "수요일은 한 주의 고비",
    "화요일이 제일 애매하다",
  ],
  weekend: [
    "주말인데 출근하는 우리…",
    "주말 근무 수당은 챙겨주시죠?",
    "남들 쉴 때 일하는 기분",
    "주말 출근은 좀 슬프네요",
    "그래도 길은 한산해서 좋다",
  ],
};

/**
 * 현재 시각/요일에 어울리는 메시지 하나를 랜덤으로 반환.
 * 비중: 시간대 35% / 요일 25% / 일반 40%.
 */
export function pickContextualMessage(now: Date = new Date()): string {
  const timePool = BY_TIME[getTimeSlot(now)];
  const dayPool = BY_DAY[getDayType(now)];

  const r = Math.random();
  let pool: string[];
  if (r < 0.35) pool = timePool;
  else if (r < 0.6) pool = dayPool;
  else pool = GENERIC;

  if (!pool || pool.length === 0) pool = GENERIC;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 티커(상단 흐르는 문구)용 — 시간대 한 줄.
 */
export function buildContextualTickerExtras(now: Date = new Date()): string[] {
  const head: Record<TimeSlot, string> = {
    night: "이 시간에 움직이는 당신, 진짜 고생 많아요",
    morning: "출근길 만원 지하철, 오늘도 잘 버텨요",
    lunch: "점심시간이 다가와요, 조금만 더",
    afternoon: "오후의 나른함, 다들 비슷해요",
    evening: "퇴근길입니다, 오늘 하루도 수고했어요",
    lateEvening: "집으로 가는 길, 푹 쉬어요",
  };
  return [head[getTimeSlot(now)]];
}
