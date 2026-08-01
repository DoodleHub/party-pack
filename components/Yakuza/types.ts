export type RoomStatus = "waiting" | "active" | "ended";

export type Phase = "night" | "day" | "voting" | "game_over";

export type NightStep = "mafia" | "doctor" | "detective" | "sleep";

export type Role = "mafia" | "detective" | "doctor" | "citizen";

export interface Player {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  alive: boolean;
  // Populated only when RLS allows it: your own role, any revealed/dead player's
  // role, or (if you're Mafia) your Mafia teammates'. Null just means "hidden from you".
  role: Role | null;
  roleRevealed: boolean;
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

export interface Investigation {
  id: string;
  roundNumber: number;
  targetPlayerId: string;
  targetName: string;
  result: "mafia" | "not_mafia";
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
  phase: Phase | null;
  nightStep: NightStep | null;
  roundNumber: number;
  phaseDeadline: string | null;
  startedAt: string | null;
  winner: "mafia" | "town" | null;
  players: Player[];
  myRole: Role | null;
  // The target_player_id I already voted for this round, or null if I haven't yet.
  myVote: string | null;
  // Private to the Detective — never leaves this player's own fetched state.
  myInvestigations: Investigation[];
}

export interface CreateRoomSettings {
  name: string;
  visibility: "public" | "private";
  password: string;
  maxPlayers: number;
  allowSpectators: boolean;
  enableChat: boolean;
}
