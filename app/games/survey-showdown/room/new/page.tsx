"use client";

import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { createRoom } from "@/components/SurveyShowdown/data";
import { surveyShowdownLobbyInfo } from "@/components/SurveyShowdown/lobbyData";

export default function SurveyShowdownCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm
        game={surveyShowdownLobbyInfo}
        onCreateRoom={(settings) =>
          createRoom({
            name: settings.roomName,
            visibility: settings.visibility,
            password: settings.password,
            maxPlayers: settings.maxPlayers,
            allowSpectators: settings.allowSpectators,
            enableChat: settings.enableChat,
          })
        }
      />
    </div>
  );
}
