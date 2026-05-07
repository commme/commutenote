import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatInputBar } from "../components/ChatInputBar";
import { PassengerSlot } from "../components/PassengerSlot";
import { TickerBanner } from "../components/TickerBanner";
import { TrainHeader } from "../components/TrainHeader";
import { TrainInterior } from "../components/TrainInterior";
import { useApp } from "../contexts/AppContext";
import {
  CARS,
  DEFAULT_LINE_ID,
  getCarById,
  getLineById,
} from "../data/subwayLines";
import { SAMPLE_PASSENGERS } from "../data/samplePassengers";
import { useEphemeralMessages } from "../hooks/useEphemeralMessages";
import { useSampleMessageDemo } from "../hooks/useSampleMessageDemo";
import { messageStore } from "../services/messageService";
import { likeMessage } from "../services/reactionService";
import type { Avatar } from "../types";
import { COOLDOWN_MS } from "../utils/contentFilter";

// 가운데(40~60%) 비워두고 양쪽으로 배치 — 내 캐릭터가 정중앙에 들어감
const SAMPLE_LAYOUT: Array<{ left: number; bottom: number; size: number }> = [
  { left: 8, bottom: 28, size: 70 },
  { left: 23, bottom: 38, size: 72 },
  { left: 36, bottom: 28, size: 70 },
  { left: 64, bottom: 28, size: 70 },
  { left: 77, bottom: 38, size: 72 },
  { left: 92, bottom: 28, size: 70 },
];

// 0..5 슬롯 중 랜덤 — 내 메시지를 다른 사용자가 볼 위치
function pickRandomSlot(): number {
  return Math.floor(Math.random() * SAMPLE_LAYOUT.length);
}

// 내 캐릭터 X 좌표 한계 (퍼센트)
const MY_MIN_X = 8;
const MY_MAX_X = 92;
const MY_STEP = 4;
const MY_HOME = 50;

// 메시지 보낸 후 잠깐 표정이 happy 로 바뀌는 시간 (ms)
const HAPPY_DURATION = 2500;

export function TrainRoomPage() {
  const { profile, navigate, currentCarId, setCurrentCarId } = useApp();
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [happyUntil, setHappyUntil] = useState<number>(0);
  const [myX, setMyX] = useState<number>(MY_HOME);

  const lineId = profile.selectedLineId ?? DEFAULT_LINE_ID;
  const line = getLineById(lineId);
  const car = getCarById(currentCarId);

  // 데모 메시지 (cloud 모드에서도 항상 ON — 분위기 유지용)
  useSampleMessageDemo(currentCarId, line.id);

  // 활성 메시지 (1초마다 만료 정리, cloud 구독 트리거 포함)
  const messages = useEphemeralMessages(currentCarId, line.id);

  // 슬롯 → 다른 사람 메시지 매핑
  const otherBySlot = useMemo(() => {
    const map = new Map<number, (typeof messages)[number]>();
    // 시간 순으로 정렬해 최신이 슬롯을 차지하도록
    const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
    for (const msg of sorted) {
      if (msg.userId !== profile.id && msg.slotIndex >= 0) {
        map.set(msg.slotIndex, msg);
      }
    }
    return map;
  }, [messages, profile.id]);

  const myMessage = messages.find((m) => m.userId === profile.id);

  // 내 표정 일시 변경 (happy → 원래대로)
  const isHappy = happyUntil > Date.now();
  useEffect(() => {
    if (!isHappy) return;
    const ms = happyUntil - Date.now();
    const t = window.setTimeout(() => setHappyUntil(0), ms);
    return () => window.clearTimeout(t);
  }, [happyUntil, isHappy]);

  const myAvatar = useMemo<Avatar>(
    () =>
      isHappy
        ? { ...profile.avatar, expression: "happy" }
        : profile.avatar,
    [profile.avatar, isHappy],
  );

  // 칸/노선 바뀌면 내 캐릭터 위치 리셋
  useEffect(() => {
    setMyX(MY_HOME);
  }, [currentCarId, line.id]);

  // 키보드 ←→ 로 내 캐릭터 이동 (입력 중일 땐 무시)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setMyX((x) => Math.max(MY_MIN_X, x - MY_STEP));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setMyX((x) => Math.min(MY_MAX_X, x + MY_STEP));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      messageStore.add({
        userId: profile.id,
        nickname: profile.nickname,
        content,
        carId: currentCarId,
        lineId: line.id,
        // 클라우드 echo 시 다른 유저에게도 보이게 0..5 슬롯 부여
        // 로컬에선 userId === profile.id 로 분기되어 가운데 큰 캐릭터로 표시됨
        slotIndex: pickRandomSlot(),
        avatar: profile.avatar,
        items: profile.equippedItems,
      });
      setCooldownEndsAt(Date.now() + COOLDOWN_MS);
      setHappyUntil(Date.now() + HAPPY_DURATION);
    },
    [
      profile.id,
      profile.nickname,
      profile.avatar,
      profile.equippedItems,
      currentCarId,
      line.id,
    ],
  );

  const handleLike = useCallback((messageId: string) => {
    if (likeMessage(messageId)) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.add(messageId);
        return next;
      });
    }
  }, []);

  const cooldownRemainingMs = Math.max(0, cooldownEndsAt - Date.now());

  return (
    <div className="app-shell">
      <div className="app-shell__body">
        <TrainHeader
          line={line}
          car={car}
          onProfileClick={() => navigate("profile")}
        />
        <TickerBanner />
        <TrainInterior line={line}>
          {SAMPLE_PASSENGERS.map((p) => {
            const layout = SAMPLE_LAYOUT[p.slotIndex] ?? {
              left: 50,
              bottom: 30,
              size: 72,
            };
            const msg = otherBySlot.get(p.slotIndex);
            // 실제 사용자 메시지가 이 슬롯을 차지하면 그 사람의 아바타로 덮어씀
            const displayAvatar = msg?.avatar ?? p.avatar;
            const displayItems = msg?.items;
            return (
              <PassengerSlot
                key={p.id}
                avatar={displayAvatar}
                items={displayItems}
                size={layout.size}
                leftPercent={layout.left}
                bottomPx={layout.bottom}
                message={msg}
                liked={msg ? likedIds.has(msg.id) : false}
                onLike={msg ? () => handleLike(msg.id) : undefined}
              />
            );
          })}
          <PassengerSlot
            avatar={myAvatar}
            items={profile.equippedItems}
            size={120}
            isMine
            leftPercent={myX}
            bottomPx={4}
            message={myMessage}
          />
        </TrainInterior>
        <ChatInputBar
          cooldownRemainingMs={cooldownRemainingMs}
          onSend={handleSend}
          onPrevCar={() => setCurrentCarId((c) => Math.max(0, c - 1))}
          onNextCar={() =>
            setCurrentCarId((c) => Math.min(CARS.length - 1, c + 1))
          }
          canPrev={currentCarId > 0}
          canNext={currentCarId < CARS.length - 1}
        />
      </div>
    </div>
  );
}
