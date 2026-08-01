import { SurveyShowdownRoomSkeleton } from "@/components/SurveyShowdown/RoomSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-[#050b1f] font-sans">
      <main className="mx-auto flex w-full max-w-[1800px] flex-1 items-start px-6 py-16 sm:px-10">
        <SurveyShowdownRoomSkeleton />
      </main>
    </div>
  );
}
