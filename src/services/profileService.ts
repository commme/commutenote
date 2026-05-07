import type { Profile } from "../types";
import { createId } from "../utils/ids";
import { getDevUserSuffix, readJson, writeJson } from "./storage";

// URL ?u=alice 가 있으면 'profile:alice' 처럼 분리 저장 (멀티유저 시뮬레이션용)
const PROFILE_KEY = `profile${getDevUserSuffix()}`;

const DEFAULT_NICKNAMES = [
  "오늘의출근러",
  "조용한승객",
  "월요일전사",
  "커피주문중",
  "퇴근까지버틴다",
  "이번칸손님",
];

function pickNickname(): string {
  return DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)];
}

// idOverride 가 주어지면 그 id 로 (토스 anon key 등), 아니면 새 UUID 발급
export function defaultProfile(idOverride?: string): Profile {
  return {
    id: idOverride ?? createId("user"),
    nickname: pickNickname(),
    avatar: {
      skinTone: "#F4D2B7",
      hairColor: "#1F2937",
      hairStyle: "short",
      expression: "neutral",
      outfit: "#2F6BFF",
    },
    equippedItems: ["acc-coffee"],
    selectedLineId: null,
    createdAt: Date.now(),
  };
}

export function getProfile(): Profile {
  const stored = readJson<Profile | null>(PROFILE_KEY, null);
  if (stored && stored.id && stored.avatar) {
    return stored;
  }
  const fresh = defaultProfile();
  writeJson(PROFILE_KEY, fresh);
  return fresh;
}

export function saveProfile(profile: Profile): void {
  writeJson(PROFILE_KEY, profile);
}

export function updateProfile(updates: Partial<Profile>): Profile {
  const current = getProfile();
  const next: Profile = { ...current, ...updates };
  saveProfile(next);
  return next;
}
