"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { SearchIcon } from "@/components/ui/Icon";
import { games } from "@/lib/games";

export function GamesBrowser() {
  const [search, setSearch] = useState("");

  const filteredGames = useMemo(() => {
    if (!search) return games;
    return games.filter((game) => game.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
      <div className="mb-8 flex h-13 max-w-md items-center gap-2 rounded-xl border border-ink/10 bg-card px-4">
        <SearchIcon className="h-4 w-4 shrink-0 text-card-muted" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search games..."
          className="w-full bg-transparent text-sm text-card-foreground placeholder:text-card-muted focus:outline-none"
        />
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard key={game.slug} {...game} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted">
          No games match your search. Try a different keyword.
        </p>
      )}
    </section>
  );
}
