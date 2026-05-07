// 메시지 검열 — 익명/오픈형이라 최소한의 안전장치
// MVP 단계의 보수적 필터. 추후 서버 측 검증으로 옮겨야 함.

const PROFANITY: string[] = [
  // 가장 기본적인 것만, 단어 단위 매칭
  "씨발",
  "시발",
  "ㅅㅂ",
  "병신",
  "ㅂㅅ",
  "개새끼",
  "지랄",
  "꺼져",
];

const PII_PATTERNS: RegExp[] = [
  /\b\d{2,3}-?\d{3,4}-?\d{4}\b/, // 전화번호
  /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/, // 이메일
  /\b\d{6}-?\d{7}\b/, // 주민번호 패턴
  /(인스타|insta|카톡|kakao|텔레|telegram|디스코드|discord)\s*[:：]?\s*\S+/i, // SNS 유도
];

export const MAX_MESSAGE_LENGTH = 40;
export const COOLDOWN_MS = 8000; // 8초 쿨타임

export type ValidationResult =
  | { ok: true; cleaned: string }
  | { ok: false; reason: string };

export function validateMessage(input: string): ValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: "메시지를 입력해 주세요." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: `${MAX_MESSAGE_LENGTH}자 이내로 적어주세요.` };
  }
  const lower = trimmed.replace(/\s+/g, "");
  for (const word of PROFANITY) {
    if (lower.includes(word)) {
      return { ok: false, reason: "조금 더 부드러운 표현으로 바꿔주세요." };
    }
  }
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "개인정보가 포함된 것 같아요." };
    }
  }
  return { ok: true, cleaned: trimmed };
}
