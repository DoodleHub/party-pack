import { createClient } from "@/lib/supabase/client";
import type {
  ChatMessage,
  CreateRoomSettings,
  RoomState,
} from "@/components/SurveyShowdown/types";

const supabase = createClient();

const ROOM_COLUMNS =
  "id, code, name, status, visibility, password_hash, max_players, allow_spectators, enable_chat, host_id, round_number, total_rounds, active_team_slot, active_player_id, turn_ends_at";

export async function fetchRoomState(code: string): Promise<RoomState | null> {
  const { data: room, error: roomError } = await supabase
    .from("survey_showdown_rooms")
    .select(ROOM_COLUMNS)
    .eq("code", code)
    .maybeSingle();

  if (roomError || !room) return null;

  const [{ data: teams }, { data: rounds }] = await Promise.all([
    supabase
      .from("survey_showdown_teams")
      .select("*, players:survey_showdown_players(*)")
      .eq("room_id", room.id)
      .order("slot")
      .order("sort_order", { referencedTable: "players" }),
    supabase
      .from("survey_showdown_room_rounds")
      .select("*, questions:survey_showdown_questions(prompt)")
      .eq("room_id", room.id)
      .order("round_number"),
  ]);

  const currentRound = rounds?.find((r) => r.status === "current") ?? null;

  let currentAnswers: RoomState["currentAnswers"] = [];
  if (currentRound) {
    const { data: answers } = await supabase
      .from("survey_showdown_answers")
      .select("*")
      .eq("question_id", currentRound.question_id)
      .order("rank");

    const revealedIds = new Set(currentRound.revealed_answer_ids);
    currentAnswers = (answers ?? []).map((a) => ({
      id: a.id,
      text: a.text,
      points: a.points * currentRound.multiplier,
      rank: a.rank,
      revealed: revealedIds.has(a.id),
    }));
  }

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
    roundNumber: room.round_number,
    totalRounds: room.total_rounds,
    activeTeamSlot: room.active_team_slot as 1 | 2,
    activePlayerId: room.active_player_id,
    turnEndsAt: room.turn_ends_at,
    teams: (teams ?? [])
      .map((t) => ({
        id: t.id,
        name: t.name,
        slot: t.slot as 1 | 2,
        score: t.score,
        strikes:
          t.slot === 1 ? (currentRound?.team1_strikes ?? 0) : (currentRound?.team2_strikes ?? 0),
        players: (t.players ?? []).map((p) => ({ id: p.id, name: p.name, userId: p.user_id })),
      }))
      .sort((a, b) => a.slot - b.slot),
    currentPrompt: currentRound
      ? ((currentRound.questions as { prompt: string } | null)?.prompt ?? null)
      : null,
    currentAnswers,
  };
}

export function subscribeToLobbyRooms(onChange: () => void) {
  const channel = supabase
    .channel("survey-showdown-lobby")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "survey_showdown_rooms" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "survey_showdown_players" },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoom(roomId: string, onChange: () => void) {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "survey_showdown_rooms", filter: `id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "survey_showdown_teams", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "survey_showdown_players" },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "survey_showdown_room_rounds",
        filter: `room_id=eq.${roomId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const advanceRound = (roomId: string) =>
  supabase.rpc("survey_showdown_advance_round", { p_room_id: roomId });

export interface SubmitAnswerResult {
  correct: boolean;
  timedOut?: boolean;
  answerId?: string;
  text?: string;
  points?: number;
}

export async function submitAnswer(
  roomId: string,
  text: string,
): Promise<SubmitAnswerResult | { error: string }> {
  const { data, error } = await supabase.rpc("survey_showdown_submit_answer", {
    p_room_id: roomId,
    p_text: text,
  });
  if (error) return { error: error.message };
  return data as unknown as SubmitAnswerResult;
}

export const expireTurn = (roomId: string) =>
  supabase.rpc("survey_showdown_expire_turn", { p_room_id: roomId });

export async function revealAllAnswers(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("survey_showdown_reveal_all_answers", {
    p_room_id: roomId,
  });
  return error ? { error: error.message } : {};
}

export async function createRoom(
  settings: CreateRoomSettings,
): Promise<{ code: string } | { error: string }> {
  const { data, error } = await supabase.rpc("survey_showdown_create_room", {
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
  const { data, error } = await supabase.rpc("survey_showdown_verify_password", {
    p_code: code,
    p_password: password,
  });
  return !error && data === true;
}

export async function joinTeam(roomId: string, slot: 1 | 2): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("survey_showdown_join_team", {
    p_room_id: roomId,
    p_slot: slot,
  });
  return error ? { error: error.message } : {};
}

export async function leaveTeam(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("survey_showdown_leave_team", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export async function removePlayer(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("survey_showdown_remove_player", {
    p_room_id: roomId,
    p_player_id: playerId,
  });
}

// Hands host duties to another seated player. Unlike leaveTeam/removePlayer,
// this doesn't touch the departing user's seat — it only matters for
// in-progress games, where a disconnected/departed host's seat stays put but
// host-only controls (reveal, advance, start) need someone else to hold them.
export async function transferHost(roomId: string, departingUserId: string): Promise<void> {
  await supabase.rpc("survey_showdown_transfer_host", {
    p_room_id: roomId,
    p_departing_user_id: departingUserId,
  });
}

// Claims host for the calling (seated) player of an in-progress game. Used
// when everyone — including the host — has disconnected, leaving host_id
// pointing at nobody: the first player to reconnect becomes host.
export async function claimHost(roomId: string): Promise<void> {
  await supabase.rpc("survey_showdown_claim_host", { p_room_id: roomId });
}

// Tracks who currently has this room open (detects tab/browser close, not just
// explicit "Leave Team"). Presence key = userId, so multiple tabs from the same
// user correctly count as one online player.
export function subscribeToPresence(
  roomId: string,
  userId: string,
  onSync: (onlineUserIds: Set<string>) => void,
  onLeave: (userId: string) => void,
  onJoin: (userId: string) => void,
) {
  const channel = supabase.channel(`room-presence-${roomId}`, {
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

export async function startGame(roomId: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("survey_showdown_start_game", { p_room_id: roomId });
  return error ? { error: error.message } : {};
}

export const postCountdownTick = (roomId: string, secondsLeft: number) =>
  supabase.rpc("survey_showdown_post_countdown_tick", {
    p_room_id: roomId,
    p_seconds_left: secondsLeft,
  });

// These must actually await the RPC (not just return the builder): postgrest-js
// only sends the underlying fetch once the builder is awaited/`.then()`'d, and
// every call site below fires these fire-and-forget without consuming the
// result themselves.
export async function announceDisconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("survey_showdown_announce_disconnect", {
    p_room_id: roomId,
    p_player_id: playerId,
  });
}

export async function announceReconnect(roomId: string, playerId: string): Promise<void> {
  await supabase.rpc("survey_showdown_announce_reconnect", {
    p_room_id: roomId,
    p_player_id: playerId,
  });
}

export async function announceLeftGame(roomId: string): Promise<void> {
  await supabase.rpc("survey_showdown_announce_left_game", { p_room_id: roomId });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
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
    .from("survey_showdown_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY_LIMIT);

  return (data ?? []).map(toChatMessage).reverse();
}

export function subscribeToChat(roomId: string, onMessage: (message: ChatMessage) => void) {
  const channel = supabase
    .channel(`room-chat-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "survey_showdown_messages",
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
  await supabase.rpc("survey_showdown_send_chat_message", { p_room_id: roomId, p_text: text });
}
