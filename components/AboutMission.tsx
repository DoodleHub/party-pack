import { ComponentType, SVGProps } from "react";
import { ControllerIcon, ShieldIcon, UsersIcon } from "@/components/ui/Icon";

interface MissionPoint {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const points: MissionPoint[] = [
  {
    icon: ControllerIcon,
    title: "Curated Games",
    description: "We handpick games that are fun, engaging, and perfect for any group or occasion.",
  },
  {
    icon: UsersIcon,
    title: "Play Anywhere",
    description: "No downloads, no setup. Just open PartyPack and start playing.",
  },
  {
    icon: ShieldIcon,
    title: "Safe & Fair",
    description: "We promote respectful play and inclusive fun for everyone at the table.",
  },
];

export function AboutMission() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Our Mission</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          More games. More laughs. More together.
        </h2>
        <p className="mt-3 text-muted">
          We believe the best memories are made face to face. PartyPack helps you discover the
          perfect games, invite your people, and turn any night into something special.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {points.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-card-foreground/5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-card-foreground">{title}</h3>
            <p className="mt-1 text-sm text-card-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
