import { useEffect, useState } from "react";
import type { SubwayLine } from "../types";

interface TrainDoorAnimationProps {
  line: SubwayLine;
  onComplete: () => void;
}

type Stage = "ready" | "opening" | "boarding";

/**
 * 열차 문 열림 애니메이션
 * ready(0.6s) → opening(1.2s) → boarding 직전 onComplete 호출
 */
export function TrainDoorAnimation({
  line,
  onComplete,
}: TrainDoorAnimationProps) {
  const [stage, setStage] = useState<Stage>("ready");

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage("opening"), 600);
    const t2 = window.setTimeout(() => setStage("boarding"), 1900);
    const t3 = window.setTimeout(() => onComplete(), 2300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="entry"
      data-stage={stage}
      style={{ ["--line-color" as string]: line.color }}
    >
      <div className="entry__inside">
        {/* 문 열렸을 때 살짝 보이는 내부 분위기 */}
        <div className="entry__inside-glow" />
        <div className="entry__inside-text">
          <div className="entry__inside-headline">출근행</div>
          <div className="entry__inside-sub">오늘도 무사히 다녀오세요</div>
        </div>
      </div>

      <div className="entry__door entry__door--left" aria-hidden>
        <div className="entry__door-line" />
        <div className="entry__door-handle" />
        <div className="entry__door-window" />
      </div>
      <div className="entry__door entry__door--right" aria-hidden>
        <div className="entry__door-line" />
        <div className="entry__door-handle" />
        <div className="entry__door-window" />
      </div>

      <div className="entry__caption">
        <div className="entry__caption-line">{line.name}</div>
        <div className="entry__caption-title">출근행</div>
        <div className="entry__caption-sub">
          {stage === "ready" && "곧 문이 열립니다"}
          {stage === "opening" && "문이 열리고 있어요"}
          {stage === "boarding" && "탑승해 주세요"}
        </div>
      </div>
    </div>
  );
}
