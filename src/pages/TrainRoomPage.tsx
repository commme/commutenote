import { useCallback, useEffect, useMemo, useState } from "react";
import { AttendanceBadge } from "../components/AttendanceBadge";
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
type SlotPos = { left: number; bottom: number; size: number };
const SAMPLE_LAYOUT: SlotPos[] = [
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

// 내 캐릭터 좌표 한계
const MY_MIN_X = 6;
const MY_MAX_X = 94;
const MY_HOME_X = 50;
const MY_STEP_X = 4;
const MY_MIN_BOTTOM = 2;
const MY_MAX_BOTTOM = 120; // 바닥부터 좌석 앞쪽까지 — 위로 충분히 올라가게
const MY_HOME_BOTTOM = 4;
const MY_STEP_Y = 6;

// 다른 승객 배회 범위 (자기 위치 근처에서만 슬슬)
const WANDER_MIN_X = 4;
const WANDER_MAX_X = 96;
const WANDER_MIN_BOTTOM = 22;
const WANDER_MAX_BOTTOM = 44;
const WANDER_X_AMPL = 10; // 한 번에 ±10% 이내
const WANDER_Y_AMPL = 6; // 한 번에 ±6px 이내

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// 메시지 보낸 후 잠깐 표정이 happy 로 바뀌는 시간 (ms)
const HAPPY_DURATION = 2500;

export function TrainRoomPage() {
  const { profile, navigate, currentCarId, setCurrentCarId } = useApp();
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [happyUntil, setHappyUntil] = useState<number>(0);
  const [myX, setMyX] = useState<number>(MY_HOME_X);
  const [myBottom, setMyBottom] = useState<number>(MY_HOME_BOTTOM);
  // 다른 승객들 현재 위치 (slotIndex 0..5) — 주기적으로 슬슬 배회
  const [samplePos, setSamplePos] = useState<SlotPos[]>(() =>
    SAMPLE_LAYOUT.map((p) => ({ ...p })),
  );

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

  // 칸/노선 바뀌면 내 캐릭터 위치 + 다른 승객 위치 리셋
  useEffect(() => {
    setMyX(MY_HOME_X);
    setMyBottom(MY_HOME_BOTTOM);
    setSamplePos(SAMPLE_LAYOUT.map((p) => ({ ...p })));
  }, [currentCarId, line.id]);

  // 키보드 ←→↑↓ 로 내 캐릭터 이동 (입력 중일 땐 무시) — 데스크탑용
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setMyX((x) => clamp(x - MY_STEP_X, MY_MIN_X, MY_MAX_X));
          break;
        case "ArrowRight":
          e.preventDefault();
          setMyX((x) => clamp(x + MY_STEP_X, MY_MIN_X, MY_MAX_X));
          break;
        case "ArrowUp":
          e.preventDefault();
          setMyBottom((b) => clamp(b + MY_STEP_Y, MY_MIN_BOTTOM, MY_MAX_BOTTOM));
          break;
        case "ArrowDown":
          e.preventDefault();
          setMyBottom((b) => clamp(b - MY_STEP_Y, MY_MIN_BOTTOM, MY_MAX_BOTTOM));
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 다른 승객들 자동 배회 — 2.4~4.4초마다 각자 살짝 이동
  useEffect(() => {
    const id = window.setInterval(() => {
      setSamplePos((prev) =>
        prev.map((p) => {
          // 30% 확률로 가만히 있기 (자연스럽게)
          if (Math.random() < 0.3) return p;
          const nx = clamp(
            p.left + (Math.random() * 2 - 1) * WANDER_X_AMPL,
            WANDER_MIN_X,
            WANDER_MAX_X,
          );
          const nb = clamp(
            p.bottom + (Math.random() * 2 - 1) * WANDER_Y_AMPL,
            WANDER_MIN_BOTTOM,
            WANDER_MAX_BOTTOM,
          );
          return { ...p, left: nx, bottom: nb };
        }),
      );
    }, 2400 + Math.random() * 2000);
    return () => window.clearInterval(id);
  }, []);

  // 칸 안 빈 공간 탭 → 내 캐릭터가 그 자리로 (모바일용). yFromBottomPx 는 무대 전체 기준이라
  // 캐릭터 발 위치에 맞춰 약간 보정 + 바닥~좌석앞 범위로 클램프.
  const handleAreaTap = useCallback(
    (xPercent: number, yFromBottomPx: number) => {
      setMyX(clamp(xPercent, MY_MIN_X, MY_MAX_X));
      setMyBottom(clamp(yFromBottomPx - 10, MY_MIN_BOTTOM, MY_MAX_BOTTOM));
    },
    [],
  );

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
        <TrainInterior line={line} onAreaTap={handleAreaTap}>
          <AttendanceBadge />
          {SAMPLE_PASSENGERS.map((p) => {
            const layout =
              samplePos[p.slotIndex] ??
              SAMPLE_LAYOUT[p.slotIndex] ?? { left: 50, bottom: 30, size: 72 };
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
            bottomPx={myBottom}
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
