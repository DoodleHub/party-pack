import { SurveyShowdownGame } from "@/components/SurveyShowdown/SurveyShowdownGame";

export default async function SurveyShowdownRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <SurveyShowdownGame roomCode={code} />
      </main>
    </div>
  );
}
