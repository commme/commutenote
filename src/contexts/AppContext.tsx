import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getLineById } from "../data/subwayLines";
import {
  getProfile as readProfile,
  saveProfile,
} from "../services/profileService";
import { ensureUserId } from "../services/userIdService";
import type { Profile, SubwayLine } from "../types";

export type Page = "line-select" | "train-entry" | "train-room" | "profile";

interface AppContextValue {
  page: Page;
  profile: Profile;
  line: SubwayLine | null;
  currentCarId: number;
  /** 화면 이동(앞으로) — 브라우저 히스토리에 push 해서 토스 뒤로가기 버튼이 pop 할 수 있게 함 */
  navigate: (page: Page) => void;
  /** 뒤로가기 — 토스 nav bar 뒤로가기와 동일 동작 (history.back → popstate) */
  goBack: () => void;
  selectLine: (line: SubwayLine) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  setProfile: (profile: Profile) => void;
  setCurrentCarId: (updater: number | ((prev: number) => number)) => void;
}

interface HistoryPageState {
  __appPage?: Page;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // 부트 시퀀스: ensureUserId 가 토스 anon key 또는 local UUID 로 profile.id 확정
  // 짧은 비동기 (~수십~수백 ms) 동안 SplashScreen 노출
  const [ready, setReady] = useState<boolean>(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [page, setPage] = useState<Page>("line-select");
  const [currentCarId, setCurrentCarId] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    ensureUserId()
      .catch(() => {
        // ensureUserId 가 실패해도 readProfile() 이 즉시 fallback 발급
      })
      .finally(() => {
        if (cancelled) return;
        const p = readProfile();
        setProfileState(p);
        setPage(p.selectedLineId ? "train-room" : "line-select");
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const line = useMemo(
    () =>
      profile?.selectedLineId ? getLineById(profile.selectedLineId) : null,
    [profile?.selectedLineId],
  );

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
    saveProfile(next);
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfileState((prev) => {
      // prev 가 null 인 시점은 부트 시퀀스 중인데 그 동안 children 이
      // 렌더되지 않으므로 (아래 splash 가드) 실질적으로 도달하지 않음.
      if (!prev) return prev;
      const next: Profile = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  // 화면 이동: 브라우저 히스토리에 push → 토스 nav bar 의 뒤로가기 버튼이 이 엔트리를 pop 함
  const navigate = useCallback((next: Page) => {
    setPage(next);
    try {
      const st: HistoryPageState = { __appPage: next };
      window.history.pushState(st, "");
    } catch {
      // History API 가 없는 드문 환경 — 무시 (그래도 page 상태는 바뀜)
    }
  }, []);

  // 뒤로가기: history.back() → popstate 핸들러가 page 복원.
  // 더 pop 할 게 없으면 (루트) 토스가 미니앱을 종료시킴.
  const goBack = useCallback(() => {
    try {
      window.history.back();
    } catch {
      // ignore
    }
  }, []);

  // 토스 nav bar 의 뒤로가기 버튼 = WebView 의 history.back() → popstate.
  // 우리가 push 한 엔트리를 복원하고, 다 pop 되면 (state 없음) 루트 화면으로.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const st = e.state as HistoryPageState | null;
      if (st && typeof st.__appPage === "string") {
        setPage(st.__appPage);
      } else {
        // 우리 엔트리를 다 pop 함 = 루트. 루트는 선택 노선 유무로 결정.
        const p = readProfile();
        setPage(p.selectedLineId ? "train-room" : "line-select");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const selectLine = useCallback(
    (selected: SubwayLine) => {
      updateProfile({ selectedLineId: selected.id });
      navigate("train-entry");
    },
    [updateProfile, navigate],
  );

  const value = useMemo<AppContextValue | null>(
    () =>
      profile
        ? {
            page,
            profile,
            line,
            currentCarId,
            navigate,
            goBack,
            selectLine,
            updateProfile,
            setProfile,
            setCurrentCarId,
          }
        : null,
    [
      page,
      profile,
      line,
      currentCarId,
      navigate,
      goBack,
      selectLine,
      updateProfile,
      setProfile,
    ],
  );

  // 부트 중이면 children 을 마운트하지 않음 — useApp() 컨슈머는 항상
  // ready 상태의 non-null profile 을 받게 됨.
  if (!ready || !value) {
    return <SplashScreen />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--to-blue-500, #3182f6)",
        color: "#fff",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-0.01em",
      }}
    >
      오늘도 출근합니다
    </div>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
