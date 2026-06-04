import { useEffect, useState } from "react";
import {
  daysToNextMilestone,
  milestoneProgress,
  nextMilestone,
  recentDays,
  recordAttendance,
  type AttendanceState,
} from "../services/attendanceService";
import { getStreakReward, unlockItem } from "../services/unlockService";

/**
 * 출석체크 배지 + 팝업.
 * - 마운트 시 자동으로 오늘 출석 기록 (하루 1번)
 * - 새로 출석한 날이면 잠깐 축하 토스트
 * - 배지 탭하면 연속/총/달력 보이는 작은 패널
 */
export function AttendanceBadge() {
  const [state, setState] = useState<AttendanceState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const result = recordAttendance();
    setState(result.state);
    if (result.isNewDay) {
      // 마일스톤 도달 시 해당 보상 아이템 잠금 해제 시도
      let unlockedName: string | undefined;
      if (result.milestone) {
        const reward = getStreakReward(result.milestone);
        if (reward && unlockItem(reward.id)) {
          unlockedName = reward.name;
        }
      }
      const msg = unlockedName
        ? `🎁 ${result.milestone}일 달성! 새 아이템 "${unlockedName}"`
        : result.milestone
          ? `🎉 ${result.milestone}일 연속 출근 달성!`
          : `🔥 ${result.state.streak}일 연속 출근 중!`;
      setToast(msg);
      const t = window.setTimeout(
        () => setToast(null),
        unlockedName ? 5000 : 3200,
      );
      return () => window.clearTimeout(t);
    }
  }, []);

  if (!state) return null;

  return (
    <>
      {/* 우상단 작은 배지 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`연속 출근 ${state.streak}일`}
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          zIndex: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 10px",
          borderRadius: 999,
          border: "0",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          fontSize: 13,
          fontWeight: 700,
          color: "#ff7a1a",
          cursor: "pointer",
        }}
      >
        🔥 {state.streak}
      </button>

      {/* 탭하면 열리는 패널 */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 9,
              background: "transparent",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 46,
              right: 12,
              zIndex: 10,
              width: 260,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
              padding: 16,
              fontFamily: "Pretendard, -apple-system, sans-serif",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>
              🔥 {state.streak}일 연속 출근 중
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
              총 {state.total}일 · 최장 {state.longest}일
            </div>

            {/* 최근 14일 점 달력 */}
            <DotCalendar />

            {/* 다음 마일스톤 */}
            <MilestoneRow streak={state.streak} />
          </div>
        </>
      )}

      {/* 새 출석 축하 토스트 */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 12,
            background: "#1a1a1a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

function DotCalendar() {
  const days = recentDays(14);
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
      {days.map((d, i) => (
        <div
          key={d.date}
          title={d.date}
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            background: d.attended ? "#ff7a1a" : "#eceef1",
            opacity: d.attended ? 1 : 0.7,
            // 오늘은 테두리 강조
            outline: i === days.length - 1 ? "2px solid #ffcaa0" : "none",
            outlineOffset: 1,
          }}
        />
      ))}
    </div>
  );
}

function MilestoneRow({ streak }: { streak: number }) {
  const next = nextMilestone(streak);
  const left = daysToNextMilestone(streak);
  if (next == null || left == null) {
    return (
      <div style={{ fontSize: 12, color: "#3182f6", fontWeight: 700 }}>
        🏆 최고 단계 달성! 계속 이어가요
      </div>
    );
  }
  const ratio = milestoneProgress(streak);
  return (
    <div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
        다음 목표 <b style={{ color: "#ff7a1a" }}>{next}일</b> 까지 {left}일 남음
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "#eceef1",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            background: "#ff7a1a",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
