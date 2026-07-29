export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      survey_showdown_answers: {
        Row: {
          created_at: string
          id: string
          points: number
          question_id: string
          rank: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          question_id: string
          rank: number
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          question_id?: string
          rank?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_showdown_packs: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      survey_showdown_players: {
        Row: {
          id: string
          name: string
          sort_order: number
          team_id: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          team_id: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_showdown_questions: {
        Row: {
          created_at: string
          id: string
          pack_id: string
          prompt: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          pack_id: string
          prompt: string
          sort_order: number
        }
        Update: {
          created_at?: string
          id?: string
          pack_id?: string
          prompt?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_questions_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_showdown_room_rounds: {
        Row: {
          id: string
          multiplier: number
          question_id: string
          revealed_answer_ids: string[]
          room_id: string
          round_number: number
          status: string
        }
        Insert: {
          id?: string
          multiplier?: number
          question_id: string
          revealed_answer_ids?: string[]
          room_id: string
          round_number: number
          status?: string
        }
        Update: {
          id?: string
          multiplier?: number
          question_id?: string
          revealed_answer_ids?: string[]
          room_id?: string
          round_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_room_rounds_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_showdown_room_rounds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_showdown_rooms: {
        Row: {
          active_team_slot: number
          code: string
          created_at: string
          display_mode: string
          id: string
          pack_id: string
          round_number: number
          status: string
          total_rounds: number
          updated_at: string
        }
        Insert: {
          active_team_slot?: number
          code: string
          created_at?: string
          display_mode?: string
          id?: string
          pack_id: string
          round_number?: number
          status?: string
          total_rounds?: number
          updated_at?: string
        }
        Update: {
          active_team_slot?: number
          code?: string
          created_at?: string
          display_mode?: string
          id?: string
          pack_id?: string
          round_number?: number
          status?: string
          total_rounds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_rooms_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_showdown_teams: {
        Row: {
          id: string
          name: string
          room_id: string
          score: number
          slot: number
        }
        Insert: {
          id?: string
          name: string
          room_id: string
          score?: number
          slot: number
        }
        Update: {
          id?: string
          name?: string
          room_id?: string
          score?: number
          slot?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_teams_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      survey_showdown_advance_round: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_change_pack: {
        Args: { p_pack_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_end_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_reset_scores: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_restart_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_reveal_next_answer: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_reveal_specific_answer: {
        Args: { p_answer_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_set_active_team: {
        Args: { p_room_id: string; p_slot: number }
        Returns: undefined
      }
      survey_showdown_set_display_mode: {
        Args: { p_mode: string; p_room_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
