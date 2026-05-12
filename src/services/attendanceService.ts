// =========================================================
// attendanceService.ts
// 출석체크 (출근 도장) — localStorage 기반, 로그인 불필요.
// 열차 칸에 진입할 때마다 recordAttendance() 호출 → 하루 1번만 카운트.
// =========================================================

import { getDevUserSuffix, readJson, writeJson } from "./storage";

const KEY = `attendance${getDevUserSuffix()}`;

export interface AttendanceState {
  /** 마지막 출석 날짜 "YYYY-MM-DD" (로컬 기준). 없으면 "" */
  lastDate: string;
  /** 연속 출석일 */
  streak: number;
  /** 역대 최장 연속 출석일 */
  longest: number;
  /** 총 출석일 수 */
  total: number;
  /** 최근 출석 날짜들 (최대 30개, 오름차순) */
  history: string[];
}

const EMPTY: AttendanceState = {
  lastDate: "",
  streak: 0,
  longest: 0,
  total: 0,
  history: [],
};

// 마일스톤 (연속 출석) — 도달 시 축하
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** 로컬 타임존 기준 "YYYY-MM-DD" */
function dateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayStr(): string {
  return dateStr(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateStr(d);
}

export function getAttendance(): AttendanceState {
  const s = readJson<AttendanceState>(KEY, EMPTY);
  // 방어적 정규화
  return {
    lastDate: typeof s.lastDate === "string" ? s.lastDate : "",
    streak: Number.isFinite(s.streak) ? s.streak : 0,
    longest: Number.isFinite(s.longest) ? s.longest : 0,
    total: Number.isFinite(s.total) ? s.total : 0,
    history: Array.isArray(s.history) ? s.history.slice(-30) : [],
  };
}

export interface RecordResult {
  /** 오늘 처음 출석한 거면 true (이미 출석했으면 false) */
  isNewDay: boolean;
  /** 갱신된 상태 */
  state: AttendanceState;
  /** 이번 출석으로 도달한 마일스톤 (없으면 undefined) */
  milestone?: number;
}

/**
 * 출석 기록. 하루 1번만 카운트.
 * - 어제 출석했었으면 streak++
 * - 어제 출석 안 했으면 (하루 이상 건너뜀) streak = 1
 * - 오늘 이미 출석했으면 아무 변화 없이 isNewDay=false
 */
export function recordAttendance(): RecordResult {
  const prev = getAttendance();
  const today = todayStr();

  if (prev.lastDate === today) {
    return { isNewDay: false, state: prev };
  }

  const continuing = prev.lastDate === yesterdayStr();
  const streak = continuing ? prev.streak + 1 : 1;
  const longest = Math.max(prev.longest, streak);
  const total = prev.total + 1;
  const history = [...prev.history, today].slice(-30);

  const next: AttendanceState = { lastDate: today, streak, longest, total, history };
  writeJson(KEY, next);

  const milestone = (STREAK_MILESTONES as readonly number[]).includes(streak)
    ? streak
    : undefined;

  return { isNewDay: true, state: next, milestone };
}

/** 다음 마일스톤까지 남은 일수 (이미 최고면 undefined) */
export function daysToNextMilestone(streak: number): number | undefined {
  for (const m of STREAK_MILESTONES) {
    if (streak < m) return m - streak;
  }
  return undefined;
}

/** 다음 마일스톤 값 (이미 최고면 undefined) */
export function nextMilestone(streak: number): number | undefined {
  for (const m of STREAK_MILESTONES) {
    if (streak < m) return m;
  }
  return undefined;
}

/**
 * 최근 N일의 출석 여부 배열 (오늘 포함, 과거→현재 순).
 * 예: last 14 days → [true, false, true, ...] 길이 14
 */
export function recentDays(n = 14): { date: string; attended: boolean }[] {
  const hist = new Set(getAttendance().history);
  const out: { date: string; attended: boolean }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const ds = dateStr(d);
    out.push({ date: ds, attended: hist.has(ds) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}
