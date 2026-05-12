import type { SubwayLine, Car } from "../types";

// 노선 정의 — 헤더/도어/벽 포인트 컬러로 사용
// 컬러는 서울교통공사 공식 라인 컬러 기준
export const SUBWAY_LINES: SubwayLine[] = [
  {
    id: "line-1",
    name: "1호선",
    shortLabel: "1",
    color: "#0052A4",
    description: "수도권을 길게 잇는 맏형",
  },
  {
    id: "line-2",
    name: "2호선",
    shortLabel: "2",
    color: "#00A84D",
    description: "순환선 직장인의 영원한 친구",
  },
  {
    id: "line-3",
    name: "3호선",
    shortLabel: "3",
    color: "#EF7C1C",
    description: "출근길 대각선 횡단",
  },
  {
    id: "line-4",
    name: "4호선",
    shortLabel: "4",
    color: "#00A5DE",
    description: "하늘색 라인의 든든한 출근",
  },
  {
    id: "line-5",
    name: "5호선",
    shortLabel: "5",
    color: "#996CAC",
    description: "보라색 라인 따라 한강 건너",
  },
  {
    id: "line-6",
    name: "6호선",
    shortLabel: "6",
    color: "#CD7C2F",
    description: "갈색 라인의 잔잔한 출근",
  },
  {
    id: "line-7",
    name: "7호선",
    shortLabel: "7",
    color: "#747F00",
    description: "초록 라인의 묵직한 출근",
  },
  {
    id: "line-8",
    name: "8호선",
    shortLabel: "8",
    color: "#E6186C",
    description: "분홍 라인의 짧고 굵은 출근",
  },
  {
    id: "line-9",
    name: "9호선",
    shortLabel: "9",
    color: "#BDB092",
    description: "급행으로 빠르게 출근",
  },
  {
    id: "line-sb",
    name: "신분당선",
    shortLabel: "신",
    color: "#D4003B",
    description: "남쪽에서 강남으로",
  },
  {
    id: "line-bundang",
    name: "수인분당선",
    shortLabel: "분",
    color: "#FABE00",
    description: "분당·수원 출근러의 동맥",
  },
  {
    id: "line-gm",
    name: "경의중앙선",
    shortLabel: "경",
    color: "#77C4A3",
    description: "서쪽에서 동쪽까지 길게",
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
