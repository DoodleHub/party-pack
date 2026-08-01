import { createClient } from "@/lib/supabase/client";
import type {
  ChatMessage,
  CreateRoomSettings,
  Investigation,
  LogEvent,
  NightStep,
  Phase,
  Player,
  Role,
  RoomState,
} from "@/components/Yakuza/types";

const supabase = createClient();

const ROOM_COLUMNS =
  "id, code, name, status, visibility, password_hash, max_players, allow_spectators, enable_chat, host_id, phase, night_step, round_number, phase_deadline, started_at, winner";

export async function fetchRoomState(code: string): Promise<RoomState | null> {
  const { data: room, error: roomError } = await supabase
    .from("yakuza_rooms")
    .select(ROOM_COLUMNS)
    .eq("code", code)
    .maybeSingle();

  if (roomError || !room) return null;

  const { data: userData } = await supabase.auth.getUser();
  const myUserId = userData.user?.id ?? null;

  const [{ data: playerRows }, { data: roleRows }, { data: voteRows }, { data: investigationRows }] =
    await Promise.all([
      supabase.from("yakuza_players").select("*").eq("room_id", room.id).order("sort_order"),
      supabase.from("yakuza_roles").select("*").eq("room_id", room.id),
      supabase
        .from("yakuza_votes")
        .select("*")
        .eq("room_id", room.id)
        .eq("round_number", room.round_number),
      supabase.from("yakuza_investigations").select("*").eq("room_id", room.id).order("created_at"),
    ]);

  const roles = roleRows ?? [];

  const players: Player[] = (playerRows ?? []).map((p) => {
    const roleRow = roles.find((r) => r.player_id === p.id);
    return {
      id: p.id,
      userId: p.user_id,
      name: p.name,
      sortOrder: p.sort_order,
      alive: p.alive,
      role: (roleRow?.role as Role) ?? null,
      roleRevealed: roleRow?.revealed ?? false,
    };
  });

  const myPlayer = players.find((p) => p.userId === myUserId) ?? null;
  const myVote =
    (voteRows ?? []).find((v) => v.voter_player_id === myPlayer?.id)?.target_player_id ?? null;

  // RLS already scopes yakuza_investigations to rows where I'm the detective, so
  // every row returned here is mine.
  const myInvestigations: Investigation[] = (investigationRows ?? []).map((inv) => ({
    id: inv.id,
    roundNumber: inv.round_number,
    targetPlayerId: inv.target_player_id,
    targetName: players.find((p) => p.id === inv.target_player_id)?.name ?? "Unknown",
    result: inv.result as Investigation["result"],
    createdAt: inv.created_at,
  }));

  return {
    roomId: room.id,
    code: room.code,
    name: room.name,
    status: room.status as RoomState["status"],
    visibility: room.visibility as RoomState["visibility"],
    hasPassword: room.password_hash !== null,
    maxPlayers: room.max_players,
    allowSpectators: room.allow_spectators,
    enableChat: room.enable_chat,
    hostId: room.host_id,
    phase: room.phase as Phase | null,
    nightStep: room.night_step as NightStep | null,
    roundNumber: room.round_number,
    phaseDeadline: room.phase_deadline,
    startedAt: room.started_at,
    winner: room.winner as RoomState["winner"],
    players,
    myRole: myPlayer?.role ?? null,
    myVote,
    myInvestigations,
  };
}

