import type { ReactNode } from "react";
import type { SubwayLine } from "../types";

interface TrainInteriorProps {
  line: SubwayLine;
  children: ReactNode;
}

/**
 * 측면 단면도 시점의 열차 내부 무대.
 * 배경은 GPT 로 생성한 3D 토이 스타일 PNG 사용 (좌석/창문/조명 모두 포함).
 * line.color 는 상단에 살짝 라이트 라인으로만 노출.
 * children 은 PassengerSlot 들을 절대좌표로 받는다.
 */
export function TrainInterior({ line, children }: TrainInteriorProps) {
  return (
    <div className="train">
      <div className="train__sway">
        <div
          className="train__bg-img"
          style={{
            backgroundImage:
              "url(/assets/backgrounds/subway-room-main-bright-3d.png)",
          }}
        />
        {/* 노선 컬러 액센트 — 천장 라이트 라인 */}
        <div
          className="train__line-accent"
          style={{ background: line.color }}
        />
        {/* 슬롯들 */}
        <div className="train__slots">{children}</div>
      </div>
    </div>
  );
}
