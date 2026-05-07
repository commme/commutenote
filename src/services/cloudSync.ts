import type { Avatar, Message } from "../types";
import { getSupabase, type MessageRow } from "./supabase";

interface StoreSink {
  ingest(msg: Message): void;
  applyLikeCount(messageId: string, count: number): void;
}

/**
 * 특정 (lineId, carId) 채널에 구독.
 * - 진입 시 활성 메시지 1회 fetch
 * - 이후 INSERT/UPDATE 를 sink 로 흘려보냄
 * 반환된 함수로 구독 해제.
 */
export function subscribeCloud(
  lineId: string,
  carId: number,
  sink: StoreSink,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  let alive = true;

  // 초기 활성 메시지 fetch
  void (async () => {
    const { data, error } = await sb
      .from("messages")
      .select("*")
      .eq("line_id", lineId)
      .eq("car_id", carId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });
    if (!alive) return;
    if (error) {
      console.warn("[supabase] initial fetch failed", error);
      return;
    }
    for (const row of data ?? []) {
      sink.ingest(rowToMessage(row as MessageRow));
    }
  })();

  // Realtime 구독: INSERT(새 메시지) + UPDATE(좋아요 수 변경)
  const channel = sb
    .channel(`car:${lineId}:${carId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `line_id=eq.${lineId}`,
      },
      (payload) => {
        const row = payload.new as MessageRow;
        if (row.car_id !== carId) return;
        sink.ingest(rowToMessage(row));
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `line_id=eq.${lineId}`,
      },
      (payload) => {
        const row = payload.new as MessageRow;
        if (row.car_id !== carId) return;
        sink.applyLikeCount(row.id, row.like_count);
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.info(`[supabase] subscribed car:${lineId}:${carId}`);
      }
    });

  return () => {
    alive = false;
    void sb.removeChannel(channel);
  };
}

export async function publishMessage(msg: Message): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("messages").insert({
    id: msg.id,
    user_id: msg.userId,
    nickname: msg.nickname,
    content: msg.content,
    line_id: msg.lineId,
    car_id: msg.carId,
    slot_index: msg.slotIndex,
    avatar: msg.avatar,
    items: msg.items,
    expires_at: new Date(msg.expiresAt).toISOString(),
  });
  if (error) {
    console.warn("[supabase] publish message failed", error);
  }
}

export async function publishLike(
  messageId: string,
  userId: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return true;
  const { error } = await sb
    .from("likes")
    .insert({ message_id: messageId, user_id: userId });
  if (error) {
    if (error.code === "23505") return false; // unique 충돌 = 이미 좋아요
    console.warn("[supabase] publish like failed", error);
    return false;
  }
  return true;
}

function rowToMessage(row: MessageRow): Message {
  const items = Array.isArray(row.items) ? (row.items as string[]) : [];
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    content: row.content,
    carId: row.car_id,
    lineId: row.line_id,
    slotIndex: row.slot_index,
    avatar: row.avatar as Avatar,
    items,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    likeCount: row.like_count,
  };
}
