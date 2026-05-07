// 익명 유저 ID — 토스 앱 안에서는 getAnonymousKey, 그 외엔 localStorage 프로필 id.
//
// 사용 패턴:
//   1) 앱 부트 시: await ensureUserId()  (1회, AppContext 가 호출)
//   2) 그 후 동기 getUserId()  (어디서든)
//
// ensureUserId 는 idempotent — 여러 번 불러도 캐시된 값 즉시 반환.

import {
  defaultProfile,
  getProfile,
  saveProfile,
} from "./profileService";
import { readJson } from "./storage";
import type { Profile } from "../types";

let resolved: string | null = null;

/**
 * 토스 앱 안에서만 동작. @apps-in-toss/web-framework 의 getAnonymousKey 를
 * 시도. 브라우저 미리보기에서는 import 자체는 가능하지만 호출 시 throw 또는 null.
 */
async function tryGetTossAnonymousKey(): Promise<string | null> {
  try {
    const mod = await import("@apps-in-toss/web-framework");
    // 모듈 내 export 위치는 SDK 버전에 따라 다를 수 있어 방어적으로 접근
    const fn =
      (mod as unknown as { getAnonymousKey?: () => Promise<string> | string })
        .getAnonymousKey ??
      // 일부 버전은 default 안에 들어있을 수 있음
      ((mod as unknown as { default?: { getAnonymousKey?: () => Promise<string> | string } })
        .default?.getAnonymousKey ?? null);

    if (typeof fn !== "function") return null;
    const key = await fn();
    if (typeof key === "string" && key.length > 0) return key;
    return null;
  } catch {
    // 토스 앱 외부거나 SDK 호출 실패 — 조용히 fallback
    return null;
  }
}

/**
 * 한 번만 비동기로 user_id 결정.
 * - 기존 profile 이 있으면 그 id 유지 (마이그레이션 회피, 메시지 연속성)
 * - 없으면 토스 anon key 시도 → 실패 시 random UUID
 */
export async function ensureUserId(): Promise<string> {
  if (resolved) return resolved;

  // 이미 저장된 프로필이 있으면 그 id 사용 (안정성 우선)
  const stored = readJson<Profile | null>("profile", null);
  if (stored?.id) {
    resolved = stored.id;
    return resolved;
  }

  // 신규 — 토스 anon key 우선, fallback 은 random UUID
  const tossKey = await tryGetTossAnonymousKey();
  const profile = defaultProfile(tossKey ?? undefined);
  saveProfile(profile);
  resolved = profile.id;
  return resolved;
}

/**
 * 동기 getter. ensureUserId 가 한 번 resolve 된 이후라면 캐시 반환.
 * 그 전이라면 profile.id 동기 fallback (없으면 createId 로 즉시 생성).
 */
export function getUserId(): string {
  if (resolved) return resolved;
  return getProfile().id;
}
