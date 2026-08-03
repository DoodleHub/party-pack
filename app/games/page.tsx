import { Header } from "@/components/Header";
import { GamesBrowser } from "@/components/GamesBrowser";

export default function Games() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <GamesBrowser />
      </main>
    </div>
  );
}
