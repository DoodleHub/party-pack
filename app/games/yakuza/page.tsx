import { createClient } from "@/lib/supabase/server";
import { GameLobby } from "@/components/GameLobby/GameLobby";
import { LobbyRealtimeRefresh } from "@/components/Yakuza/LobbyRealtimeRefresh";
import { yakuzaLobbyInfo } from "@/components/Yakuza/lobbyData";
import type { LobbyRoom } from "@/components/GameLobby/types";

export default async function YakuzaLobbyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawRooms } = await supabase
    .from("yakuza_rooms")
    .select("id, code, name, status, visibility, max_players, host_id, created_at")
    .neq("status", "ended")
    .order("created_at", { ascending: false })
    .limit(30);

  const rooms = rawRooms ?? [];
  const roomIds = rooms.map((r) => r.id);

  const { data: players } = roomIds.length
    ? await supabase.from("yakuza_players").select("room_id, name, user_id").in("room_id", roomIds)
    : { data: [] };

  const playerNamesByRoom = new Map<string, string[]>();
  const nameByRoomAndUser = new Map<string, string>();
  const roomsYouAreIn = new Set<string>();
  for (const player of players ?? []) {
    playerNamesByRoom.set(player.room_id, [
      ...(playerNamesByRoom.get(player.room_id) ?? []),
      player.name,
    ]);
    if (player.user_id) {
      nameByRoomAndUser.set(`${player.room_id}:${player.user_id}`, player.name);
    }
    if (user && player.user_id === user.id) {
      roomsYouAreIn.add(player.room_id);
    }
  }

  const lobbyRooms: LobbyRoom[] = rooms.map((room) => {
    const playerNames = playerNamesByRoom.get(room.id) ?? [];
    const isFull = playerNames.length >= room.max_players;
    const hostName = room.host_id ? nameByRoomAndUser.get(`${room.id}:${room.host_id}`) : undefined;

    return {
      code: room.code,
      name: room.name || "Untitled Room",
      host: hostName ?? "Unknown",
      playerNames,
      maxPlayers: room.max_players,
      status: room.status === "active" ? "in-progress" : isFull ? "full" : "waiting",
      visibility: room.visibility as LobbyRoom["visibility"],
      createdAt: room.created_at,
      isPlayer: roomsYouAreIn.has(room.id),
    };
  });

  const yourRoomCode = user ? rooms.find((r) => r.host_id === user.id)?.code : undefined;

  return (
    <>
      <LobbyRealtimeRefresh />
      <GameLobby game={yakuzaLobbyInfo} rooms={lobbyRooms} yourRoomCode={yourRoomCode} />
    </>
  );
}
