import { GameLobby } from "@/components/GameLobby/GameLobby";
import { koupLobbyInfo, koupRooms } from "@/components/Koup/lobbyData";

export default function KoupLobbyPage() {
  return <GameLobby game={koupLobbyInfo} rooms={koupRooms} />;
}
