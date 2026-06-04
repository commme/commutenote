// 도메인 타입 정의
// localStorage 기반 MVP, 추후 Supabase 전환을 고려한 구조

export type HairStyle = "short" | "long" | "cap" | "bald";
export type Expression = "happy" | "tired" | "neutral" | "sleepy";

export interface Avatar {
  skinTone: string; // hex color
  hairColor: string;
  hairStyle: HairStyle;
  expression: Expression;
  outfit: string; // hex color
}

export interface Profile {
  id: string;
  nickname: string;
  avatar: Avatar;
  equippedItems: string[]; // item ids
  selectedLineId: string | null;
  createdAt: number;
}

export interface SubwayLine {
  id: string;
  name: string; // "2호선"
  shortLabel: string; // "2"
  color: string; // line color hex
  description: string; // 한 줄 분위기
}

export interface Car {
  id: number;
  label: string; // "조용한 칸"
  vibe: string; // 짧은 분위기 설명
}

export interface Message {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  carId: number;
  lineId: string;
  createdAt: number;
  expiresAt: number;
  likeCount: number;
  // 화면 배치를 위한 좌석 인덱스 (0..5)
  slotIndex: number;
  // 다른 유저의 메시지인 경우 그 유저의 아바타 정보를 같이 들고 다님
  avatar: Avatar;
  // 보내는 시점에 착용 중이던 아이템 (안경, 가방 등) — 클라우드 전송 포함
  items: string[];
}

/**
 * 아이템 잠금 해제 조건.
 * - default: 처음부터 사용 가능
 * - first-message: 사용자가 첫 메시지를 보내면 해제
 * - streak-milestone: 연속 출근 N일 달성 시 해제
 * - seat-report: 지하철 자리 보고 시 해제 (Phase 2)
 */
export type UnlockCondition =
  | { type: "default" }
  | { type: "first-message" }
  | { type: "streak-milestone"; days: number }
  | { type: "seat-report" };

export interface ItemDefinition {
  id: string;
  category: "face" | "hair" | "outfit" | "bag" | "accessory" | "expression";
  name: string;
  // 시각화용 미리보기 색
  swatch?: string;
  isDefault: boolean;
  /** 잠금 해제 조건. 없거나 type=default면 처음부터 사용 가능 */
  unlockBy?: UnlockCondition;
}

export interface SamplePassenger {
  id: string;
  nickname: string;
  avatar: Avatar;
  // 칸 안에서 차지할 좌석 인덱스 (0..5). 가운데(2,3)는 보통 비워두고 내 캐릭터 자리.
  slotIndex: number;
}
