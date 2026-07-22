import { SurveyShowdownGame } from "@/components/SurveyShowdown/SurveyShowdownGame";

export default function SurveyShowdownPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <SurveyShowdownGame roomCode="X7K9P" />
      </main>
    </div>
  );
}
