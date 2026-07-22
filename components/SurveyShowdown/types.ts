export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  slot: 1 | 2;
  score: number;
  players: Player[];
}

export interface Answer {
  id: string;
  text: string;
  points: number;
  rank: number;
  revealed: boolean;
}

export interface RoomState {
  roomId: string;
  code: string;
  roundNumber: number;
  totalRounds: number;
  activeTeamSlot: 1 | 2;
  teams: Team[];
  currentPrompt: string | null;
  currentAnswers: Answer[];
}
