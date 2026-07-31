import { KoupGame } from "@/components/Koup/KoupGame";

export default async function KoupRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <KoupGame roomCode={code} />
      </main>
    </div>
  );
}
