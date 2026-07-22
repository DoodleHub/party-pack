import Link from "next/link";
import { GameCard } from "@/components/GameCard";
import { ArrowRightIcon } from "@/components/ui/Icon";
import surveyShowdownImage from "@/public/games/survey-showdown.png";
import yakuzaImage from "@/public/games/yakuza.png";
import koupImage from "@/public/games/koup.png";

const games = [
  {
    slug: "survey-showdown",
    name: "Survey Showdown",
    image: surveyShowdownImage,
    players: "2–8 Players",
    description: "Survey says… can you guess the top answers?",
  },
  {
    slug: "yakuza",
    name: "Yakuza",
    image: yakuzaImage,
    players: "6–12 Players",
    description: "Find the yakuza hiding among you—before it's too late.",
  },
  {
    slug: "koup",
    name: "Koup",
    image: koupImage,
    players: "2–6 Players",
    description: "Bluff, deceive, and outsmart your way to victory.",
  },
];

export function FeaturedGames() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Featured Games</h2>
        <Link
          href="/games"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          View all games
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.slug} {...game} />
        ))}
      </div>
    </section>
  );
}
