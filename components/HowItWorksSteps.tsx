import Image, { StaticImageData } from "next/image";
import { Fragment } from "react";
import { ArrowRightIcon } from "@/components/ui/Icon";
import chooseGameImage from "@/public/how-it-works/choose-game.png";
import inviteFriendsImage from "@/public/how-it-works/invite-friends.png";
import playImage from "@/public/how-it-works/play-and-have-fun.png";

interface Step {
  number: number;
  image: StaticImageData;
  alt: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    image: chooseGameImage,
    alt: "Three PartyPack game cards: Survey Showdown, Yakuza, and Koup",
    title: "Choose a Game",
    description: "Browse our collection and find the perfect game for your group.",
  },
  {
    number: 2,
    image: inviteFriendsImage,
    alt: "Invite Friends panel showing friends who have been invited",
    title: "Invite Friends",
    description: "Send invites to your friends and gather your crew.",
  },
  {
    number: 3,
    image: playImage,
    alt: "A table set up with game cards, snacks, and drinks ready to play",
    title: "Play & Have Fun",
    description: "Jump in, learn as you go, and make great memories.",
  },
];

function stepImageAspectRatio(image: StaticImageData) {
  return `${image.width} / ${image.height}`;
}

export function HowItWorksSteps() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          How It Works
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          3 easy steps to game night
        </h2>
        <p className="mt-3 text-muted">From picking a game to making memories.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            <div className="relative flex h-full flex-col justify-center rounded-2xl bg-card p-6 pt-8 shadow-sm ring-1 ring-card-foreground/5">
              <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {step.number}
              </span>
              <div className="flex items-center gap-4">
                <div
                  className="w-36 shrink-0 overflow-hidden rounded-xl"
                  style={{ aspectRatio: stepImageAspectRatio(step.image) }}
                >
                  <Image
                    src={step.image}
                    alt={step.alt}
                    className="h-full w-full object-cover"
                    sizes="144px"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-card-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-card-muted">{step.description}</p>
                </div>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="hidden items-center justify-center lg:flex">
                <ArrowRightIcon className="h-6 w-6 shrink-0 text-primary" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