export function subscribeToLobbyRooms(onChange: () => void) {
  const channel = supabase
    .channel("yakuza-lobby")
    .on("postgres_changes", { event: "*", schema: "public", table: "yakuza_rooms" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "yakuza_players" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoom(roomId: string, onChange: () => void) {
  const channel = supabase
    .channel(`yakuza-room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "yakuza_rooms", filter: `id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "yakuza_players", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "yakuza_roles", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createRoom(
  settings: CreateRoomSettings,
): Promise<{ code: string } | { error: string }> {
  const { data, error } = await supabase.rpc("yakuza_create_room", {
    p_name: settings.name,
    p_visibility: settings.visibility,
    p_password: settings.password,
    p_max_players: settings.maxPlayers,
    p_allow_spectators: settings.allowSpectators,
    p_enable_chat: settings.enableChat,
  });

  if (error || !data) return { error: error?.message ?? "Couldn't create room." };
  return { code: data };
}

export async function verifyRoomPassword(code: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("yakuza_verify_password", {
    p_code: code,
    p_password: password,
  });
  return !error && data === true;
}

export async function joinRoom(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_join_room", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function leaveRoom(roomId: string): Promise<void> {
  await supabase.rpc("yakuza_leave_room", { p_room_id: roomId });
}

export async function removePlayer(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("yakuza_remove_player", { p_room_id: roomId, p_player_id: playerId });
}

export async function transferHost(roomId: string, departingUserId: string): Promise<void> {
  await supabase.rpc("yakuza_transfer_host", {
    p_room_id: roomId,
    p_departing_user_id: departingUserId,
  });
}

export async function claimHost(roomId: string): Promise<void> {
  await supabase.rpc("yakuza_claim_host", { p_room_id: roomId });
}

export async function announceDisconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("yakuza_announce_disconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceReconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("yakuza_announce_reconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceLeftGame(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("yakuza_announce_left_game", { p_room_id: roomId, p_player_id: playerId });
}

export async function startGame(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_start_game", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function submitNightAction(
  roomId: string,
  targetPlayerId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_submit_night_action", {
    p_room_id: roomId,
    p_target_player_id: targetPlayerId,
  });
  return error ? { error: error.message } : {};
}

export async function resolveNight(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_resolve_night", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function startVoting(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_start_voting", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function submitVote(
  roomId: string,
  targetPlayerId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_submit_vote", {
    p_room_id: roomId,
    p_target_player_id: targetPlayerId,
  });
  return error ? { error: error.message } : {};
}

export async function resolveVote(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("yakuza_resolve_vote", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function expirePhase(roomId: string): Promise<void> {
  await supabase.rpc("yakuza_expire_phase", { p_room_id: roomId });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Tracks who currently has this room open (detects tab/browser close, not just
// explicit "Leave Table"). Presence key = userId, so multiple tabs from the same
// user correctly count as one online player.
export function subscribeToPresence(
  roomId: string,
  userId: string,
  onSync: (onlineUserIds: Set<string>) => void,
  onLeave: (userId: string) => void,
  onJoin: (userId: string) => void,
) {
  const channel = supabase.channel(`yakuza-room-presence-${roomId}`, {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      onSync(new Set(Object.keys(channel.presenceState())));
    })
    .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
      onLeave(key);
    })
    .on("presence", { event: "join" }, ({ key }: { key: string }) => {
      onJoin(key);
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

const LOG_HISTORY_LIMIT = 100;

function toLogEvent(row: { id: string; kind: string; text: string; created_at: string }): LogEvent {
  return { id: row.id, kind: row.kind, text: row.text, createdAt: row.created_at };
}

export async function fetchLogEvents(roomId: string): Promise<LogEvent[]> {
  const { data } = await supabase
    .from("yakuza_log_events")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(LOG_HISTORY_LIMIT);

  return (data ?? []).map(toLogEvent).reverse();
}

export function subscribeToLogEvents(roomId: string, onEvent: (event: LogEvent) => void) {
  const channel = supabase
    .channel(`yakuza-log-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "yakuza_log_events",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => onEvent(toLogEvent(payload.new as Parameters<typeof toLogEvent>[0])),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

const CHAT_HISTORY_LIMIT = 100;

function toChatMessage(row: {
  id: string;
  user_id: string | null;
  name: string;
  text: string;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    text: row.text,
    createdAt: row.created_at,
  };
}

export async function fetchChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("yakuza_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY_LIMIT);

  return (data ?? []).map(toChatMessage).reverse();
}

export function subscribeToChat(roomId: string, onMessage: (message: ChatMessage) => void) {
  const channel = supabase
    .channel(`yakuza-chat-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "yakuza_chat_messages",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => onMessage(toChatMessage(payload.new as Parameters<typeof toChatMessage>[0])),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function sendChatMessage(roomId: string, text: string): Promise<void> {
  await supabase.rpc("yakuza_send_chat_message", { p_room_id: roomId, p_text: text });
}
