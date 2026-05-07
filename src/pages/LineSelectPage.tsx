import { List, ListRow } from "@toss/tds-mobile";
import { useApp } from "../contexts/AppContext";
import { SUBWAY_LINES } from "../data/subwayLines";

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
          {SUBWAY_LINES.map((line) => (
            <ListRow
              key={line.id}
              left={
                <ListRow.AssetText
                  shape="squircle"
                  backgroundColor={line.color}
                  color="#ffffff"
                  size="medium"
                >
                  {line.shortLabel}
                </ListRow.AssetText>
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
          ))}
        </List>
      </div>

      <div className="line-select__hint">
        언제든 프로필에서 노선을 바꿀 수 있어요
      </div>
    </div>
  );
}
