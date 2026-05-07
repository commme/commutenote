import type { SamplePassenger } from "../types";

// 메인 무대에 배치되는 샘플 승객들
// slotIndex: 0,1,2 (왼쪽) / 3,4,5 (오른쪽). 내 캐릭터는 별도 가운데 슬롯에 배치
export const SAMPLE_PASSENGERS: SamplePassenger[] = [
  {
    id: "sp-1",
    nickname: "5호차주민",
    slotIndex: 0,
    avatar: {
      skinTone: "#F5D6BD",
      hairColor: "#1F2937",
      hairStyle: "short",
      expression: "tired",
      outfit: "#3B5BFF",
    },
  },
  {
    id: "sp-2",
    nickname: "조용한사람",
    slotIndex: 1,
    avatar: {
      skinTone: "#FFE0C2",
      hairColor: "#7C5B3B",
      hairStyle: "long",
      expression: "sleepy",
      outfit: "#0F2A4F",
    },
  },
  {
    id: "sp-3",
    nickname: "월요병환자",
    slotIndex: 2,
    avatar: {
      skinTone: "#F8C9A8",
      hairColor: "#222222",
      hairStyle: "cap",
      expression: "tired",
      outfit: "#637381",
    },
  },
  {
    id: "sp-4",
    nickname: "출근초보",
    slotIndex: 3,
    avatar: {
      skinTone: "#F4D2B7",
      hairColor: "#5B3A1F",
      hairStyle: "short",
      expression: "neutral",
      outfit: "#FF8A3D",
    },
  },
  {
    id: "sp-5",
    nickname: "버티는중",
    slotIndex: 4,
    avatar: {
      skinTone: "#F2C79B",
      hairColor: "#2A2A2A",
      hairStyle: "bald",
      expression: "neutral",
      outfit: "#34C759",
    },
  },
  {
    id: "sp-6",
    nickname: "커피러버",
    slotIndex: 5,
    avatar: {
      skinTone: "#F7DEC4",
      hairColor: "#4B2B14",
      hairStyle: "long",
      expression: "happy",
      outfit: "#E2574C",
    },
  },
];

// 데모용으로 랜덤하게 등장할 샘플 메시지 풀
export const SAMPLE_MESSAGES: string[] = [
  "오늘도 출근 성공",
  "월요일은 왜 이렇게 빨리 와요",
  "커피 한잔 했더니 이제 좀 살겠다",
  "어제 너무 늦게 잤어요…",
  "오늘 회의만 안 잡혀있길",
  "주말까지 4일 남음",
  "어디 안 멀리 떠나고 싶다",
  "모두 오늘 하루도 무사하시길",
  "지하철이 따뜻하다 졸려요",
  "출근 전 노래 한 곡 추천받아요",
  "팀장님 오늘만 조용히 지나가주세요",
  "퇴근까지 8시간 남았어요",
];
