import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { koupLobbyInfo } from "@/components/Koup/lobbyData";

export default function KoupCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm game={koupLobbyInfo} />
    </div>
  );
}
