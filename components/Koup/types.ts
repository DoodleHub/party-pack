export type Character = "duke" | "assassin" | "captain" | "ambassador" | "contessa";

export type ActionType =
  | "income"
  | "foreign_aid"
  | "coup"
  | "tax"
  | "assassinate"
  | "steal"
  | "exchange";

export type RoomStatus = "waiting" | "active" | "ended";

export type Phase =
  | "awaiting_action"
  | "awaiting_response"
  | "awaiting_block_challenge"
  | "awaiting_exchange_select"
  | "awaiting_influence_loss"
  | "game_over";

export interface HandCard {
  id: string;
  character: Character;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  coins: number;
  influenceRemaining: number;
  eliminated: boolean;
  revealedCards: Character[];
}

export interface PendingAction {
  type: ActionType;
  actorPlayerId: string;
  targetPlayerId: string | null;
  claimedCharacter: Character | null;
}

export interface PendingBlock {
  blockerPlayerId: string;
  claimedCharacter: Character;
}

export type LossReason =
  | "bluff_action"
  | "wrong_challenge_action"
  | "bluff_block"
  | "wrong_challenge_block"
  | "assassinated"
  | "couped";

export interface PendingLoss {
  playerId: string;
  reason: LossReason;
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
  turnPlayerId: string | null;
  turnNumber: number;
  deckCount: number;
  phase: Phase;
  pendingAction: PendingAction | null;
  pendingBlock: PendingBlock | null;
  pendingLoss: PendingLoss | null;
  responseDeadline: string | null;
  winnerPlayerId: string | null;
  players: Player[];
  myHand: HandCard[];
}

export interface CreateRoomSettings {
  name: string;
  visibility: "public" | "private";
  password: string;
  maxPlayers: number;
  allowSpectators: boolean;
  enableChat: boolean;
}
