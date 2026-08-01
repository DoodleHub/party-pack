"use client";

import { Header } from "@/components/Header";
import { CreateRoomForm } from "@/components/GameLobby/CreateRoomForm";
import { createRoom } from "@/components/Codenames/data";
import { codenamesLobbyInfo } from "@/components/Codenames/lobbyData";

export default function CodenamesCreateRoomPage() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Header />
      <CreateRoomForm
        game={codenamesLobbyInfo}
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
