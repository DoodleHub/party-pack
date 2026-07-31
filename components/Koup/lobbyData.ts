import koupImage from "@/public/games/koup.png";
import type { GameLobbyInfo } from "@/components/GameLobby/types";

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
    "Every player secretly holds 2 character cards (Influence) and starts with 2 coins.",
    "On your turn, take one action — Income, Foreign Aid, Coup, or claim a character for Tax, Steal, Assassinate, or Exchange.",
    "Anyone can challenge a character claim, and some actions can be blocked. Bluff confidently, or call out a lie.",
    "Lose a challenge or a blocked bluff and you reveal an Influence. Lose both and you're out — last player standing wins!",
  ],
};
