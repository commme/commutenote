// =========================================================
// tickerMessages.ts
// 상단에 흐르는 멘탈케어 티커 — 시간대(출근/점심/오후/퇴근/귀가/심야)별로 다르게.
// =========================================================

import { getTimeSlot, type TimeSlot } from "./contextualMessages";

// "이 열차는 ___ 중입니다" — 시간대별 접두 문구
const PREFIX_BY_SLOT: Record<TimeSlot, string> = {
  night: "이 열차는 막차를 향해 달리는 중입니다",
  morning: "이 열차는 출근 중입니다",
  lunch: "이 열차는 잠시 숨 고르는 중입니다",
  afternoon: "이 열차는 오후를 달리는 중입니다",
  evening: "이 열차는 퇴근 중입니다",
  lateEvening: "이 열차는 집으로 가는 중입니다",
};

// 시간대별 멘탈케어 문구 풀
const TICKER_BY_SLOT: Record<TimeSlot, string[]> = {
  // 23:00 ~ 05:59  심야
  night: [
    "이 시간까지 움직이는 당신, 진짜 고생 많아요",
    "무리하지 말고 들어가서 푹 쉬어요",
    "오늘 하루도 끝까지 버텨낸 당신, 대단해요",
    "내일은 조금 덜 바빴으면 좋겠어요",
    "졸릴 땐 잠깐 눈 감아도 괜찮아요",
  ],
  // 06:00 ~ 10:59  출근
  morning: [
    "오늘도 일단 탔으면 절반은 성공이에요",
    "침대를 이긴 당신, 이미 대단합니다",
    "커피 전의 나는 아직 로그인 전입니다",
    "완벽하지 않아도 괜찮아요",
    "출근길 만원 지하철도 곧 끝나요",
    "오늘 하루도 조용히 지나가길",
    "해야 할 일은 하나씩만 보면 괜찮아져요",
  ],
  // 11:00 ~ 13:59  점심
  lunch: [
    "오전을 버텨낸 당신, 정말 잘했어요",
    "점심 제대로 챙겨 드세요",
    "밥 먹고 졸린 건 너무 자연스러운 거예요",
    "오후도 한 걸음씩만 가면 돼요",
    "잠깐의 점심시간이 하루를 버티게 해줘요",
    "맛있는 거 먹고 기운 내요",
  ],
  // 14:00 ~ 16:59  오후
  afternoon: [
    "퇴근까지 한 걸음 한 걸음",
    "오후의 나른함은 다들 비슷하게 느껴요",
    "당 떨어질 땐 잠깐 쉬어도 괜찮아요",
    "이 시간만 지나면 좀 나아져요",
    "지금까지 잘 버텼어요, 조금만 더",
    "집중 안 될 땐 물 한 잔 마시고 와요",
  ],
  // 17:00 ~ 20:59  퇴근
  evening: [
    "오늘 하루도 정말 수고했어요",
    "퇴근하는 당신, 충분히 잘했어요",
    "집에 가서는 아무것도 안 해도 돼요",
    "내일 걱정은 내일의 나에게 맡겨요",
    "퇴근길의 한숨, 충분히 쉬어도 돼요",
    "오늘의 나에게 수고했다고 말해주세요",
  ],
  // 21:00 ~ 22:59  귀가
  lateEvening: [
    "이제 거의 다 왔어요, 조금만 더",
    "오늘 하루를 끝까지 버텨낸 당신",
    "집에 도착하면 따뜻하게 씻고 쉬어요",
    "야근하고 가는 길이라면, 정말 고생 많았어요",
    "내일은 조금 더 가벼운 하루이길",
  ],
};

// 언제든 자연스러운 일반 풀
const TICKER_GENERIC: string[] = [
  "나만 힘든 게 아니라는 걸 기억해요",
  "지금 이 칸에 같이 있는 사람들도 비슷해요",
  "숨 한 번 쉬고 다시 시작해도 늦지 않아요",
  "오늘 하루도 무사하시길",
];

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 호환용 export (다른 곳에서 참조할 수 있어 유지)
export const TICKER_PREFIX = PREFIX_BY_SLOT.morning;

/**
 * 한 줄로 합쳐서 끊김 없이 흐르게.
 * 현재 시간대 접두 문구 + 그 시간대 멘탈케어 풀(셔플) + 일반 풀(셔플 일부).
 */
export function buildTickerLine(now: Date = new Date()): string {
  const slot = getTimeSlot(now);
  const prefix = PREFIX_BY_SLOT[slot];
  const slotMsgs = shuffle(TICKER_BY_SLOT[slot]);
  const generic = shuffle(TICKER_GENERIC).slice(0, 2);
  return [prefix, ...slotMsgs, ...generic].join("  ·  ");
}
