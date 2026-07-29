import { GameLobby } from "@/components/GameLobby/GameLobby";
import { surveyShowdownLobbyInfo, surveyShowdownRooms } from "@/components/SurveyShowdown/lobbyData";

export default function SurveyShowdownLobbyPage() {
  return (
    <GameLobby
      game={surveyShowdownLobbyInfo}
      rooms={surveyShowdownRooms}
      yourRoomCode="X7K9P"
    />
  );
}
