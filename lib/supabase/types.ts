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
      codenames_cards: {
        Row: {
          created_at: string
          grid_position: number
          id: string
          revealed: boolean
          revealed_at: string | null
          revealed_by_player_id: string | null
          revealed_team: string | null
          room_id: string
          word: string
        }
        Insert: {
          created_at?: string
          grid_position: number
          id?: string
          revealed?: boolean
          revealed_at?: string | null
          revealed_by_player_id?: string | null
          revealed_team?: string | null
          room_id: string
          word: string
        }
        Update: {
          created_at?: string
          grid_position?: number
          id?: string
          revealed?: boolean
          revealed_at?: string | null
          revealed_by_player_id?: string | null
          revealed_team?: string | null
          room_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "codenames_cards_revealed_by_player_id_fkey"
            columns: ["revealed_by_player_id"]
            isOneToOne: false
            referencedRelation: "codenames_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codenames_cards_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "codenames_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      codenames_chat_messages: {
        Row: {
          created_at: string
          id: string
          name: string
          room_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codenames_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "codenames_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      codenames_key: {
        Row: {
          grid_position: number
          id: string
          room_id: string
          team: string
        }
        Insert: {
          grid_position: number
          id?: string
          room_id: string
          team: string
        }
        Update: {
          grid_position?: number
          id?: string
          room_id?: string
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "codenames_key_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "codenames_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      codenames_log_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          room_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          room_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "codenames_log_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "codenames_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      codenames_players: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          room_id: string
          sort_order: number
          team: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string
          room_id: string
          sort_order?: number
          team?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          room_id?: string
          sort_order?: number
          team?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codenames_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "codenames_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      codenames_rooms: {
        Row: {
          allow_spectators: boolean
          blue_remaining: number
          clue_given_at: string | null
          clue_number: number | null
          clue_unlimited: boolean
          clue_word: string | null
          code: string
          created_at: string
          enable_chat: boolean
          guesses_max: number | null
          guesses_used: number
          host_id: string | null
          id: string
          max_players: number
          name: string
          password_hash: string | null
          red_remaining: number
          response_deadline: string | null
          starting_team: string | null
          status: string
          turn_number: number
          turn_phase: string | null
          turn_team: string | null
          updated_at: string
          visibility: string
          winner_team: string | null
        }
        Insert: {
          allow_spectators?: boolean
          blue_remaining?: number
          clue_given_at?: string | null
          clue_number?: number | null
          clue_unlimited?: boolean
          clue_word?: string | null
          code: string
          created_at?: string
          enable_chat?: boolean
          guesses_max?: number | null
          guesses_used?: number
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          password_hash?: string | null
          red_remaining?: number
          response_deadline?: string | null
          starting_team?: string | null
          status?: string
          turn_number?: number
          turn_phase?: string | null
          turn_team?: string | null
          updated_at?: string
          visibility?: string
          winner_team?: string | null
        }
        Update: {
          allow_spectators?: boolean
          blue_remaining?: number
          clue_given_at?: string | null
          clue_number?: number | null
          clue_unlimited?: boolean
          clue_word?: string | null
          code?: string
          created_at?: string
          enable_chat?: boolean
          guesses_max?: number | null
          guesses_used?: number
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          password_hash?: string | null
          red_remaining?: number
          response_deadline?: string | null
          starting_team?: string | null
          status?: string
          turn_number?: number
          turn_phase?: string | null
          turn_team?: string | null
          updated_at?: string
          visibility?: string
          winner_team?: string | null
        }
        Relationships: []
      }
      codenames_word_bank: {
        Row: {
          word: string
        }
        Insert: {
          word: string
        }
        Update: {
          word?: string
        }
        Relationships: []
      }
      koup_cards: {
        Row: {
          character: string
          id: string
          player_id: string | null
          revealed: boolean
          room_id: string
        }
        Insert: {
          character: string
          id?: string
          player_id?: string | null
          revealed?: boolean
          room_id: string
        }
        Update: {
          character?: string
          id?: string
          player_id?: string | null
          revealed?: boolean
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "koup_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "koup_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "koup_cards_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "koup_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      koup_chat_messages: {
        Row: {
          created_at: string
          id: string
          name: string
          room_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "koup_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "koup_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      koup_log_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          room_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          room_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "koup_log_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "koup_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      koup_players: {
        Row: {
          coins: number
          created_at: string
          eliminated: boolean
          id: string
          influence_remaining: number
          name: string
          room_id: string
          sort_order: number
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          eliminated?: boolean
          id?: string
          influence_remaining?: number
          name: string
          room_id: string
          sort_order?: number
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          eliminated?: boolean
          id?: string
          influence_remaining?: number
          name?: string
          room_id?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "koup_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "koup_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      koup_rooms: {
        Row: {
          allow_spectators: boolean
          code: string
          created_at: string
          deck_count: number
          enable_chat: boolean
          host_id: string | null
          id: string
          max_players: number
          name: string
          password_hash: string | null
          pending_action: Json | null
          pending_block: Json | null
          pending_loss: Json | null
          phase: string
          response_deadline: string | null
          status: string
          turn_number: number
          turn_player_id: string | null
          updated_at: string
          visibility: string
          winner_player_id: string | null
        }
        Insert: {
          allow_spectators?: boolean
          code: string
          created_at?: string
          deck_count?: number
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          password_hash?: string | null
          pending_action?: Json | null
          pending_block?: Json | null
          pending_loss?: Json | null
          phase?: string
          response_deadline?: string | null
          status?: string
          turn_number?: number
          turn_player_id?: string | null
          updated_at?: string
          visibility?: string
          winner_player_id?: string | null
        }
        Update: {
          allow_spectators?: boolean
          code?: string
          created_at?: string
          deck_count?: number
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          password_hash?: string | null
          pending_action?: Json | null
          pending_block?: Json | null
          pending_loss?: Json | null
          phase?: string
          response_deadline?: string | null
          status?: string
          turn_number?: number
          turn_player_id?: string | null
          updated_at?: string
          visibility?: string
          winner_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "koup_rooms_turn_player_id_fkey"
            columns: ["turn_player_id"]
            isOneToOne: false
            referencedRelation: "koup_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "koup_rooms_winner_player_id_fkey"
            columns: ["winner_player_id"]
            isOneToOne: false
            referencedRelation: "koup_players"
            referencedColumns: ["id"]
          },
        ]
      }
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
      survey_showdown_answer_synonyms: {
        Row: {
          answer_id: string
          id: string
          phrase: string
        }
        Insert: {
          answer_id: string
          id?: string
          phrase: string
        }
        Update: {
          answer_id?: string
          id?: string
          phrase?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_answer_synonyms_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_answers"
            referencedColumns: ["id"]
          },
        ]
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
      survey_showdown_messages: {
        Row: {
          created_at: string
          id: string
          name: string
          room_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_rooms"
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
          points: number
          sort_order: number
          team_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          points?: number
          sort_order?: number
          team_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          points?: number
          sort_order?: number
          team_id?: string
          user_id?: string | null
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
          team1_strikes: number
          team2_strikes: number
        }
        Insert: {
          id?: string
          multiplier?: number
          question_id: string
          revealed_answer_ids?: string[]
          room_id: string
          round_number: number
          status?: string
          team1_strikes?: number
          team2_strikes?: number
        }
        Update: {
          id?: string
          multiplier?: number
          question_id?: string
          revealed_answer_ids?: string[]
          room_id?: string
          round_number?: number
          status?: string
          team1_strikes?: number
          team2_strikes?: number
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
          active_player_id: string | null
          active_team_slot: number
          allow_spectators: boolean
          code: string
          created_at: string
          display_mode: string
          enable_chat: boolean
          host_id: string | null
          id: string
          max_players: number
          name: string
          pack_id: string
          password_hash: string | null
          round_number: number
          status: string
          total_rounds: number
          turn_ends_at: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          active_player_id?: string | null
          active_team_slot?: number
          allow_spectators?: boolean
          code: string
          created_at?: string
          display_mode?: string
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          pack_id: string
          password_hash?: string | null
          round_number?: number
          status?: string
          total_rounds?: number
          turn_ends_at?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          active_player_id?: string | null
          active_team_slot?: number
          allow_spectators?: boolean
          code?: string
          created_at?: string
          display_mode?: string
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          pack_id?: string
          password_hash?: string | null
          round_number?: number
          status?: string
          total_rounds?: number
          turn_ends_at?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_showdown_rooms_active_player_id_fkey"
            columns: ["active_player_id"]
            isOneToOne: false
            referencedRelation: "survey_showdown_players"
            referencedColumns: ["id"]
          },
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
          turn_cursor: number
        }
        Insert: {
          id?: string
          name: string
          room_id: string
          score?: number
          slot: number
          turn_cursor?: number
        }
        Update: {
          id?: string
          name?: string
          room_id?: string
          score?: number
          slot?: number
          turn_cursor?: number
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
      yakuza_chat_messages: {
        Row: {
          created_at: string
          id: string
          name: string
          room_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_investigations: {
        Row: {
          created_at: string
          detective_player_id: string
          id: string
          result: string
          room_id: string
          round_number: number
          target_player_id: string
        }
        Insert: {
          created_at?: string
          detective_player_id: string
          id?: string
          result: string
          room_id: string
          round_number: number
          target_player_id: string
        }
        Update: {
          created_at?: string
          detective_player_id?: string
          id?: string
          result?: string
          room_id?: string
          round_number?: number
          target_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_investigations_detective_player_id_fkey"
            columns: ["detective_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_investigations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_investigations_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_log_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          room_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          room_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_log_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_night_actions: {
        Row: {
          actor_player_id: string | null
          id: string
          role: string
          room_id: string
          round_number: number
          target_player_id: string | null
          updated_at: string
        }
        Insert: {
          actor_player_id?: string | null
          id?: string
          role: string
          room_id: string
          round_number: number
          target_player_id?: string | null
          updated_at?: string
        }
        Update: {
          actor_player_id?: string | null
          id?: string
          role?: string
          room_id?: string
          round_number?: number
          target_player_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_night_actions_actor_player_id_fkey"
            columns: ["actor_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_night_actions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_night_actions_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_players: {
        Row: {
          alive: boolean
          created_at: string
          id: string
          name: string
          room_id: string
          sort_order: number
          user_id: string
        }
        Insert: {
          alive?: boolean
          created_at?: string
          id?: string
          name: string
          room_id: string
          sort_order?: number
          user_id: string
        }
        Update: {
          alive?: boolean
          created_at?: string
          id?: string
          name?: string
          room_id?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_roles: {
        Row: {
          created_at: string
          id: string
          player_id: string
          revealed: boolean
          role: string
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          revealed?: boolean
          role: string
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          revealed?: boolean
          role?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_roles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_roles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      yakuza_rooms: {
        Row: {
          allow_spectators: boolean
          code: string
          created_at: string
          enable_chat: boolean
          host_id: string | null
          id: string
          max_players: number
          name: string
          night_step: string | null
          password_hash: string | null
          phase: string | null
          phase_deadline: string | null
          round_number: number
          started_at: string | null
          status: string
          updated_at: string
          visibility: string
          winner: string | null
        }
        Insert: {
          allow_spectators?: boolean
          code: string
          created_at?: string
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          night_step?: string | null
          password_hash?: string | null
          phase?: string | null
          phase_deadline?: string | null
          round_number?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          visibility?: string
          winner?: string | null
        }
        Update: {
          allow_spectators?: boolean
          code?: string
          created_at?: string
          enable_chat?: boolean
          host_id?: string | null
          id?: string
          max_players?: number
          name?: string
          night_step?: string | null
          password_hash?: string | null
          phase?: string | null
          phase_deadline?: string | null
          round_number?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          visibility?: string
          winner?: string | null
        }
        Relationships: []
      }
      yakuza_votes: {
        Row: {
          created_at: string
          id: string
          room_id: string
          round_number: number
          target_player_id: string
          voter_player_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          round_number: number
          target_player_id: string
          voter_player_id: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          round_number?: number
          target_player_id?: string
          voter_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yakuza_votes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "yakuza_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_votes_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yakuza_votes_voter_player_id_fkey"
            columns: ["voter_player_id"]
            isOneToOne: false
            referencedRelation: "yakuza_players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      codenames_advance_turn: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      codenames_announce_disconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_announce_left_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      codenames_announce_reconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_become_operative: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      codenames_claim_host: { Args: { p_room_id: string }; Returns: undefined }
      codenames_claim_spymaster: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      codenames_create_room: {
        Args: {
          p_allow_spectators: boolean
          p_enable_chat: boolean
          p_max_players: number
          p_name: string
          p_password: string
          p_visibility: string
        }
        Returns: string
      }
      codenames_expire_turn: { Args: { p_room_id: string }; Returns: undefined }
      codenames_give_clue: {
        Args: {
          p_number: number
          p_room_id: string
          p_unlimited: boolean
          p_word: string
        }
        Returns: undefined
      }
      codenames_guess_card: {
        Args: { p_card_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_join_team: {
        Args: { p_room_id: string; p_team: string }
        Returns: undefined
      }
      codenames_leave_team: { Args: { p_room_id: string }; Returns: undefined }
      codenames_pass_turn: { Args: { p_room_id: string }; Returns: undefined }
      codenames_post_log_event: {
        Args: { p_kind: string; p_room_id: string; p_text: string }
        Returns: undefined
      }
      codenames_reassign_or_delete_room: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_remove_player: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_send_chat_message: {
        Args: { p_room_id: string; p_text: string }
        Returns: undefined
      }
      codenames_start_game: { Args: { p_room_id: string }; Returns: undefined }
      codenames_transfer_host: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      codenames_verify_password: {
        Args: { p_code: string; p_password: string }
        Returns: boolean
      }
      koup_advance_turn: { Args: { p_room_id: string }; Returns: undefined }
      koup_announce_disconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_announce_left_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      koup_announce_reconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_apply_exchange_selection: {
        Args: {
          p_actor_player_id: string
          p_keep_card_ids: string[]
          p_room_id: string
        }
        Returns: undefined
      }
      koup_apply_influence_loss: {
        Args: { p_card_id: string; p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_block_action: {
        Args: { p_claimed_character: string; p_room_id: string }
        Returns: undefined
      }
      koup_challenge_action: { Args: { p_room_id: string }; Returns: undefined }
      koup_challenge_block: { Args: { p_room_id: string }; Returns: undefined }
      koup_character_label: { Args: { p_character: string }; Returns: string }
      koup_choose_influence: {
        Args: { p_card_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_claim_host: { Args: { p_room_id: string }; Returns: undefined }
      koup_create_room: {
        Args: {
          p_allow_spectators: boolean
          p_enable_chat: boolean
          p_max_players: number
          p_name: string
          p_password: string
          p_visibility: string
        }
        Returns: string
      }
      koup_declare_action: {
        Args: {
          p_action: string
          p_room_id: string
          p_target_player_id?: string
        }
        Returns: undefined
      }
      koup_do_declare_action: {
        Args: {
          p_action: string
          p_actor_id: string
          p_room_id: string
          p_target_player_id: string
        }
        Returns: undefined
      }
      koup_expire_response: { Args: { p_room_id: string }; Returns: undefined }
      koup_fail_pending_action: {
        Args: { p_log_text: string; p_room_id: string }
        Returns: undefined
      }
      koup_join_room: { Args: { p_room_id: string }; Returns: undefined }
      koup_leave_room: { Args: { p_room_id: string }; Returns: undefined }
      koup_post_log_event: {
        Args: { p_kind: string; p_room_id: string; p_text: string }
        Returns: undefined
      }
      koup_reassign_or_delete_room: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_remove_player: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_resolve_exchange: {
        Args: { p_keep_card_ids: string[]; p_room_id: string }
        Returns: undefined
      }
      koup_send_chat_message: {
        Args: { p_room_id: string; p_text: string }
        Returns: undefined
      }
      koup_start_game: { Args: { p_room_id: string }; Returns: undefined }
      koup_succeed_pending_action: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      koup_transfer_host: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      koup_verify_password: {
        Args: { p_code: string; p_password: string }
        Returns: boolean
      }
      survey_showdown_advance_round: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_advance_turn: {
        Args: { p_correct: boolean; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_announce_disconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_announce_left_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_announce_reconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_begin_round: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_change_pack: {
        Args: { p_pack_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_claim_host: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_create_room: {
        Args: {
          p_allow_spectators: boolean
          p_enable_chat: boolean
          p_max_players: number
          p_name: string
          p_password: string
          p_visibility: string
        }
        Returns: string
      }
      survey_showdown_end_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_expire_turn: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_join_team: {
        Args: { p_room_id: string; p_slot: number }
        Returns: undefined
      }
      survey_showdown_leave_team: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_normalize: { Args: { p_text: string }; Returns: string }
      survey_showdown_post_countdown_tick: {
        Args: { p_room_id: string; p_seconds_left: number }
        Returns: undefined
      }
      survey_showdown_post_system_message: {
        Args: { p_room_id: string; p_text: string }
        Returns: undefined
      }
      survey_showdown_reassign_or_delete_room: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_register_miss: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_remove_player: {
        Args: { p_player_id: string; p_room_id: string }
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
      survey_showdown_reveal_all_answers: {
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
      survey_showdown_send_chat_message: {
        Args: { p_room_id: string; p_text: string }
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
      survey_showdown_start_game: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      survey_showdown_submit_answer: {
        Args: { p_room_id: string; p_text: string }
        Returns: Json
      }
      survey_showdown_transfer_host: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      survey_showdown_verify_password: {
        Args: { p_code: string; p_password: string }
        Returns: boolean
      }
      yakuza_announce_disconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_announce_left_game: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_announce_reconnect: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_check_and_apply_winner: {
        Args: { p_room_id: string }
        Returns: boolean
      }
      yakuza_claim_host: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_create_room: {
        Args: {
          p_allow_spectators: boolean
          p_enable_chat: boolean
          p_max_players: number
          p_name: string
          p_password: string
          p_visibility: string
        }
        Returns: string
      }
      yakuza_do_resolve_night: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      yakuza_do_resolve_vote: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      yakuza_do_start_voting: {
        Args: { p_room_id: string }
        Returns: undefined
      }
      yakuza_expire_phase: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_is_mafia_teammate: {
        Args: { p_room_id: string }
        Returns: boolean
      }
      yakuza_join_room: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_leave_room: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_post_log_event: {
        Args: { p_kind: string; p_room_id: string; p_text: string }
        Returns: undefined
      }
      yakuza_reassign_or_delete_room: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_remove_player: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_resolve_night: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_resolve_vote: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_send_chat_message: {
        Args: { p_room_id: string; p_text: string }
        Returns: undefined
      }
      yakuza_start_game: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_start_voting: { Args: { p_room_id: string }; Returns: undefined }
      yakuza_submit_night_action: {
        Args: { p_room_id: string; p_target_player_id: string }
        Returns: undefined
      }
      yakuza_submit_vote: {
        Args: { p_room_id: string; p_target_player_id: string }
        Returns: undefined
      }
      yakuza_transfer_host: {
        Args: { p_departing_user_id: string; p_room_id: string }
        Returns: undefined
      }
      yakuza_verify_password: {
        Args: { p_code: string; p_password: string }
        Returns: boolean
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
