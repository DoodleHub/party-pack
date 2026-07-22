import { Header } from "@/components/Header";
import { GamesHero } from "@/components/GamesHero";
import { GamesBrowser } from "@/components/GamesBrowser";
import { GamesCta } from "@/components/GamesCta";

export default function Games() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <GamesHero />
        <GamesBrowser />
        <GamesCta />
      </main>
    </div>
  );
}
