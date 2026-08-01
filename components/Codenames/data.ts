import { createClient } from "@/lib/supabase/client";
import type {
  CardInfo,
  ChatMessage,
  CreateRoomSettings,
  KeyEntry,
  LogEvent,
  Player,
  RoomState,
  Team,
} from "@/components/Codenames/types";

const supabase = createClient();

const ROOM_COLUMNS =
  "id, code, name, status, visibility, password_hash, max_players, allow_spectators, enable_chat, host_id, turn_team, turn_phase, starting_team, clue_word, clue_number, clue_unlimited, clue_given_at, guesses_used, guesses_max, response_deadline, turn_number, red_remaining, blue_remaining, winner_team";

export async function fetchRoomState(code: string): Promise<RoomState | null> {
  const { data: room, error: roomError } = await supabase
    .from("codenames_rooms")
    .select(ROOM_COLUMNS)
    .eq("code", code)
    .maybeSingle();

  if (roomError || !room) return null;

  const [{ data: playerRows }, { data: cardRows }, { data: keyRows }] = await Promise.all([
    supabase.from("codenames_players").select("*").eq("room_id", room.id).order("sort_order"),
    supabase.from("codenames_cards").select("*").eq("room_id", room.id).order("grid_position"),
    // RLS hides this entirely for non-spymasters — comes back empty, not an error.
    supabase.from("codenames_key").select("grid_position, team").eq("room_id", room.id),
  ]);

  const players: Player[] = (playerRows ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    sortOrder: p.sort_order,
    team: p.team as Team | null,
    role: p.role as Player["role"],
  }));

  const cards: CardInfo[] = (cardRows ?? []).map((c) => ({
    id: c.id,
    word: c.word,
    position: c.grid_position,
    revealed: c.revealed,
    revealedTeam: c.revealed_team as CardInfo["revealedTeam"],
    revealedByPlayerId: c.revealed_by_player_id,
  }));

  const key: KeyEntry[] = (keyRows ?? []).map((k) => ({
    position: k.grid_position,
    team: k.team as KeyEntry["team"],
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
    turnTeam: room.turn_team as Team | null,
    turnPhase: room.turn_phase as RoomState["turnPhase"],
    startingTeam: room.starting_team as Team | null,
    clueWord: room.clue_word,
    clueNumber: room.clue_number,
    clueUnlimited: room.clue_unlimited,
    clueGivenAt: room.clue_given_at,
    guessesUsed: room.guesses_used,
    guessesMax: room.guesses_max,
    responseDeadline: room.response_deadline,
    turnNumber: room.turn_number,
    redRemaining: room.red_remaining,
    blueRemaining: room.blue_remaining,
    winnerTeam: room.winner_team as Team | null,
    players,
    cards,
    key,
  };
}

export function subscribeToLobbyRooms(onChange: () => void) {
  const channel = supabase
    .channel("codenames-lobby")
    .on("postgres_changes", { event: "*", schema: "public", table: "codenames_rooms" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "codenames_players" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoom(roomId: string, onChange: () => void) {
  const channel = supabase
    .channel(`codenames-room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codenames_rooms", filter: `id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codenames_players", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codenames_cards", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codenames_key", filter: `room_id=eq.${roomId}` },
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
  const { data, error } = await supabase.rpc("codenames_create_room", {
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
  const { data, error } = await supabase.rpc("codenames_verify_password", {
    p_code: code,
    p_password: password,
  });
  return !error && data === true;
}

export async function joinTeam(roomId: string, team: Team): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("codenames_join_team", { p_room_id: roomId, p_team: team });
  return error ? { error: error.message } : {};
}

export async function leaveTeam(roomId: string): Promise<void> {
  await supabase.rpc("codenames_leave_team", { p_room_id: roomId });
}

export async function removePlayer(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("codenames_remove_player", { p_room_id: roomId, p_player_id: playerId });
}

export async function transferHost(roomId: string, departingUserId: string): Promise<void> {
  await supabase.rpc("codenames_transfer_host", {
    p_room_id: roomId,
    p_departing_user_id: departingUserId,
  });
}

export async function claimHost(roomId: string): Promise<void> {
  await supabase.rpc("codenames_claim_host", { p_room_id: roomId });
}

export async function claimSpymaster(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("codenames_claim_spymaster", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function becomeOperative(roomId: string): Promise<void> {
  await supabase.rpc("codenames_become_operative", { p_room_id: roomId });
}

export async function announceDisconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("codenames_announce_disconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceReconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("codenames_announce_reconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceLeftGame(roomId: string): Promise<void> {
  await supabase.rpc("codenames_announce_left_game", { p_room_id: roomId });
}

export async function startGame(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("codenames_start_game", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function giveClue(
  roomId: string,
  word: string,
  number: number,
  unlimited: boolean,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("codenames_give_clue", {
    p_room_id: roomId,
    p_word: word,
    p_number: number,
    p_unlimited: unlimited,
  });
  return error ? { error: error.message } : {};
}

export async function guessCard(roomId: string, cardId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("codenames_guess_card", {
    p_room_id: roomId,
    p_card_id: cardId,
  });
  return error ? { error: error.message } : {};
}

export async function passTurn(roomId: string): Promise<void> {
  await supabase.rpc("codenames_pass_turn", { p_room_id: roomId });
}

export async function expireTurn(roomId: string): Promise<void> {
  await supabase.rpc("codenames_expire_turn", { p_room_id: roomId });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Tracks who currently has this room open (detects tab/browser close, not just
// explicit "Leave Room"). Presence key = userId, so multiple tabs from the same
// user correctly count as one online player.
export function subscribeToPresence(
  roomId: string,
  userId: string,
  onSync: (onlineUserIds: Set<string>) => void,
  onLeave: (userId: string) => void,
  onJoin: (userId: string) => void,
) {
  const channel = supabase.channel(`codenames-room-presence-${roomId}`, {
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

const LOG_HISTORY_LIMIT = 200;

function toLogEvent(row: { id: string; kind: string; text: string; created_at: string }): LogEvent {
  return { id: row.id, kind: row.kind, text: row.text, createdAt: row.created_at };
}

export async function fetchLogEvents(roomId: string): Promise<LogEvent[]> {
  const { data } = await supabase
    .from("codenames_log_events")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(LOG_HISTORY_LIMIT);

  return (data ?? []).map(toLogEvent).reverse();
}

export function subscribeToLogEvents(roomId: string, onEvent: (event: LogEvent) => void) {
  const channel = supabase
    .channel(`codenames-log-${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "codenames_log_events", filter: `room_id=eq.${roomId}` },
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
  return { id: row.id, userId: row.user_id, name: row.name, text: row.text, createdAt: row.created_at };
}

export async function fetchChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("codenames_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY_LIMIT);

  return (data ?? []).map(toChatMessage).reverse();
}

export function subscribeToChat(roomId: string, onMessage: (message: ChatMessage) => void) {
  const channel = supabase
    .channel(`codenames-chat-${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "codenames_chat_messages", filter: `room_id=eq.${roomId}` },
      (payload) => onMessage(toChatMessage(payload.new as Parameters<typeof toChatMessage>[0])),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function sendChatMessage(roomId: string, text: string): Promise<void> {
  await supabase.rpc("codenames_send_chat_message", { p_room_id: roomId, p_text: text });
}
