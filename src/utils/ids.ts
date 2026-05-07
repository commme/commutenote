// 가벼운 id 생성기 (uuid 대신 의존성 없이)
export function createId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}-${rand}`;
}
