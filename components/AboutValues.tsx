import { ComponentType, SVGProps } from "react";
import { HeartIcon, StarIcon, TrophyIcon, UsersIcon } from "@/components/ui/Icon";

interface Value {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: HeartIcon,
    title: "Connection",
    description: "Games bring people together. That's what we're all about.",
  },
  {
    icon: StarIcon,
    title: "Fun First",
    description: "If it's not fun, we don't feature it.",
  },
  {
    icon: UsersIcon,
    title: "Inclusive",
    description: "Everyone's welcome at the table.",
  },
  {
    icon: TrophyIcon,
    title: "Quality",
    description: "We stand behind games that are well-designed and well-loved.",
  },
];

export function AboutValues() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Our Values</p>
      </div>

      <div className="grid gap-x-8 gap-y-0 divide-y divide-ink/10 sm:grid-cols-2 sm:gap-y-8 sm:divide-y-0 lg:mx-auto lg:w-fit lg:grid-cols-4 lg:divide-x">
        {values.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className={`flex items-start gap-4 py-4 first:pt-0 last:pb-0 sm:py-0`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-tint">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
