import { createClient } from "@/lib/supabase/server";
import { GameLobby } from "@/components/GameLobby/GameLobby";
import { LobbyRealtimeRefresh } from "@/components/SurveyShowdown/LobbyRealtimeRefresh";
import { surveyShowdownLobbyInfo } from "@/components/SurveyShowdown/lobbyData";
import type { LobbyRoom } from "@/components/GameLobby/types";

export default async function SurveyShowdownLobbyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roomsQuery = supabase
    .from("survey_showdown_rooms")
    .select("id, code, name, status, visibility, max_players, host_id, created_at")
    .neq("status", "ended")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: rawRooms } = user
    ? await roomsQuery.or(`visibility.eq.public,host_id.eq.${user.id}`)
    : await roomsQuery.eq("visibility", "public");

  const rooms = rawRooms ?? [];
  const roomIds = rooms.map((r) => r.id);
  const hostIds = [...new Set(rooms.map((r) => r.host_id).filter((id): id is string => !!id))];

  const [{ data: teamsWithPlayers }, { data: hostProfiles }] = await Promise.all([
    roomIds.length
      ? supabase
          .from("survey_showdown_teams")
          .select("room_id, players:survey_showdown_players(name, user_id)")
          .in("room_id", roomIds)
      : Promise.resolve({ data: [] }),
    hostIds.length
      ? supabase.from("profiles").select("id, username").in("id", hostIds)
      : Promise.resolve({ data: [] }),
  ]);

  const hostNameById = new Map((hostProfiles ?? []).map((p) => [p.id, p.username]));
  const playerNamesByRoom = new Map<string, string[]>();
  const roomsYouAreIn = new Set<string>();
  for (const team of teamsWithPlayers ?? []) {
    const names = (team.players ?? []).map((p) => p.name);
    playerNamesByRoom.set(team.room_id, [
      ...(playerNamesByRoom.get(team.room_id) ?? []),
      ...names,
    ]);
    if (user && (team.players ?? []).some((p) => p.user_id === user.id)) {
      roomsYouAreIn.add(team.room_id);
    }
  }

  const lobbyRooms: LobbyRoom[] = rooms.map((room) => {
    const playerNames = playerNamesByRoom.get(room.id) ?? [];
    const isFull = playerNames.length >= room.max_players;

    return {
      code: room.code,
      name: room.name || "Untitled Room",
      host: (room.host_id && hostNameById.get(room.host_id)) || "Unknown",
      playerNames,
      maxPlayers: room.max_players,
      status: room.status === "active" ? "in-progress" : isFull ? "full" : "waiting",
      visibility: room.visibility as LobbyRoom["visibility"],
      createdAt: room.created_at,
      isPlayer: roomsYouAreIn.has(room.id),
    };
  });

  const yourRoomCode = user
    ? rooms.find((r) => r.host_id === user.id)?.code
    : undefined;

  return (
    <>
      <LobbyRealtimeRefresh />
      <GameLobby game={surveyShowdownLobbyInfo} rooms={lobbyRooms} yourRoomCode={yourRoomCode} />
    </>
  );
}
