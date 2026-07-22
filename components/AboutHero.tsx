import Image from "next/image";
import heroImage from "@/public/games/home-hero.png";

export function AboutHero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          About
          <br />
          <span className="text-primary">PartyPack</span>
        </h1>
        <p className="max-w-md text-lg text-muted">
          PartyPack makes game night easy, fun, and memorable. We bring people together through
          great games and even better company.
        </p>
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
