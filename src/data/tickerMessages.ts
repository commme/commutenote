// 멘탈 관리 티커 문구 풀 — 가운뎃점(·)으로 자연스러운 흐름 만들기
export const TICKER_PREFIX = "이 열차는 출근 중입니다";

export const TICKER_MESSAGES: string[] = [
  "오늘도 일단 탔으면 절반은 성공이에요",
  "완벽하지 않아도 괜찮아요",
  "커피 전의 나는 아직 로그인 전입니다",
  "오늘 하루도 조용히 지나가길",
  "퇴근은 멀어도 지금 한 걸음은 해냈어요",
  "해야 할 일을 하나씩만 보면 괜찮아져요",
  "나만 힘든 게 아니라는 걸 기억해요",
  "침대를 이긴 당신, 이미 대단합니다",
  "숨 한 번 쉬고 다시 시작해도 늦지 않아요",
  "지금 이 칸에 같이 있는 사람들도 비슷해요",
];

// 한 줄로 합쳐서 끊김 없이 흐르게
export function buildTickerLine(): string {
  return [TICKER_PREFIX, ...TICKER_MESSAGES].join("  ·  ");
}
