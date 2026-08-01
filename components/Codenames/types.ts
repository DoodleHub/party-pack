export type Team = "red" | "blue";
export type CardTeam = Team | "neutral" | "assassin";
export type Role = "spymaster" | "operative";
export type RoomStatus = "waiting" | "active" | "ended";
export type TurnPhase = "clue" | "guessing";

export interface Player {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  team: Team | null;
  role: Role;
}

export interface CardInfo {
  id: string;
  word: string;
  position: number;
  revealed: boolean;
  revealedTeam: CardTeam | null;
  revealedByPlayerId: string | null;
}

export interface KeyEntry {
  position: number;
  team: CardTeam;
}

export interface LogEvent {
  id: string;
  kind: string;
  text: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string | null;
  name: string;
  text: string;
  createdAt: string;
}

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
  turnTeam: Team | null;
  turnPhase: TurnPhase | null;
  startingTeam: Team | null;
  clueWord: string | null;
  clueNumber: number | null;
  clueUnlimited: boolean;
  clueGivenAt: string | null;
  guessesUsed: number;
  guessesMax: number | null;
  responseDeadline: string | null;
  turnNumber: number;
  redRemaining: number;
  blueRemaining: number;
  winnerTeam: Team | null;
  players: Player[];
  cards: CardInfo[];
  // Empty for non-spymasters — RLS hides codenames_key rows until the game ends.
  key: KeyEntry[];
}

export interface CreateRoomSettings {
  name: string;
  visibility: "public" | "private";
  password: string;
  maxPlayers: number;
  allowSpectators: boolean;
  enableChat: boolean;
}
