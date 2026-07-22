import type { StaticImageData } from "next/image";
import surveyShowdownImage from "@/public/games/survey-showdown.png";
import yakuzaImage from "@/public/games/yakuza.png";
import koupImage from "@/public/games/koup.png";

export type GameCover = StaticImageData | { gradient: string };

export interface Game {
  slug: string;
  name: string;
  cover: GameCover;
  players: string;
  type: string;
  description: string;
}

export const games: Game[] = [
  {
    slug: "survey-showdown",
    name: "Survey Showdown",
    cover: surveyShowdownImage,
    players: "2–8 Players",
    type: "Party",
    description: "Survey says… can you guess the top answers?",
  },
  {
    slug: "yakuza",
    name: "Yakuza",
    cover: yakuzaImage,
    players: "6–12 Players",
    type: "Deduction",
    description: "Find the yakuza hiding among you—before it's too late.",
  },
  {
    slug: "koup",
    name: "Koup",
    cover: koupImage,
    players: "2–6 Players",
    type: "Bluffing",
    description: "Bluff, deceive, and outsmart your way to victory.",
  },
];
