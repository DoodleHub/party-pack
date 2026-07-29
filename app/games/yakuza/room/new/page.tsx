import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { yakuzaLobbyInfo } from "@/components/Yakuza/lobbyData";

export default function YakuzaCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm game={yakuzaLobbyInfo} />
    </div>
  );
}
