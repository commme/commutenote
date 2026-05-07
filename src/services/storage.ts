// localStorage 안전 래퍼
// SSR/AIT 샌드박스 환경 안전성 + JSON 직렬화 처리

const PREFIX = "today-office:";

/**
 * dev 편의: URL 에 ?u=alice 같은 파라미터가 있으면 그 값을
 * user-scoped 키 suffix 로 사용한다. 같은 브라우저에서 멀티유저 흉내낼 때 사용.
 *
 * 주의: dev 환경에서만 의도된 것. production 에서는 URL 에 안 붙이면 동작 동일.
 */
export function getDevUserSuffix(): string {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    if (u && /^[a-zA-Z0-9_-]{1,16}$/.test(u)) {
      return `:${u}`;
    }
  } catch {
    // ignore
  }
  return "";
}

function isAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!isAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!isAvailable()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota / private mode 등은 조용히 무시
  }
}

export function remove(key: string): void {
  if (!isAvailable()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
