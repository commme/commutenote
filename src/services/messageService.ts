import type { Avatar, Message } from "../types";
import { publishMessage, subscribeCloud } from "./cloudSync";
import { hasSupabaseConfig } from "./supabase";

// 메시지 id — Supabase messages.id 가 uuid 타입이라 진짜 UUID 발급
function createMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // 매우 구형 환경 폴백 (RFC4122 v4 형태)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 메시지 TTL 기본값 (PRD: 10초)
export const MESSAGE_TTL_MS = 10_000;

// 인메모리 + 옵션 클라우드 트랜스포트
class MessageStore {
  private messages: Message[] = [];
  private listeners = new Set<() => void>();
  private scope: { lineId: string; carId: number } | null = null;
  private cloudUnsub: (() => void) | null = null;

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * 활성 스코프 (lineId, carId) 설정.
   * - 클라우드 모드면 Realtime 채널 전환
   * - 다른 스코프 메시지는 메모리에서 정리
   */
  setScope(lineId: string, carId: number): void {
    if (this.scope?.lineId === lineId && this.scope.carId === carId) return;

    this.cloudUnsub?.();
    this.cloudUnsub = null;

    // 다른 스코프 잔여 메시지 청소
    const before = this.messages.length;
    this.messages = this.messages.filter(
      (m) => m.lineId === lineId && m.carId === carId,
    );
    if (this.messages.length !== before) this.notify();

    this.scope = { lineId, carId };

    if (hasSupabaseConfig) {
      this.cloudUnsub = subscribeCloud(lineId, carId, {
        ingest: (m) => this.ingest(m),
        applyLikeCount: (id, count) => this.applyLikeCount(id, count),
      });
    }
  }

  /**
   * 새 메시지 추가. 같은 userId 의 이전 메시지는 교체.
   * 클라우드 모드면 fire-and-forget 으로 publish.
   * local=true 면 publish 스킵 (샘플 캐릭터의 분위기 유지용 메시지에 사용).
   */
  add(input: {
    userId: string;
    nickname: string;
    content: string;
    carId: number;
    lineId: string;
    slotIndex: number;
    avatar: Avatar;
    items?: string[];
    ttl?: number;
    local?: boolean;
  }): Message {
    const ttl = input.ttl ?? MESSAGE_TTL_MS;
    const now = Date.now();
    const msg: Message = {
      id: createMessageId(),
      userId: input.userId,
      nickname: input.nickname,
      content: input.content,
      carId: input.carId,
      lineId: input.lineId,
      slotIndex: input.slotIndex,
      avatar: input.avatar,
      items: input.items ?? [],
      createdAt: now,
      expiresAt: now + ttl,
      likeCount: 0,
    };

    this.messages = this.messages.filter((m) => m.userId !== input.userId);
    this.messages.push(msg);
    this.notify();

    if (hasSupabaseConfig && !input.local) {
      void publishMessage(msg);
    }

    return msg;
  }

  /**
   * 외부(Realtime)에서 들어온 메시지 흡수. id 중복 시 무시.
   * 같은 user 의 다른 메시지가 있으면 교체.
   */
  ingest(msg: Message): void {
    if (this.messages.find((m) => m.id === msg.id)) return;
    this.messages = this.messages.filter((m) => m.userId !== msg.userId);
    this.messages.push(msg);
    this.notify();
  }

  /**
   * 클라우드에서 좋아요 수 갱신 통보.
   */
  applyLikeCount(messageId: string, count: number): void {
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg && msg.likeCount !== count) {
      msg.likeCount = count;
      this.notify();
    }
  }

  cleanup(now = Date.now()): boolean {
    const before = this.messages.length;
    this.messages = this.messages.filter((m) => m.expiresAt > now);
    if (this.messages.length !== before) {
      this.notify();
      return true;
    }
    return false;
  }

  getActive(carId: number, lineId: string, now = Date.now()): Message[] {
    return this.messages.filter(
      (m) => m.carId === carId && m.lineId === lineId && m.expiresAt > now,
    );
  }

  /**
   * 로컬 옵티미스틱 좋아요 +1.
   * 클라우드 sync 는 reactionService 에서 별도 publish.
   */
  like(messageId: string): void {
    const found = this.messages.find((m) => m.id === messageId);
    if (!found) return;
    found.likeCount += 1;
    this.notify();
  }

  clear(): void {
    this.messages = [];
    this.notify();
  }
}

export const messageStore = new MessageStore();
