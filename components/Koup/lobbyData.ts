import koupImage from "@/public/games/koup.png";
import type { GameLobbyInfo, LobbyRoom } from "@/components/GameLobby/types";

export const koupLobbyInfo: GameLobbyInfo = {
  slug: "koup",
  name: "Koup",
  cover: koupImage,
  players: "2–6 Players",
  type: "Bluffing",
  description: "Bluff, deceive, and outsmart your way to victory.",
  gameTime: "15 min",
  difficulty: 3,
  howToPlay: [
    "Each player secretly holds character cards with unique powers.",
    "Take actions to gain influence and eliminate opponents.",
    "Bluff your role to pull off powerful moves—or call out other players' bluffs.",
    "Last player with influence left wins!",
  ],
};

export const koupRooms: LobbyRoom[] = [
  {
    code: "K3P8W",
    name: "Bluff Masters",
    host: "Priya",
    playerNames: ["Priya", "Owen", "Nadia", "Leo", "Grace"],
    maxPlayers: 6,
    status: "waiting",
    visibility: "public",
    createdAt: "2026-07-28T19:15:00Z",
  },
  {
    code: "C7L2M",
    name: "Coup d'Grad",
    host: "Sam",
    playerNames: ["Sam", "Elena", "Diego", "Faye", "Milo", "Tara"],
    maxPlayers: 6,
    status: "full",
    visibility: "public",
    createdAt: "2026-07-28T18:55:00Z",
  },
  {
    code: "B5N9R",
    name: "Backstabbers Inc",
    host: "Devon",
    playerNames: ["Devon", "Ana", "Chris"],
    maxPlayers: 6,
    status: "in-progress",
    visibility: "public",
    createdAt: "2026-07-28T18:30:00Z",
  },
  {
    code: "Q2T6H",
    name: "Rookie Table",
    host: "Noah",
    playerNames: ["Noah", "Ivy"],
    maxPlayers: 6,
    status: "starting-soon",
    visibility: "public",
    createdAt: "2026-07-28T19:30:00Z",
  },
];
