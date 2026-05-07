import { useEffect, useRef, useState } from "react";
import type { Avatar as AvatarType, Message } from "../types";
import { Avatar } from "./Avatar";
import { HeartBurst } from "./HeartBurst";
import { SpeechBubble } from "./SpeechBubble";

interface PassengerSlotProps {
  avatar: AvatarType;
  items?: string[];
  size?: number;
  message?: Message;
  isMine?: boolean;
  liked?: boolean;
  onLike?: () => void;
  // 좌석 좌표 (퍼센트). 부모 무대 컨테이너 기준.
  leftPercent: number;
  bottomPx: number;
}

/**
 * 한 명의 승객을 무대 위 절대좌표에 배치한다.
 * - 메시지가 있으면 머리 위에 말풍선
 * - 새 메시지 도착 시 짧은 점프
 * - 좋아요 누르면 하트 파티클 spawn
 */
export function PassengerSlot({
  avatar,
  items,
  size = 90,
  message,
  isMine = false,
  liked = false,
  onLike,
  leftPercent,
  bottomPx,
}: PassengerSlotProps) {
  // 점프 트리거 — 첫 마운트는 제외, 이후 message.id 가 바뀔 때마다 카운트++
  const [pulseId, setPulseId] = useState(0);
  const previousMessageId = useRef<string | undefined>(undefined);
  const isFirstRender = useRef(true);

  const messageId = message?.id;
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousMessageId.current = messageId;
      return;
    }
    if (messageId && messageId !== previousMessageId.current) {
      previousMessageId.current = messageId;
      setPulseId((p) => p + 1);
    } else if (!messageId) {
      previousMessageId.current = undefined;
    }
  }, [messageId]);

  // 하트 파티클 — 좋아요 클릭마다 새 burst 추가, 1.3s 후 자동 제거
  const [bursts, setBursts] = useState<number[]>([]);
  const burstIdRef = useRef(0);

  const handleLikeWithBurst = onLike
    ? () => {
        const id = ++burstIdRef.current;
        setBursts((prev) => [...prev, id]);
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b !== id));
        }, 1300);
        onLike();
      }
    : undefined;

  return (
    <div
      className="slot"
      style={{
        left: `${leftPercent}%`,
        bottom: `${bottomPx}px`,
      }}
    >
      {bursts.map((id) => (
        <HeartBurst key={id} variant={isMine ? "mine" : "other"} />
      ))}

      {message && (
        <div className="slot__bubble" key={message.id}>
          <SpeechBubble
            content={message.content}
            nickname={isMine ? undefined : message.nickname}
            variant={isMine ? "mine" : "other"}
            likeCount={message.likeCount}
            liked={liked}
            onLike={isMine ? undefined : handleLikeWithBurst}
          />
        </div>
      )}

      <div className={`slot__avatar${isMine ? " is-mine" : ""}`}>
        <div
          className={`slot__bounce${pulseId > 0 ? " is-jumping" : ""}`}
          key={pulseId}
        >
          <Avatar avatar={avatar} items={items} size={size} isMine={isMine} />
        </div>
      </div>
    </div>
  );
}
