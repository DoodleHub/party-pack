export interface Player {
  id: string;
  name: string;
  userId: string | null;
  points: number;
}

export interface Team {
  id: string;
  name: string;
  slot: 1 | 2;
  score: number;
  strikes: number;
  players: Player[];
}

export interface Answer {
  id: string;
  text: string;
  points: number;
  rank: number;
  revealed: boolean;
}

export type RoomStatus = "waiting" | "active" | "ended";

export interface RoomState {
  roomId: string;
  code: string;
  name: string;
  status: RoomStatus;
  visibility: "public" | "private";
  hasPassword: boolean;
  maxPlayers: number;
  allowSpectators: boolean;
  enableChat: boolean;
  hostId: string | null;
  roundNumber: number;
  totalRounds: number;
  activeTeamSlot: 1 | 2;
  activePlayerId: string | null;
  turnEndsAt: string | null;
  teams: Team[];
  currentPrompt: string | null;
  currentAnswers: Answer[];
}

export interface ChatMessage {
  id: string;
  userId: string | null;
  name: string;
  text: string;
  createdAt: string;
}

export interface CreateRoomSettings {
  name: string;
  visibility: "public" | "private";
  password: string;
  maxPlayers: number;
  allowSpectators: boolean;
  enableChat: boolean;
}
