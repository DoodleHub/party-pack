import { Header } from "@/components/Header";
import { AboutHero } from "@/components/AboutHero";
import { AboutMission } from "@/components/AboutMission";
import { AboutValues } from "@/components/AboutValues";
import { AboutCta } from "@/components/AboutCta";

export default function About() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <AboutHero />
        <AboutMission />
        <AboutValues />
        <AboutCta />
      </main>
    </div>
  );
}
