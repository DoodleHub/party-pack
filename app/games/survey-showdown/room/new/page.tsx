import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { surveyShowdownLobbyInfo } from "@/components/SurveyShowdown/lobbyData";

export default function SurveyShowdownCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm game={surveyShowdownLobbyInfo} />
    </div>
  );
}
