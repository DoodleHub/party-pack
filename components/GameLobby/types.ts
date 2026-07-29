import type { GameCover } from "@/lib/games";

export type RoomStatus = "waiting" | "starting-soon" | "in-progress" | "full";
export type RoomVisibility = "public" | "private";

export interface LobbyRoom {
  code: string;
  name: string;
  host: string;
  playerNames: string[];
  maxPlayers: number;
  status: RoomStatus;
  visibility: RoomVisibility;
  createdAt: string;
}

export interface GameLobbyInfo {
  slug: string;
  name: string;
  cover: GameCover;
  players: string;
  type: string;
  description: string;
  gameTime: string;
  difficulty: number;
  howToPlay: string[];
}
