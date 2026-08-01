"use client";

import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { createRoom } from "@/components/Yakuza/data";
import { yakuzaLobbyInfo } from "@/components/Yakuza/lobbyData";

export default function YakuzaCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm
        game={yakuzaLobbyInfo}
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
