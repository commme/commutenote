import { publishLike } from "./cloudSync";
import { messageStore } from "./messageService";
import { readJson, writeJson } from "./storage";
import { hasSupabaseConfig } from "./supabase";
import { getUserId } from "./userIdService";

const LIKED_KEY = "liked-message-ids";
const MAX_KEEP = 200;

function getLikedSet(): Set<string> {
  return new Set(readJson<string[]>(LIKED_KEY, []));
}

function persistLikedSet(set: Set<string>) {
  let arr = Array.from(set);
  if (arr.length > MAX_KEEP) arr = arr.slice(-MAX_KEEP);
  writeJson(LIKED_KEY, arr);
}

/**
 * 같은 기기에서 같은 메시지 중복 좋아요 방지.
 * 클라우드 모드면 fire-and-forget 으로 likes 테이블에 insert.
 * (트리거가 messages.like_count 를 증가시키고 Realtime UPDATE 가 다시 동기화)
 */
export function likeMessage(messageId: string): boolean {
  const liked = getLikedSet();
  if (liked.has(messageId)) return false;
  liked.add(messageId);
  persistLikedSet(liked);

  // 옵티미스틱 로컬 (즉시 UI 반영)
  messageStore.like(messageId);

  // 클라우드 sync
  if (hasSupabaseConfig) {
    void publishLike(messageId, getUserId());
  }

  return true;
}

export function hasLiked(messageId: string): boolean {
  return getLikedSet().has(messageId);
}
