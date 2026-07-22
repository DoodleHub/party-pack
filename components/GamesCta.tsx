import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icon";
import heroImage from "@/public/games/home-hero.png";

export function GamesCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
      <div className="grid items-center gap-10 rounded-3xl bg-primary-tint p-8 sm:p-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Can&apos;t find the right game?
            <br />
            <span className="text-primary">Create your own room.</span>
          </h2>
          <p className="max-w-md text-muted">
            Invite friends, pick a game, and get the party started.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/rooms/new">
              <Button variant="primary" size="lg">
                <PlusIcon className="h-4 w-4" />
                Create Room
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-surface">
          <Image
            src={heroImage}
            alt="Four friends laughing and playing a card game together at a table"
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
