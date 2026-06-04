import type { ItemDefinition } from "../types";

// 첫 MVP는 하드코딩된 카탈로그. 추후 Supabase에서 가져오도록 분리.
export const ITEM_CATALOG: ItemDefinition[] = [
  // 헤어
  { id: "hair-short", category: "hair", name: "기본 단발", isDefault: true, swatch: "#1F2937" },
  { id: "hair-long", category: "hair", name: "긴 머리", isDefault: false, swatch: "#7C5B3B" },
  { id: "hair-cap", category: "hair", name: "야구모자", isDefault: false, swatch: "#102A56" },
  { id: "hair-bald", category: "hair", name: "민머리", isDefault: false, swatch: "#F2C79B" },

  // 표정
  { id: "exp-happy", category: "expression", name: "방긋", isDefault: false },
  { id: "exp-tired", category: "expression", name: "피곤", isDefault: true },
  { id: "exp-neutral", category: "expression", name: "무표정", isDefault: false },
  { id: "exp-sleepy", category: "expression", name: "졸림", isDefault: false },

  // 옷 (색)
  { id: "outfit-blue", category: "outfit", name: "출근 블루", isDefault: true, swatch: "#3B5BFF" },
  { id: "outfit-navy", category: "outfit", name: "정장 네이비", isDefault: false, swatch: "#0F2A4F" },
  { id: "outfit-orange", category: "outfit", name: "주황 후드", isDefault: false, swatch: "#FF8A3D" },
  { id: "outfit-gray", category: "outfit", name: "그레이 셔츠", isDefault: false, swatch: "#637381" },

  // 가방
  { id: "bag-laptop", category: "bag", name: "노트북 가방", isDefault: false },
  { id: "bag-tote", category: "bag", name: "에코백", isDefault: false },

  // 소품
  { id: "acc-glasses", category: "accessory", name: "안경", isDefault: false },
  { id: "acc-coffee", category: "accessory", name: "커피컵", isDefault: false },
  { id: "acc-earphones", category: "accessory", name: "이어폰", isDefault: false },
  { id: "acc-mask", category: "accessory", name: "마스크", isDefault: false },

  // 잠금 해제 보상 아이템 (V1.2)
  {
    id: "acc-bear-hat",
    category: "accessory",
    name: "곰돌이 비니",
    isDefault: false,
    unlockBy: { type: "first-message" },
  },
  {
    id: "acc-pink-ribbon",
    category: "accessory",
    name: "분홍 리본",
    isDefault: false,
    unlockBy: { type: "streak-milestone", days: 3 },
  },
  {
    id: "acc-crown",
    category: "accessory",
    name: "출근왕 왕관",
    isDefault: false,
    unlockBy: { type: "streak-milestone", days: 7 },
  },
  {
    id: "acc-star-badge",
    category: "accessory",
    name: "한 달 별 뱃지",
    isDefault: false,
    unlockBy: { type: "streak-milestone", days: 30 },
  },
];

export function getItemsByCategory(category: ItemDefinition["category"]): ItemDefinition[] {
  return ITEM_CATALOG.filter((item) => item.category === category);
}

export function getItemDefinition(id: string): ItemDefinition | undefined {
  return ITEM_CATALOG.find((item) => item.id === id);
}
