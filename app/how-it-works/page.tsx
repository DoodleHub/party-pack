import { Header } from "@/components/Header";
import { HowItWorksHero } from "@/components/HowItWorksHero";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { PartyCta } from "@/components/PartyCta";

export default function HowItWorks() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <HowItWorksHero />
        <HowItWorksSteps />
        <PartyCta />
      </main>
    </div>
  );
}
