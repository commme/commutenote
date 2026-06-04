// =========================================================
// unlockService.ts
// 아이템 잠금 해제 — localStorage 기반.
// 첫 메시지 / 출석 streak 마일스톤 / 자리 보고 등의 조건으로
// 캐릭터 액세서리 잠금을 해제하는 보상 시스템.
// =========================================================

import { getItemDefinition, ITEM_CATALOG } from "../data/items";
import type { ItemDefinition, UnlockCondition } from "../types";
import { getDevUserSuffix, readJson, writeJson } from "./storage";

const KEY = `unlocks${getDevUserSuffix()}`;

interface UnlockState {
  /** 잠금 해제된 아이템 id 배열 */
  ids: string[];
}

const EMPTY: UnlockState = { ids: [] };

function read(): UnlockState {
  const s = readJson<UnlockState>(KEY, EMPTY);
  return { ids: Array.isArray(s.ids) ? s.ids : [] };
}

function write(state: UnlockState): void {
  writeJson(KEY, state);
}

/** 기본 제공(잠금 X) 아이템인지 */
export function isDefaultItem(def: ItemDefinition): boolean {
  return !def.unlockBy || def.unlockBy.type === "default";
}

/** 사용자가 사용 가능한 아이템인지 (default거나 잠금 해제됨) */
export function isItemAvailable(id: string): boolean {
  const def = getItemDefinition(id);
  if (!def) return false;
  if (isDefaultItem(def)) return true;
  return read().ids.includes(id);
}

/**
 * 해당 아이템 잠금 해제. 처음 해제될 때만 true 반환.
 * 이미 해제됐거나 default 아이템이면 false.
 */
export function unlockItem(id: string): boolean {
  const def = getItemDefinition(id);
  if (!def || isDefaultItem(def)) return false;
  const state = read();
  if (state.ids.includes(id)) return false;
  state.ids.push(id);
  write(state);
  return true;
}

/** 조건에 매칭되는 첫 번째 아이템 정의 */
function findItemByCondition(
  predicate: (c: UnlockCondition) => boolean,
): ItemDefinition | undefined {
  return ITEM_CATALOG.find((i) => i.unlockBy && predicate(i.unlockBy));
}

/** 첫 메시지로 해제될 아이템 정의 */
export function getFirstMessageReward(): ItemDefinition | undefined {
  return findItemByCondition((c) => c.type === "first-message");
}

/** streak 마일스톤(days)으로 해제될 아이템 정의 */
export function getStreakReward(days: number): ItemDefinition | undefined {
  return findItemByCondition(
    (c) => c.type === "streak-milestone" && c.days === days,
  );
}

/** 현재 잠금 해제된 모든 아이템 id Set */
export function getUnlockedIds(): Set<string> {
  return new Set(read().ids);
}

/** 잠긴 아이템을 사용자에게 보여줄 짧은 안내 문구 */
export function describeUnlockCondition(c: UnlockCondition): string {
  switch (c.type) {
    case "default":
      return "처음부터 사용 가능";
    case "first-message":
      return "한마디 보내면 해제";
    case "streak-milestone":
      return `${c.days}일 연속 출근하면 해제`;
    case "seat-report":
      return "자리 보고하면 해제";
  }
}
