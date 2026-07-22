import Link from "next/link";
import { GameCard } from "@/components/GameCard";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { games } from "@/lib/games";

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
