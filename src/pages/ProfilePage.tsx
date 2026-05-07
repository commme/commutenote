import { Button, Tab } from "@toss/tds-mobile";
import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { useApp } from "../contexts/AppContext";
import { getLineById } from "../data/subwayLines";
import type {
  Avatar as AvatarType,
  Expression,
  HairStyle,
  Profile,
} from "../types";

const TABS = ["헤어", "표정", "옷", "소품", "가방"] as const;

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "단발" },
  { id: "long", label: "장발" },
  { id: "cap", label: "모자" },
  { id: "bald", label: "민머리" },
];

const HAIR_COLORS = [
  "#1F2937",
  "#7C5B3B",
  "#5B3A1F",
  "#A8654B",
  "#3B2C1F",
  "#D4B89A",
];

const EXPRESSIONS: { id: Expression; label: string }[] = [
  { id: "happy", label: "방긋" },
  { id: "tired", label: "피곤" },
  { id: "neutral", label: "무표정" },
  { id: "sleepy", label: "졸림" },
];

const OUTFIT_COLORS = [
  "#3182F6",
  "#191F28",
  "#FF8A3D",
  "#6B7684",
  "#34C759",
  "#FF5A6B",
  "#7D8B2E",
  "#C6A34A",
];

const ACCESSORIES: { id: string; label: string }[] = [
  { id: "acc-glasses", label: "안경" },
  { id: "acc-coffee", label: "커피컵" },
  { id: "acc-earphones", label: "이어폰" },
  { id: "acc-mask", label: "마스크" },
];

const BAGS: { id: string | null; label: string }[] = [
  { id: null, label: "없음" },
  { id: "bag-laptop", label: "노트북 가방" },
  { id: "bag-tote", label: "에코백" },
];

