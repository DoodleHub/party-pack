import { createClient } from "@/lib/supabase/client";
import type { RoomState } from "@/components/SurveyShowdown/types";

const supabase = createClient();

export async function fetchRoomState(code: string): Promise<RoomState | null> {
  const { data: room, error: roomError } = await supabase
    .from("survey_showdown_rooms")
    .select("*")
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
      points: a.points,
      rank: a.rank,
      revealed: revealedIds.has(a.id),
    }));
  }

  return {
    roomId: room.id,
    code: room.code,
    roundNumber: room.round_number,
    totalRounds: room.total_rounds,
    activeTeamSlot: room.active_team_slot as 1 | 2,
    teams: (teams ?? [])
      .map((t) => ({
        id: t.id,
        name: t.name,
        slot: t.slot as 1 | 2,
        score: t.score,
        players: (t.players ?? []).map((p) => ({ id: p.id, name: p.name })),
      }))
      .sort((a, b) => a.slot - b.slot),
    currentPrompt: currentRound
      ? ((currentRound.questions as { prompt: string } | null)?.prompt ?? null)
      : null,
    currentAnswers,
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

export const revealNextAnswer = (roomId: string) =>
  supabase.rpc("survey_showdown_reveal_next_answer", { p_room_id: roomId });

export const revealSpecificAnswer = (roomId: string, answerId: string) =>
  supabase.rpc("survey_showdown_reveal_specific_answer", {
    p_room_id: roomId,
    p_answer_id: answerId,
  });

export const advanceRound = (roomId: string) =>
  supabase.rpc("survey_showdown_advance_round", { p_room_id: roomId });

export const setActiveTeam = (roomId: string, slot: 1 | 2) =>
  supabase.rpc("survey_showdown_set_active_team", { p_room_id: roomId, p_slot: slot });
