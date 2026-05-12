import type { MouseEvent, ReactNode } from "react";
import { getTimeSlot } from "../data/contextualMessages";
import type { SubwayLine } from "../types";

interface TrainInteriorProps {
  line: SubwayLine;
  children: ReactNode;
  /**
   * 칸 안 빈 공간을 탭/클릭하면 호출 — (x퍼센트 0~100, 바닥 기준 y픽셀).
   * 버튼/말풍선 같은 인터랙티브 요소를 탭한 경우는 호출 안 됨.
   */
  onAreaTap?: (xPercent: number, yFromBottomPx: number) => void;
}

/**
 * 측면 단면도 시점의 열차 내부 무대.
 * 배경은 GPT 로 생성한 3D 토이 스타일 PNG (밝은 아침 톤).
 * 시간대에 따라 위에 톤 오버레이를 얹어 퇴근/심야엔 어둡게.
 * children 은 PassengerSlot 들을 절대좌표로 받는다.
 */
export function TrainInterior({ line, children, onAreaTap }: TrainInteriorProps) {
  const slot = getTimeSlot();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onAreaTap) return;
    // 버튼(출석 배지, 좋아요 등) 위 탭은 이동으로 처리하지 않음
    const t = e.target as HTMLElement;
    if (t.closest("button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yFromBottomPx = rect.bottom - e.clientY;
    onAreaTap(xPercent, yFromBottomPx);
  };

  return (
    <div
      className="train"
      data-timeslot={slot}
      onClick={handleClick}
    >
      <div className="train__sway">
        <div
          className="train__bg-img"
          style={{
            backgroundImage:
              "url(/assets/backgrounds/subway-room-main-bright-3d.png)",
          }}
        />
        {/* 시간대 톤 오버레이 (CSS 가 data-timeslot 별로 색 입힘) */}
        <div className="train__time-overlay" aria-hidden />
        {/* 노선 컬러 액센트 — 천장 라이트 라인 */}
        <div className="train__line-accent" style={{ background: line.color }} />
        {/* 슬롯들 */}
        <div className="train__slots">{children}</div>
      </div>
    </div>
  );
}
