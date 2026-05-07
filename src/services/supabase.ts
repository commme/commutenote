import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// 사용자가 실수로 URL 뒤에 /rest/v1 같은 경로를 붙여 넣었을 때 자동 정리
// (supabase-js 가 알아서 /rest/v1 을 붙이므로 base 만 있어야 함)
function sanitizeSupabaseUrl(input: string): string {
  return input
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v\d+$/i, "")
    .replace(/\/realtime\/v\d+$/i, "")
    .replace(/\/auth\/v\d+$/i, "")
    .replace(/\/storage\/v\d+$/i, "");
}

const url = sanitizeSupabaseUrl(rawUrl);

if (rawUrl !== url && rawUrl.length > 0) {
  // 개발자에게 한 번 알림 — 다음부터는 .env 도 바로잡을 수 있게
  console.warn(
    `[supabase] VITE_SUPABASE_URL 정리됨\n  before: ${rawUrl}\n  after:  ${url}\n  .env 의 URL 은 base 만 (예: https://xxxx.supabase.co) 적어주세요.`,
  );
}

export const hasSupabaseConfig =
  url.length > 0 && anonKey.length > 0 && url.startsWith("http");

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!hasSupabaseConfig) return null;
  if (client) return client;
  client = createClient(url, anonKey, {
    auth: {
      // 익명 앱이라 세션 영속화/리프레시 모두 끔
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 5,
      },
    },
  });
  return client;
}

// DB 행 ↔ 도메인 객체 매핑용 타입 (drizzle/zod 까지는 안 가도 충분)
export interface MessageRow {
  id: string;
  user_id: string;
  nickname: string;
  content: string;
  line_id: string;
  car_id: number;
  slot_index: number;
  avatar: unknown; // jsonb
  items: unknown; // jsonb (string[])
  created_at: string;
  expires_at: string;
  like_count: number;
}

export interface LikeRow {
  message_id: string;
  user_id: string;
  created_at: string;
}
