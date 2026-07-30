import surveyShowdownImage from "@/public/games/survey-showdown.png";
import type { GameLobbyInfo } from "@/components/GameLobby/types";

export const surveyShowdownLobbyInfo: GameLobbyInfo = {
  slug: "survey-showdown",
  name: "Survey Showdown",
  cover: surveyShowdownImage,
  players: "2–8 Players",
  type: "Party",
  description: "Survey says… can you guess the top answers?",
  gameTime: "10–15 min",
  difficulty: 2,
  howToPlay: [
    "Split into two teams.",
    "Take turns guessing the top survey answers.",
    "Steal points if the other team whiffs their guess.",
    "Highest score after all rounds wins!",
  ],
};
