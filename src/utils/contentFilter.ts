// 메시지 검열 — 익명/오픈형이라 서버 trigger 와 동일 정책을 클라에서도 미러링.
// 서버는 마지막 방어선, 여기는 빠른 피드백용.

const PROFANITY: string[] = [
  // 한국어
  "씨발",
  "시발",
  "ㅅㅂ",
  "병신",
  "ㅂㅅ",
  "개새끼",
  "지랄",
  "꺼져",
  "좆",
  "존나",
  "씹새",
  "미친년",
  "미친놈",
  "ㅈㄴ",
  "조까",
  "새끼",
  "또라이",
  "등신",
  "머저리",
  "빡친",
  "죽일",
  // 영어
  "fuck",
  "fck",
  "shit",
  "sht",
  "bitch",
  "btch",
  "asshole",
  "dick",
  "pussy",
  "motherfucker",
  // 차별/혐오
  "짱깨",
  "쪽바리",
  "깜둥이",
  "좆본",
  "한남충",
  "꼴페미",
  "메갈",
  "일베",
  "좌좀",
  "우좀",
  "게이새끼",
  "레즈새끼",
  "트젠새끼",
  // 음란
  "자위",
  "발기",
  "오르가즘",
  "딸딸이",
  "섹스해",
  "강간",
  "야동",
  "야사",
];

const PII_PATTERNS: RegExp[] = [
  /\b\d{2,3}-?\d{3,4}-?\d{4}\b/, // 전화번호
  /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/, // 이메일
  /\b\d{6}-?\d{7}\b/, // 주민번호
  /(인스타|insta|카톡|kakao|텔레|telegram|디스코드|discord|라인id|line\s*id|위챗|wechat)\s*[:：]?\s*\S+/i,
  /(open\.kakao|오픈채팅|오픈톡|오카방|오픈카톡)/i,
];

const URL_PATTERN =
  /(https?:\/\/|www\.|\.(com|net|org|kr|co\.kr|io|gg|me|ly|im|to|app|live|xyz|info|biz)(\/|\s|$|\?))/i;

const FINANCIAL_SCAM =
  /(투자\s*수익|수익\s*보장|코인\s*리딩|리딩\s*방|선물\s*거래|단타|비트코인.*투자|이더리움.*투자|현금\s*화|불법\s*대출|일\s*수|급전|주식\s*리딩)/i;

const IMPERSONATION =
  /(운영자\s*(입니다|이에요|예요|임)|관리자\s*(입니다|이에요|예요|임)|토스\s*(직원|운영|고객센터|관리|공지))/i;

const PROMOTION =
  /(초대\s*코드|할인\s*쿠폰|이벤트\s*참여|친구\s*\d+\s*명|이\s*링크|구독.*하면|좋아요.*누르면)/i;

const SPAM_REPEAT = /(.)\1{7,}/; // 같은 글자 8회 이상

// 타인을 향한 위협/폭력 — 차단
const VIOLENCE =
  /(죽이고\s*싶|죽여\s*버|죽여\s*줄|죽일\s*거(야|에요)|살해|패고\s*싶|때리고\s*싶|두들겨\s*패|칼로\s*찌|폭력|폭행|협박|패\s*죽이|짓밟|박살\s*낼)/i;

// 자살/자해 — 차단하지 않고 1393 안내만 (혼자 힘들어하는 신호일 수 있음)
const DISTRESS =
  /(자살|자해|죽고\s*싶|뛰어내리|목매|손목\s*긋|살기\s*싫|살\s*의지|숨\s*쉬기\s*싫|사라지고\s*싶)/i;

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

  // 1) URL — 명확한 안내
  if (URL_PATTERN.test(trimmed)) {
    return { ok: false, reason: "외부 링크는 보낼 수 없어요." };
  }

  // 2) PII — 전화/이메일/주민/SNS/오픈채팅
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "개인정보·외부 채팅 유도는 차단돼요." };
    }
  }

  // 3) 금융 사기 — 토스 환경 핵심
  if (FINANCIAL_SCAM.test(trimmed)) {
    return { ok: false, reason: "투자·금융 권유는 보낼 수 없어요." };
  }

  // 4) 사칭
  if (IMPERSONATION.test(trimmed)) {
    return { ok: false, reason: "운영자·토스 사칭으로 보일 수 있는 표현이에요." };
  }

  // 5) 광고/외부 유도
  if (PROMOTION.test(trimmed)) {
    return { ok: false, reason: "광고·홍보성 표현은 보낼 수 없어요." };
  }

  // 6) 도배 스팸
  if (SPAM_REPEAT.test(trimmed)) {
    return { ok: false, reason: "같은 글자가 너무 길게 반복돼요." };
  }

  // 6-1) 타인 향한 위협/폭력
  if (VIOLENCE.test(trimmed)) {
    return { ok: false, reason: "위협·폭력 표현은 보낼 수 없어요." };
  }

  // 7) 욕설 (강화 정규화 — 공백/숫자/특수문자 제거 후 lower)
  const normalized = trimmed
    .toLowerCase()
    .replace(/[\s\d!@#$%^&*.,?\-_]+/g, "");
  for (const word of PROFANITY) {
    if (normalized.includes(word.toLowerCase())) {
      return { ok: false, reason: "조금 더 부드러운 표현으로 바꿔주세요." };
    }
  }

  return { ok: true, cleaned: trimmed };
}

/**
 * 자살/자해 키워드 감지 — 메시지를 차단하지 않음.
 * 매치 시 호출자가 1393 안내 토스트를 보여줌. 혼자 힘들어하는 신호를 막지 않는 게 원칙.
 */
export function detectDistress(input: string): boolean {
  return DISTRESS.test(input);
}
