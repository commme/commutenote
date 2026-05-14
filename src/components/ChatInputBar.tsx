import { useEffect, useRef, useState } from "react";
import {
  MAX_MESSAGE_LENGTH,
  detectDistress,
  validateMessage,
} from "../utils/contentFilter";

interface ChatInputBarProps {
  cooldownRemainingMs: number;
  onSend: (content: string) => void;
  onPrevCar: () => void;
  onNextCar: () => void;
  canPrev: boolean;
  canNext: boolean;
}

/**
 * 하단 입력바 + 좌우 칸 이동 버튼
 * - 검열/길이는 contentFilter에 위임
 * - 쿨타임 중에는 비활성화 + 남은 초 표시
 */
export function ChatInputBar({
  cooldownRemainingMs,
  onSend,
  onPrevCar,
  onNextCar,
  canPrev,
  canNext,
}: ChatInputBarProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const isCooling = cooldownRemainingMs > 0;
  const sendDisabled = isCooling || value.trim().length === 0;

  useEffect(() => {
    // 쿨타임 끝나면 에러 메시지도 정리
    if (cooldownRemainingMs === 0 && error?.startsWith("잠시")) {
      setError(null);
    }
  }, [cooldownRemainingMs, error]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const handleSend = () => {
    if (isCooling) {
      const sec = Math.ceil(cooldownRemainingMs / 1000);
      setError(`잠시만요, ${sec}초 후에 다시 보낼 수 있어요.`);
      return;
    }
    const result = validateMessage(value);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    // 자살/자해 신호 — 차단하지 않고 1393 안내 토스트만 띄움
    const isDistress = detectDistress(result.cleaned);
    onSend(result.cleaned);
    setValue("");
    setError(null);
    if (isDistress) {
      setNotice("혼자 힘들어 마세요. 자살예방상담 ☎ 1393 (24시간)");
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = window.setTimeout(() => setNotice(null), 8000);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="chat-bar">
      <button
        type="button"
        className="chat-bar__nav"
        onClick={onPrevCar}
        disabled={!canPrev}
        aria-label="이전 칸으로"
      >
        <ArrowIcon dir="left" />
      </button>
      <div className="chat-bar__input-wrap">
        <input
          ref={inputRef}
          className="chat-bar__input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="오늘 출근길 한마디를 남겨보세요"
          maxLength={MAX_MESSAGE_LENGTH + 5}
          aria-label="한마디 입력"
        />
        {isCooling && (
          <span className="chat-bar__cooldown" aria-live="polite">
            {Math.ceil(cooldownRemainingMs / 1000)}s
          </span>
        )}
      </div>
      <button
        type="button"
        className="chat-bar__send"
        onClick={handleSend}
        disabled={sendDisabled}
        aria-label="한마디 보내기"
      >
        <SendIcon />
      </button>
      <button
        type="button"
        className="chat-bar__nav"
        onClick={onNextCar}
        disabled={!canNext}
        aria-label="다음 칸으로"
      >
        <ArrowIcon dir="right" />
      </button>
      {error && <div className="chat-bar__error">{error}</div>}
      {notice && (
        <div className="chat-bar__notice" role="status" aria-live="polite">
          {notice}
        </div>
      )}
    </div>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#102A56"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ transform: dir === "right" ? "rotate(180deg)" : "none" }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
