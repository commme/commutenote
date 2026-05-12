import { getTrainDirectionLabel } from "../data/contextualMessages";
import type { Car, SubwayLine } from "../types";

interface TrainHeaderProps {
  line: SubwayLine;
  car: Car;
  onProfileClick?: () => void;
}

/**
 * 열차 상단 헤더 — 노선 배지 + 시간대별 방향(출근행/퇴근행/...) + 프로필 진입
 * 열차 무대 위에 얹히는 형태라 TDS Top 대신 커스텀 디자인.
 */
export function TrainHeader({ line, car, onProfileClick }: TrainHeaderProps) {
  const direction = getTrainDirectionLabel();
  return (
    <header className="train-header">
      <div className="train-header__line">
        <span
          className="train-header__line-badge"
          style={{ backgroundColor: line.color }}
          aria-hidden
        >
          {line.shortLabel}
        </span>
        <span className="train-header__line-name">{line.name}</span>
      </div>
      <div className="train-header__center">
        <div className="train-header__title">{direction}</div>
        <div className="train-header__sub">{car.label}</div>
      </div>
      <button
        type="button"
        className="train-header__profile"
        onClick={onProfileClick}
        aria-label="내 프로필 열기"
      >
        <ProfileIcon />
      </button>
    </header>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#102A56"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}
