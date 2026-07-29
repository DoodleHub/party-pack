import { GameLobby } from "@/components/GameLobby/GameLobby";
import { yakuzaLobbyInfo, yakuzaRooms } from "@/components/Yakuza/lobbyData";

export default function YakuzaLobbyPage() {
  return <GameLobby game={yakuzaLobbyInfo} rooms={yakuzaRooms} />;
}
