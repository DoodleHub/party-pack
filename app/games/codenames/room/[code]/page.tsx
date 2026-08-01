import { CodenamesGame } from "@/components/Codenames/CodenamesGame";

export default async function CodenamesRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <CodenamesGame roomCode={code} />
      </main>
    </div>
  );
}
