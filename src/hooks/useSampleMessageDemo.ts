import { useEffect } from "react";
import { pickContextualMessage } from "../data/contextualMessages";
import { SAMPLE_PASSENGERS } from "../data/samplePassengers";
import { messageStore } from "../services/messageService";
import { hasSupabaseConfig } from "../services/supabase";

/**
 * 샘플 메시지 흘리기 — 분위기/온기 유지용으로 항상 ON.
 * 글귀가 좋아 cloud 모드에서도 같이 띄움. 실제 사용자 메시지와 슬롯 충돌 시 최신 등장이 우선.
 */
export function useSampleMessageDemo(carId: number, lineId: string): void {
  // hasSupabaseConfig 는 의도적으로 사용 안 함 — 모드 무관 항상 동작
  void hasSupabaseConfig;

  useEffect(() => {
    let cancelled = false;

    function pushOne() {
      if (cancelled) return;
      const passenger =
        SAMPLE_PASSENGERS[Math.floor(Math.random() * SAMPLE_PASSENGERS.length)];
      // 현재 시각·요일에 어울리는 메시지 (퇴근시간엔 퇴근 얘기, 월요일엔 월요병 등)
      const content = pickContextualMessage();
      messageStore.add({
        userId: passenger.id,
        nickname: passenger.nickname,
        content,
        carId,
        lineId,
        slotIndex: passenger.slotIndex,
        avatar: passenger.avatar,
        items: [],
      });
    }

    const initialTimers = [
      window.setTimeout(pushOne, 700),
      window.setTimeout(pushOne, 2400),
    ];

    let intervalId = 0;
    function schedule() {
      const delay = 4000 + Math.random() * 3000;
      intervalId = window.setTimeout(() => {
        pushOne();
        schedule();
      }, delay);
    }
    schedule();

    return () => {
      cancelled = true;
      initialTimers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(intervalId);
    };
  }, [carId, lineId]);
}
