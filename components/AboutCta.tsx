import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import footerImage from "@/public/how-it-works/footer.png";

export function AboutCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
      <div className="grid items-center gap-10 rounded-3xl bg-primary-tint p-8 sm:p-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Ready for your
            <br />
            <span className="text-primary">next game night?</span>
          </h2>
          <p className="max-w-md text-muted">
            Gather your friends, pick a game, and make some memories.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/games">
              <Button variant="primary" size="lg">
                Browse Games
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-surface">
          <Image
            src={footerImage}
            alt="Four friends high-fiving over a table full of cards, snacks, and drinks"
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