export function ProfilePage() {
  const { profile, setProfile, navigate } = useApp();
  const [draft, setDraft] = useState<Profile>(profile);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const updateAvatar = (patch: Partial<AvatarType>) =>
    setDraft((d) => ({ ...d, avatar: { ...d.avatar, ...patch } }));

  const toggleAccessory = (id: string) =>
    setDraft((d) => {
      const has = d.equippedItems.includes(id);
      const next = has
        ? d.equippedItems.filter((i) => i !== id)
        : [...d.equippedItems, id];
      return { ...d, equippedItems: next };
    });

  const setBag = (id: string | null) =>
    setDraft((d) => {
      const filtered = d.equippedItems.filter((i) => !i.startsWith("bag-"));
      return { ...d, equippedItems: id ? [...filtered, id] : filtered };
    });

  const handleSave = () => {
    const trimmedNick = draft.nickname.trim();
    setProfile({
      ...draft,
      nickname: trimmedNick.length > 0 ? trimmedNick : profile.nickname,
    });
    navigate(profile.selectedLineId ? "train-room" : "line-select");
  };

  const currentBag =
    draft.equippedItems.find((i) => i.startsWith("bag-")) ?? null;

  const selectedLine = profile.selectedLineId
    ? getLineById(profile.selectedLineId)
    : null;

  const tab = TABS[tabIndex];

  return (
    <div className="profile">
      <header className="profile__header">
        <button
          type="button"
          className="profile__back"
          onClick={() =>
            navigate(profile.selectedLineId ? "train-room" : "line-select")
          }
          aria-label="이전 화면으로"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#191F28"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="profile__title">내 캐릭터 꾸미기</h1>
        <span className="profile__spacer" />
      </header>

      <div className="profile__stage">
        <div className="profile__stage-bg" />
        <div className="profile__avatar-wrap">
          <Avatar
            avatar={draft.avatar}
            items={draft.equippedItems}
            size={180}
            isMine
          />
        </div>
      </div>

      <div className="profile__nick">
        <label className="profile__nick-label">닉네임</label>
        <input
          className="profile__nick-input"
          value={draft.nickname}
          onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
          maxLength={10}
          placeholder="익명 닉네임"
          aria-label="닉네임"
        />
      </div>

      {selectedLine && (
        <button
          type="button"
          className="profile__line-row"
          onClick={() => navigate("line-select")}
        >
          <span
            className="profile__line-badge"
            style={{ background: selectedLine.color }}
          >
            {selectedLine.shortLabel}
          </span>
          <div className="profile__line-info">
            <div className="profile__line-name">{selectedLine.name}</div>
            <div className="profile__line-desc">노선 바꾸기</div>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B95A1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <div className="profile__tabs">
        <Tab onChange={(idx) => setTabIndex(idx)}>
          {TABS.map((t, i) => (
            <Tab.Item key={t} selected={tabIndex === i}>
              {t}
            </Tab.Item>
          ))}
        </Tab>
      </div>

      <div className="profile__options">
        {tab === "헤어" && (
          <>
            <div className="opt-grid">
              {HAIR_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`opt-card${draft.avatar.hairStyle === s.id ? " is-selected" : ""}`}
                  onClick={() => updateAvatar({ hairStyle: s.id })}
                >
                  <div className="opt-card__preview">
                    <Avatar
                      avatar={{ ...draft.avatar, hairStyle: s.id }}
                      size={64}
                    />
                  </div>
                  <div className="opt-card__label">{s.label}</div>
                </button>
              ))}
            </div>
            <div className="opt-section-label">머리 색</div>
            <div className="opt-swatches">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`opt-swatch${draft.avatar.hairColor === c ? " is-selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => updateAvatar({ hairColor: c })}
                  aria-label={`머리 색 ${c}`}
                />
              ))}
            </div>
          </>
        )}

        {tab === "표정" && (
          <div className="opt-grid">
            {EXPRESSIONS.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`opt-card${draft.avatar.expression === e.id ? " is-selected" : ""}`}
                onClick={() => updateAvatar({ expression: e.id })}
              >
                <div className="opt-card__preview">
                  <Avatar
                    avatar={{ ...draft.avatar, expression: e.id }}
                    size={64}
                  />
                </div>
                <div className="opt-card__label">{e.label}</div>
              </button>
            ))}
          </div>
        )}

        {tab === "옷" && (
          <div className="opt-swatches opt-swatches--big">
            {OUTFIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`opt-swatch opt-swatch--big${draft.avatar.outfit === c ? " is-selected" : ""}`}
                style={{ background: c }}
                onClick={() => updateAvatar({ outfit: c })}
                aria-label={`옷 색 ${c}`}
              />
            ))}
          </div>
        )}

        {tab === "소품" && (
          <>
            <div className="opt-grid">
              {ACCESSORIES.map((a) => {
                const equipped = draft.equippedItems.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`opt-card${equipped ? " is-selected" : ""}`}
                    onClick={() => toggleAccessory(a.id)}
                  >
                    <div className="opt-card__preview">
                      <Avatar avatar={draft.avatar} items={[a.id]} size={64} />
                    </div>
                    <div className="opt-card__label">{a.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="opt-section-label">
              여러 개를 동시에 착용할 수 있어요
            </div>
          </>
        )}

        {tab === "가방" && (
          <div className="opt-grid">
            {BAGS.map((b) => {
              const selected = currentBag === b.id;
              return (
                <button
                  key={b.id ?? "none"}
                  type="button"
                  className={`opt-card${selected ? " is-selected" : ""}`}
                  onClick={() => setBag(b.id)}
                >
                  <div className="opt-card__preview">
                    <Avatar
                      avatar={draft.avatar}
                      items={b.id ? [b.id] : []}
                      size={64}
                    />
                  </div>
                  <div className="opt-card__label">{b.label}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="profile__cta">
        <Button display="full" onClick={handleSave}>
          저장하고 열차로
        </Button>
      </div>
    </div>
  );
}
