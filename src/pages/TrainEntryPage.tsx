import { useApp } from "../contexts/AppContext";
import { TrainDoorAnimation } from "../components/TrainDoorAnimation";

/**
 * 열차 진입 화면 — 도어 애니메이션 끝나면 train-room 으로 이동
 */
export function TrainEntryPage() {
  const { line, navigate } = useApp();
  if (!line) {
    // 비정상 상태 — 노선 선택으로 돌아간다
    navigate("line-select");
    return null;
  }
  return (
    <TrainDoorAnimation line={line} onComplete={() => navigate("train-room")} />
  );
}
