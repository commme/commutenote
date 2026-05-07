import type { ReactNode } from "react";
import type { SubwayLine } from "../types";

interface TrainInteriorProps {
  line: SubwayLine;
  children: ReactNode;
}

/**
 * 측면 단면도 시점의 열차 내부 무대.
 * - 천장 + 조명 + 손잡이
 * - 창문 띠 (배경이 좌측으로 흐르며 달리는 느낌)
 * - 벽 + 바닥
 * - 노선 컬러는 천장 라이트와 손잡이 끈 포인트로 들어감
 * children은 PassengerSlot들을 절대좌표로 받는다.
 */
export function TrainInterior({ line, children }: TrainInteriorProps) {
  return (
    <div className="train">
      <div className="train__sway">
        {/* 천장 + 조명 */}
        <div className="train__ceiling">
          <div
            className="train__ceiling-light"
            style={{ background: `linear-gradient(180deg, ${line.color}33, transparent)` }}
          />
        </div>

        {/* 손잡이 */}
        <div className="train__handrail">
          <span className="train__handrail-bar" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="train__handrail-strap"
              style={{ left: `${10 + i * 20}%`, borderColor: line.color }}
            >
              <span className="train__handrail-ring" />
            </span>
          ))}
        </div>

        {/* 창문 띠 */}
        <div className="train__windows">
          <div className="train__windows-bg" />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="train__window-frame" />
          ))}
        </div>

        {/* 벽 마감 */}
        <div className="train__wall" />

        {/* 좌석 / 캐릭터 영역 */}
        <div className="train__bench">
          <div className="train__bench-back" />
          <div className="train__bench-seat" />
          {/* 슬롯들 (PassengerSlot은 absolute) */}
          <div className="train__slots">{children}</div>
        </div>

        {/* 바닥 */}
        <div className="train__floor" />
      </div>
    </div>
  );
}
