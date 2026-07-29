import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlobeIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import heroImage from "@/public/games/home-hero.png";

const stats = [
  {
    icon: UsersIcon,
    title: "2–12 Players",
    subtitle: "Per game",
  },
  {
    icon: GlobeIcon,
    title: "Play Anywhere",
    subtitle: "No downloads",
  },
  {
    icon: LockIcon,
    title: "Safe & Fair",
    subtitle: "Built for fun",
  },
];

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Great games.
          <br />
          <span className="text-primary">Better together.</span>
        </h1>
        <p className="max-w-md text-lg text-muted">
          Host a game, invite your friends, and make every night a game night.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link href="/games">
            <Button variant="primary" size="lg">
              Browse Games
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 pt-6">
          {stats.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-2.5">
              <Icon className="h-5 w-5 text-primary" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink">{title}</div>
                <div className="text-sm text-muted">{subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-surface-alt">
        <Image
          src={heroImage}
          alt="Four friends laughing and playing a card game together at a table"
          className="h-full w-full object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          preload
        />
      </div>
    </section>
  );
}
