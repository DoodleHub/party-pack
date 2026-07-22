import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { UsersIcon } from "@/components/ui/Icon";
import type { GameCover } from "@/lib/games";

interface GameCardProps {
  slug: string;
  name: string;
  cover: GameCover;
  players: string;
  type: string;
  description: string;
}

function isImageCover(cover: GameCover): cover is Exclude<GameCover, { gradient: string }> {
  return !("gradient" in cover);
}

export function GameCard({ slug, name, cover, players, type, description }: GameCardProps) {
  return (
    <Link
      href={`/games/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-card-foreground/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden">
        {isImageCover(cover) ? (
          <Image
            src={cover}
            alt={`${name} cover art`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-linear-to-br p-6 text-center transition-transform duration-300 group-hover:scale-105 ${cover.gradient}`}
          >
            <span className="text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow-md">
              {name}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="text-base font-semibold text-card-foreground">{name}</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-card-muted">
            <UsersIcon className="h-4 w-4 text-primary" />
            {players}
          </div>
          <Badge variant="card">{type}</Badge>
        </div>
        <p className="text-sm text-card-muted">{description}</p>
      </div>
    </Link>
  );
}
