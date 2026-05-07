import type { SubwayLine, Car } from "../types";

// 노선 정의 — 헤더/도어/벽 포인트 컬러로 사용
export const SUBWAY_LINES: SubwayLine[] = [
  {
    id: "line-2",
    name: "2호선",
    shortLabel: "2",
    color: "#34C759",
    description: "순환선 직장인의 영원한 친구",
  },
  {
    id: "line-3",
    name: "3호선",
    shortLabel: "3",
    color: "#FF8A3D",
    description: "출근길 대각선 횡단",
  },
  {
    id: "line-7",
    name: "7호선",
    shortLabel: "7",
    color: "#7D8B2E",
    description: "초록 라인의 묵직한 출근",
  },
  {
    id: "line-9",
    name: "9호선",
    shortLabel: "9",
    color: "#C6A34A",
    description: "급행으로 빠르게 출근",
  },
  {
    id: "line-sb",
    name: "신분당선",
    shortLabel: "신",
    color: "#E2574C",
    description: "남쪽에서 강남으로",
  },
];

export const DEFAULT_LINE_ID = "line-2";

export function getLineById(id: string | null): SubwayLine {
  return (
    SUBWAY_LINES.find((line) => line.id === id) ?? SUBWAY_LINES[0]
  );
}

// 칸 정의 — 분위기만 다르고 첫 MVP는 데이터 공용
export const CARS: Car[] = [
  { id: 0, label: "조용한 칸", vibe: "다들 잠시 숨 고르는 중" },
  { id: 1, label: "커피 칸", vibe: "오늘의 카페인 동지들" },
  { id: 2, label: "월요병 칸", vibe: "주말이 너무 짧았어요" },
  { id: 3, label: "버티는 칸", vibe: "오늘만 버티면 돼요" },
];

export function getCarById(id: number): Car {
  return CARS.find((car) => car.id === id) ?? CARS[0];
}
