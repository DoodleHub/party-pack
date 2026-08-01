import { YakuzaGame } from "@/components/Yakuza/YakuzaGame";

export default async function YakuzaRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <YakuzaGame roomCode={code} />
      </main>
    </div>
  );
}
