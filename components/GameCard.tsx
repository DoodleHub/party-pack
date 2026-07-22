import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { UsersIcon } from "@/components/ui/Icon";

interface GameCardProps {
  slug: string;
  name: string;
  image: StaticImageData;
  players: string;
  description: string;
}

export function GameCard({ slug, name, image, players, description }: GameCardProps) {
  return (
    <Link
      href={`/games/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-card-foreground/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={image}
          alt={`${name} cover art`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="text-base font-semibold text-card-foreground">{name}</h3>
        <div className="flex items-center gap-1.5 text-sm text-card-muted">
          <UsersIcon className="h-4 w-4 text-primary" />
          {players}
        </div>
        <p className="text-sm text-card-muted">{description}</p>
      </div>
    </Link>
  );
}
