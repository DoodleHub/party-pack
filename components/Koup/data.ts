import { createClient } from "@/lib/supabase/client";
import type {
  ActionType,
  ChatMessage,
  Character,
  CreateRoomSettings,
  LogEvent,
  Phase,
  Player,
  RoomState,
} from "@/components/Koup/types";

const supabase = createClient();

const ROOM_COLUMNS =
  "id, code, name, status, visibility, password_hash, max_players, allow_spectators, enable_chat, host_id, turn_player_id, turn_number, deck_count, phase, pending_action, pending_block, pending_loss, response_deadline, winner_player_id";

export async function fetchRoomState(code: string): Promise<RoomState | null> {
  const { data: room, error: roomError } = await supabase
    .from("koup_rooms")
    .select(ROOM_COLUMNS)
    .eq("code", code)
    .maybeSingle();

  if (roomError || !room) return null;

  const { data: user } = await supabase.auth.getUser();
  const myUserId = user.user?.id ?? null;

  const [{ data: playerRows }, { data: cardRows }] = await Promise.all([
    supabase.from("koup_players").select("*").eq("room_id", room.id).order("sort_order"),
    supabase.from("koup_cards").select("*").eq("room_id", room.id),
  ]);

  const cards = cardRows ?? [];
  const myPlayerId = (playerRows ?? []).find((p) => p.user_id === myUserId)?.id ?? null;

  const players: Player[] = (playerRows ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    sortOrder: p.sort_order,
    coins: p.coins,
    influenceRemaining: p.influence_remaining,
    eliminated: p.eliminated,
    revealedCards: cards
      .filter((c) => c.player_id === p.id && c.revealed)
      .map((c) => c.character as Character),
  }));

  const myHand = cards
    .filter((c) => c.player_id === myPlayerId && !c.revealed)
    .map((c) => ({ id: c.id, character: c.character as Character }));

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
    turnPlayerId: room.turn_player_id,
    turnNumber: room.turn_number,
    deckCount: room.deck_count,
    phase: room.phase as Phase,
    pendingAction: room.pending_action
      ? {
          type: (room.pending_action as Record<string, unknown>).type as ActionType,
          actorPlayerId: (room.pending_action as Record<string, unknown>)
            .actor_player_id as string,
          targetPlayerId:
            ((room.pending_action as Record<string, unknown>).target_player_id as string) ??
            null,
          claimedCharacter:
            ((room.pending_action as Record<string, unknown>).claimed_character as Character) ??
            null,
        }
      : null,
    pendingBlock: room.pending_block
      ? {
          blockerPlayerId: (room.pending_block as Record<string, unknown>)
            .blocker_player_id as string,
          claimedCharacter: (room.pending_block as Record<string, unknown>)
            .claimed_character as Character,
        }
      : null,
    pendingLoss: room.pending_loss
      ? {
          playerId: (room.pending_loss as Record<string, unknown>).player_id as string,
          reason: (room.pending_loss as Record<string, unknown>).reason as never,
        }
      : null,
    responseDeadline: room.response_deadline,
    winnerPlayerId: room.winner_player_id,
    players,
    myHand,
  };
}

export function subscribeToLobbyRooms(onChange: () => void) {
  const channel = supabase
    .channel("koup-lobby")
    .on("postgres_changes", { event: "*", schema: "public", table: "koup_rooms" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "koup_players" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoom(roomId: string, onChange: () => void) {
  const channel = supabase
    .channel(`koup-room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "koup_rooms", filter: `id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "koup_players", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "koup_cards", filter: `room_id=eq.${roomId}` },
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
  const { data, error } = await supabase.rpc("koup_create_room", {
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
  const { data, error } = await supabase.rpc("koup_verify_password", {
    p_code: code,
    p_password: password,
  });
  return !error && data === true;
}

export async function joinRoom(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("koup_join_room", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function leaveRoom(roomId: string): Promise<void> {
  await supabase.rpc("koup_leave_room", { p_room_id: roomId });
}

export async function removePlayer(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("koup_remove_player", { p_room_id: roomId, p_player_id: playerId });
}

export async function transferHost(roomId: string, departingUserId: string): Promise<void> {
  await supabase.rpc("koup_transfer_host", {
    p_room_id: roomId,
    p_departing_user_id: departingUserId,
  });
}

export async function claimHost(roomId: string): Promise<void> {
  await supabase.rpc("koup_claim_host", { p_room_id: roomId });
}

export async function announceDisconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("koup_announce_disconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceReconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("koup_announce_reconnect", { p_room_id: roomId, p_player_id: playerId });
}

export async function announceLeftGame(roomId: string): Promise<void> {
  await supabase.rpc("koup_announce_left_game", { p_room_id: roomId });
}

export async function startGame(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("koup_start_game", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function declareAction(
  roomId: string,
  action: ActionType,
  targetPlayerId?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("koup_declare_action", {
    p_room_id: roomId,
    p_action: action,
    p_target_player_id: targetPlayerId ?? undefined,
  });
  return error ? { error: error.message } : {};
}

export async function challengeAction(roomId: string): Promise<void> {
  await supabase.rpc("koup_challenge_action", { p_room_id: roomId });
}

export async function blockAction(roomId: string, claimedCharacter: Character): Promise<void> {
  await supabase.rpc("koup_block_action", {
    p_room_id: roomId,
    p_claimed_character: claimedCharacter,
  });
}

export async function challengeBlock(roomId: string): Promise<void> {
  await supabase.rpc("koup_challenge_block", { p_room_id: roomId });
}

export async function chooseInfluence(roomId: string, cardId: string): Promise<void> {
  await supabase.rpc("koup_choose_influence", { p_room_id: roomId, p_card_id: cardId });
}

export async function resolveExchange(roomId: string, keepCardIds: string[]): Promise<void> {
  await supabase.rpc("koup_resolve_exchange", {
    p_room_id: roomId,
    p_keep_card_ids: keepCardIds,
  });
}

export async function expireResponse(roomId: string): Promise<void> {
  await supabase.rpc("koup_expire_response", { p_room_id: roomId });
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
  const channel = supabase.channel(`koup-room-presence-${roomId}`, {
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
    .from("koup_log_events")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(LOG_HISTORY_LIMIT);

  return (data ?? []).map(toLogEvent).reverse();
}

export function subscribeToLogEvents(roomId: string, onEvent: (event: LogEvent) => void) {
  const channel = supabase
    .channel(`koup-log-${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "koup_log_events", filter: `room_id=eq.${roomId}` },
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
    .from("koup_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY_LIMIT);

  return (data ?? []).map(toChatMessage).reverse();
}

export function subscribeToChat(roomId: string, onMessage: (message: ChatMessage) => void) {
  const channel = supabase
    .channel(`koup-chat-${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "koup_chat_messages", filter: `room_id=eq.${roomId}` },
      (payload) => onMessage(toChatMessage(payload.new as Parameters<typeof toChatMessage>[0])),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function sendChatMessage(roomId: string, text: string): Promise<void> {
  await supabase.rpc("koup_send_chat_message", { p_room_id: roomId, p_text: text });
}
