import { useEffect, useState } from "react";
import { messageStore } from "../services/messageService";
import type { Message } from "../types";

/**
 * 특정 칸/노선의 활성 메시지를 구독.
 * - setScope 로 클라우드 채널 전환 트리거
 * - 1초마다 만료 메시지 정리
 */
export function useEphemeralMessages(
  carId: number,
  lineId: string,
): Message[] {
  const [tick, setTick] = useState(0);

  // 스코프 변경 시 cloud 채널 갈아끼우기
  useEffect(() => {
    messageStore.setScope(lineId, carId);
  }, [lineId, carId]);

  useEffect(() => {
    const unsubscribe = messageStore.subscribe(() => {
      setTick((t) => t + 1);
    });

    const intervalId = window.setInterval(() => {
      const changed = messageStore.cleanup();
      if (!changed) {
        // 변화 없어도 시계가 흘러 표시 시간이 갱신될 수 있도록 약하게 트리거
        setTick((t) => t + 1);
      }
    }, 1000);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, []);

  void tick;
  return messageStore.getActive(carId, lineId);
}
