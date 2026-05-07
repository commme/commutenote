import { useMemo } from "react";
import { buildTickerLine } from "../data/tickerMessages";

/**
 * 멘탈 문구 흐름 띠. CSS 키프레임으로 끊김 없이 좌측으로 흐른다.
 * (텍스트를 두 번 이어붙여 -50% 이동 시 다시 처음으로 보이게)
 */
export function TickerBanner() {
  const line = useMemo(() => buildTickerLine(), []);
  const doubled = `${line}      ·      ${line}`;
  return (
    <div className="ticker" aria-label="출근 응원 메시지">
      <div className="ticker__track">{doubled}</div>
    </div>
  );
}
