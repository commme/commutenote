interface SpeechBubbleProps {
  content: string;
  nickname?: string;
  variant?: "mine" | "other";
  likeCount?: number;
  liked?: boolean;
  onLike?: () => void;
}

/**
 * 말풍선 (10초 TTL은 부모에서 관리, 여기는 표현만)
 */
export function SpeechBubble({
  content,
  nickname,
  variant = "other",
  likeCount = 0,
  liked = false,
  onLike,
}: SpeechBubbleProps) {
  return (
    <div
      className="bubble"
      data-variant={variant}
      role="status"
      aria-live="polite"
    >
      {nickname && <div className="bubble__nick">{nickname}</div>}
      <div className="bubble__body">{content}</div>
      {onLike && (
        <button
          type="button"
          className={`bubble__like${liked ? " is-liked" : ""}`}
          onClick={onLike}
          aria-label="공감하기"
          aria-pressed={liked}
        >
          <HeartIcon filled={liked} />
          {likeCount > 0 && <span className="bubble__like-count">{likeCount}</span>}
        </button>
      )}
      <span className="bubble__tail" aria-hidden />
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#E2574C" : "none"}
      stroke={filled ? "#E2574C" : "#9AA4B2"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
