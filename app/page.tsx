import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedGames } from "@/components/FeaturedGames";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeaturedGames />
      </main>
    </div>
  );
}
