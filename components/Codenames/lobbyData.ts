import codenamesImage from "@/public/games/codenames.png";
import type { GameLobbyInfo } from "@/components/GameLobby/types";

export const codenamesLobbyInfo: GameLobbyInfo = {
  slug: "codenames",
  name: "Codenames",
  cover: codenamesImage,
  players: "4–10 Players",
  type: "Word Game",
  description: "Give one-word clues to help your team find their secret agents first.",
  gameTime: "20 min",
  difficulty: 3,
  howToPlay: [
    "Split into a Red and Blue team, each with one Spymaster and the rest as Operatives.",
    "Each Spymaster sees a hidden key card showing which of the 25 words on the board belong to their team, the other team, innocent bystanders, or the deadly Assassin.",
    "On your turn, your Spymaster gives one word and a number, like \"Ocean — 3,\" linking that many words on the board.",
    "Your team guesses that many words (plus one bonus guess). Guess correctly to keep going — guess a neutral or enemy word and your turn ends. Guess the Assassin and you lose instantly.",
    "First team to find all of their agents wins.",
  ],
};
