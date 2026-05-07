import type { Avatar as AvatarType, Expression, HairStyle } from "../types";

interface AvatarProps {
  avatar: AvatarType;
  items?: string[];
  size?: number; // 캐릭터 높이 px
  isMine?: boolean;
}

/**
 * 토스 캐릭터 풍 SVG 아바타
 * - viewBox 80x120 기준, size로 비례 스케일
 * - hairStyle / expression / outfit / 아이템 조합으로 외형 결정
 */
export function Avatar({
  avatar,
  items = [],
  size = 100,
  isMine = false,
}: AvatarProps) {
  const width = Math.round(size * 0.7);
  const has = (id: string) => items.includes(id);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 80 120"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      {/* 발 밑 그림자 / 내 캐릭터 글로우 */}
      {isMine && (
        <ellipse cx="40" cy="118" rx="26" ry="5" fill="#2F6BFF" opacity="0.35">
          <animate
            attributeName="opacity"
            values="0.35;0.6;0.35"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}
      <ellipse cx="40" cy="118" rx="20" ry="3" fill="#000" opacity="0.18" />

      {/* 몸통 */}
      <rect x="22" y="62" width="36" height="50" rx="14" fill={avatar.outfit} />
      <rect
        x="20"
        y="66"
        width="6"
        height="32"
        rx="3"
        fill={avatar.outfit}
        opacity="0.85"
      />
      <rect
        x="54"
        y="66"
        width="6"
        height="32"
        rx="3"
        fill={avatar.outfit}
        opacity="0.85"
      />

      {/* 목 */}
      <rect x="34" y="58" width="12" height="6" fill={avatar.skinTone} />

      {/* 머리 */}
      <rect x="20" y="18" width="40" height="44" rx="18" fill={avatar.skinTone} />

      {/* 헤어 */}
      <Hair style={avatar.hairStyle} color={avatar.hairColor} />

      {/* 이어폰 (귀 뒤로) */}
      {has("acc-earphones") && (
        <g>
          <ellipse cx="19" cy="40" rx="3.5" ry="5" fill="#1A1A1A" />
          <ellipse cx="61" cy="40" rx="3.5" ry="5" fill="#1A1A1A" />
          <path
            d="M19 35 Q40 16 61 35"
            stroke="#1A1A1A"
            strokeWidth="2.2"
            fill="none"
          />
        </g>
      )}

      {/* 표정 */}
      <Face expression={avatar.expression} hasMask={has("acc-mask")} />

      {/* 안경 */}
      {has("acc-glasses") && (
        <g>
          <rect
            x="26"
            y="38"
            width="10"
            height="8"
            rx="3"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="1.6"
          />
          <rect
            x="44"
            y="38"
            width="10"
            height="8"
            rx="3"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="1.6"
          />
          <line
            x1="36"
            y1="42"
            x2="44"
            y2="42"
            stroke="#1A1A1A"
            strokeWidth="1.6"
          />
        </g>
      )}

      {/* 마스크 */}
      {has("acc-mask") && (
        <rect
          x="22"
          y="46"
          width="36"
          height="14"
          rx="5"
          fill="#FFFFFF"
          stroke="#D7E0EE"
          strokeWidth="1"
        />
      )}

      {/* 가방 */}
      {has("bag-laptop") && (
        <rect x="56" y="92" width="14" height="18" rx="2" fill="#102A56" />
      )}
      {has("bag-tote") && (
        <rect
          x="56"
          y="86"
          width="14"
          height="22"
          rx="6"
          fill="#E2E8F0"
          stroke="#A0AEC0"
          strokeWidth="1.2"
        />
      )}

      {/* 커피컵 */}
      {has("acc-coffee") && (
        <g transform="translate(58 78)">
          <rect
            x="-3"
            y="0"
            width="10"
            height="12"
            rx="2"
            fill="#FFFFFF"
            stroke="#A18063"
            strokeWidth="1.2"
          />
          <rect x="-3" y="0" width="10" height="3" fill="#A18063" />
          <rect x="-1" y="-3" width="6" height="3" rx="1" fill="#5C3A20" />
        </g>
      )}
    </svg>
  );
}

function Hair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "bald":
      return null;
    case "short":
      return (
        <path
          d="M20 30 Q20 14 40 14 Q60 14 60 30 L60 26 L20 26 Z"
          fill={color}
        />
      );
    case "long":
      return (
        <>
          <path
            d="M20 30 Q20 14 40 14 Q60 14 60 30 L60 26 L20 26 Z"
            fill={color}
          />
          <rect x="20" y="26" width="6" height="32" fill={color} />
          <rect x="54" y="26" width="6" height="32" fill={color} />
        </>
      );
    case "cap":
      return (
        <>
          <path d="M20 28 Q20 14 40 14 Q60 14 60 28 L20 28 Z" fill={color} />
          <rect x="14" y="28" width="48" height="5" rx="2" fill={color} />
          <circle cx="40" cy="20" r="2" fill="#FFFFFF" opacity="0.55" />
        </>
      );
  }
}

function Face({
  expression,
  hasMask,
}: {
  expression: Expression;
  hasMask: boolean;
}) {
  const c = "#102A56";
  const showMouth = !hasMask;

  switch (expression) {
    case "happy":
      return (
        <g>
          <circle cx="32" cy="42" r="2.5" fill={c} />
          <circle cx="48" cy="42" r="2.5" fill={c} />
          {showMouth && (
            <path
              d="M34 52 Q40 56 46 52"
              stroke={c}
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      );
    case "tired":
      return (
        <g>
          <line
            x1="29"
            y1="42"
            x2="35"
            y2="42"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="45"
            y1="42"
            x2="51"
            y2="42"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {showMouth && (
            <line
              x1="36"
              y1="53"
              x2="44"
              y2="53"
              stroke={c}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </g>
      );
    case "neutral":
      return (
        <g>
          <circle cx="32" cy="42" r="1.8" fill={c} />
          <circle cx="48" cy="42" r="1.8" fill={c} />
          {showMouth && (
            <line
              x1="38"
              y1="53"
              x2="42"
              y2="53"
              stroke={c}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </g>
      );
    case "sleepy":
      return (
        <g>
          <path
            d="M29 42 Q32 45 35 42"
            stroke={c}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M45 42 Q48 45 51 42"
            stroke={c}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          {showMouth && (
            <circle
              cx="40"
              cy="54"
              r="1.4"
              fill="none"
              stroke={c}
              strokeWidth="1.4"
            />
          )}
        </g>
      );
  }
}
