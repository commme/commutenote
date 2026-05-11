import { useEffect, useState } from "react";
import { List, ListRow } from "@toss/tds-mobile";
import { useApp } from "../contexts/AppContext";
import { SUBWAY_LINES } from "../data/subwayLines";
import { makeTransparent } from "../utils/transparentImage";

// 노선 id → GPT 3D 토이 아이콘 PNG (line-sb 는 PNG 없어서 fallback)
const LINE_ICON: Record<string, string | undefined> = {
  "line-2": "/assets/lines/line-02-subway.png",
  "line-3": "/assets/lines/line-03-subway.png",
  "line-7": "/assets/lines/line-07-subway.png",
  "line-9": "/assets/lines/line-09-subway.png",
  "line-sb": undefined,
};

function useTransparent(src: string): string {
  const [url, setUrl] = useState(src);
  useEffect(() => {
    let cancelled = false;
    setUrl(src);
    makeTransparent(src).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);
  return url;
}

function LineIcon({ src, alt }: { src: string; alt: string }) {
  const transparent = useTransparent(src);
  return (
    <div
      style={{
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={transparent}
        alt={alt}
        width={56}
        height={56}
        style={{ objectFit: "contain", display: "block" }}
        draggable={false}
      />
    </div>
  );
}

/**
 * 노선 선택 화면 — 글귀는 그대로, 카드는 TDS List + ListRow 사용
 */
export function LineSelectPage() {
  const { selectLine } = useApp();

  return (
    <div className="line-select">
      <div className="line-select__hero">
        <div className="line-select__brand">오늘도 출근합니다</div>
        <div className="line-select__lead">
          오늘은 어느 열차로 출근하시나요?
        </div>
        <div className="line-select__sub">타고 싶은 노선을 골라주세요</div>
      </div>

      <div className="line-select__list-wrap">
        <List>
          {SUBWAY_LINES.map((line) => {
            const iconSrc = LINE_ICON[line.id];
            return (
              <ListRow
                key={line.id}
                left={
                  iconSrc ? (
                    <LineIcon src={iconSrc} alt={line.name} />
                  ) : (
                    <ListRow.AssetText
                      shape="squircle"
                      backgroundColor={line.color}
                      color="#ffffff"
                      size="medium"
                    >
                      {line.shortLabel}
                    </ListRow.AssetText>
                  )
                }
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={line.name}
                    bottom={line.description}
                  />
                }
                withArrow
                onClick={() => selectLine(line)}
              />
            );
          })}
        </List>
      </div>

      <div className="line-select__hint">
        언제든 프로필에서 노선을 바꿀 수 있어요
      </div>
    </div>
  );
}
