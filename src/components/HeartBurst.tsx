import type { CSSProperties } from "react";

interface HeartBurstProps {
  variant?: "other" | "mine";
}

// 파티클 5개 — 각각 다른 방향/딜레이로 떠오름
const PARTICLES: Array<{ dx: number; dy: number; delay: number; size: number }> = [
  { dx: -22, dy: -58, delay: 0, size: 14 },
  { dx: -8, dy: -72, delay: 70, size: 18 },
  { dx: 6, dy: -78, delay: 140, size: 16 },
  { dx: 20, dy: -64, delay: 210, size: 14 },
  { dx: 0, dy: -88, delay: 280, size: 20 },
];

/**
 * 좋아요 누를 때 캐릭터 머리 위로 하트들이 떠오르는 짧은 이펙트 (~1.2s).
 * pointer-events: none 이라 인터랙션 방해 없음.
 */
export function HeartBurst({ variant = "other" }: HeartBurstProps) {
  const color = variant === "mine" ? "#3182F6" : "#FF5A6B";
  return (
    <div className="heart-burst" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="heart-burst__particle"
          style={
            {
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--delay": `${p.delay}ms`,
              width: p.size,
              height: p.size,
            } as CSSProperties
          }
        >
          <HeartShape color={color} />
        </span>
      ))}
    </div>
  );
}

function HeartShape({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={color}
      stroke="#ffffff"
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
