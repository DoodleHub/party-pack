import yakuzaImage from "@/public/games/yakuza.png";
import type { GameLobbyInfo } from "@/components/GameLobby/types";

export const yakuzaLobbyInfo: GameLobbyInfo = {
  slug: "yakuza",
  name: "Yakuza",
  cover: yakuzaImage,
  players: "6–12 Players",
  type: "Deduction",
  description: "Find the Mafia hiding among you—before they take over the town.",
  gameTime: "15–20 min",
  difficulty: 3,
  howToPlay: [
    "Everyone is secretly dealt a role: Mafia, Detective, Doctor, or Citizen.",
    "Each night, the Mafia secretly choose a target, the Doctor protects someone, and the Detective investigates a player.",
    "Each day, discuss what happened, accuse, defend — then vote to eliminate one player.",
    "Town wins by eliminating every Mafia member. Mafia wins once they equal or outnumber the Town.",
  ],
};
