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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          properties: Json | null
          session_id: string | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_progress: {
        Row: {
          created_at: string | null
          guest_session_id: string
          level_completed: number | null
          migrated_to_user_id: string | null
          puzzle_attempts_json: Json | null
          temp_id: string
        }
        Insert: {
          created_at?: string | null
          guest_session_id: string
          level_completed?: number | null
          migrated_to_user_id?: string | null
          puzzle_attempts_json?: Json | null
          temp_id?: string
        }
        Update: {
          created_at?: string | null
          guest_session_id?: string
          level_completed?: number | null
          migrated_to_user_id?: string | null
          puzzle_attempts_json?: Json | null
          temp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_progress_migrated_to_user_id_fkey"
            columns: ["migrated_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hypotheses: {
        Row: {
          cost_of_delay_score: number | null
          created_at: string | null
          evidence: string | null
          id: string
          statement: string
          status: string
          test_type: string | null
          wsjf_score: number | null
        }
        Insert: {
          cost_of_delay_score?: number | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          statement: string
          status?: string
          test_type?: string | null
          wsjf_score?: number | null
        }
        Update: {
          cost_of_delay_score?: number | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          statement?: string
          status?: string
          test_type?: string | null
          wsjf_score?: number | null
        }
        Relationships: []
      }
      persona_feedback: {
        Row: {
          actionability_score: number | null
          credibility_score: number | null
          id: string
          persona_id: string | null
          product_item_id: string | null
          qualitative_feedback: string | null
          recorded_at: string | null
          relevance_score: number | null
        }
        Insert: {
          actionability_score?: number | null
          credibility_score?: number | null
          id?: string
          persona_id?: string | null
          product_item_id?: string | null
          qualitative_feedback?: string | null
          recorded_at?: string | null
          relevance_score?: number | null
        }
        Update: {
          actionability_score?: number | null
          credibility_score?: number | null
          id?: string
          persona_id?: string | null
          product_item_id?: string | null
          qualitative_feedback?: string | null
          recorded_at?: string | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_feedback_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_feedback_product_item_id_fkey"
            columns: ["product_item_id"]
            isOneToOne: false
            referencedRelation: "product_items"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          anxieties: string[] | null
          archetype: string
          content_preferences: Json | null
          created_at: string | null
          id: string
          name: string
          persona_type: string
          primary_jobs: Json | null
          seniority_level: string
        }
        Insert: {
          anxieties?: string[] | null
          archetype: string
          content_preferences?: Json | null
          created_at?: string | null
          id?: string
          name: string
          persona_type: string
          primary_jobs?: Json | null
          seniority_level: string
        }
        Update: {
          anxieties?: string[] | null
          archetype?: string
          content_preferences?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          persona_type?: string
          primary_jobs?: Json | null
          seniority_level?: string
        }
        Relationships: []
      }
      product_items: {
        Row: {
          created_at: string | null
          description: string | null
          hypothesis_id: string | null
          id: string
          item_type: string
          owner_agent: string | null
          persona_tested: string[] | null
          shipped_at: string | null
          sprint: string | null
          status: string
          title: string
          wsjf_score: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hypothesis_id?: string | null
          id?: string
          item_type: string
          owner_agent?: string | null
          persona_tested?: string[] | null
          shipped_at?: string | null
          sprint?: string | null
          status?: string
          title: string
          wsjf_score?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hypothesis_id?: string | null
          id?: string
          item_type?: string
          owner_agent?: string | null
          persona_tested?: string[] | null
          shipped_at?: string | null
          sprint?: string | null
          status?: string
          title?: string
          wsjf_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_items_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "hypotheses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          google_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          google_id?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          google_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          current_level: number | null
          id: string
          level_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_level?: number | null
          id?: string
          level_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_level?: number | null
          id?: string
          level_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_attempts: {
        Row: {
          completed: boolean | null
          hints_used: number | null
          id: string
          level: number
          mistakes: number | null
          puzzle_id: string
          solve_time_seconds: number | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          hints_used?: number | null
          id?: string
          level: number
          mistakes?: number | null
          puzzle_id: string
          solve_time_seconds?: number | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          hints_used?: number | null
          id?: string
          level?: number
          mistakes?: number | null
          puzzle_id?: string
          solve_time_seconds?: number | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          note_type: string
          persona_id: string | null
          source: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          note_type: string
          persona_id?: string | null
          source?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string
          persona_id?: string | null
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_notes_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          video_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          video_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          video_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "share_links_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_metrics: {
        Row: {
          blockers_count: number | null
          cycle_time_avg_hours: number | null
          id: string
          items_completed: number | null
          items_planned: number | null
          items_spilled: number | null
          notes: string | null
          recorded_at: string | null
          sprint_name: string
        }
        Insert: {
          blockers_count?: number | null
          cycle_time_avg_hours?: number | null
          id?: string
          items_completed?: number | null
          items_planned?: number | null
          items_spilled?: number | null
          notes?: string | null
          recorded_at?: string | null
          sprint_name: string
        }
        Update: {
          blockers_count?: number | null
          cycle_time_avg_hours?: number | null
          id?: string
          items_completed?: number | null
          items_planned?: number | null
          items_spilled?: number | null
          notes?: string | null
          recorded_at?: string | null
          sprint_name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          onboarded: boolean | null
          tier: string | null
          updated_at: string | null
          video_count: number | null
          video_limit: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          onboarded?: boolean | null
          tier?: string | null
          updated_at?: string | null
          video_count?: number | null
          video_limit?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          onboarded?: boolean | null
          tier?: string | null
          updated_at?: string | null
          video_count?: number | null
          video_limit?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          file_path: string | null
          file_size: number | null
          id: string
          status: string | null
          summary_headline: string | null
          summary_keypoints: Json | null
          summary_tldr: string | null
          title: string
          transcript: string | null
          transcript_timestamps: Json | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string | null
          summary_headline?: string | null
          summary_keypoints?: Json | null
          summary_tldr?: string | null
          title: string
          transcript?: string | null
          transcript_timestamps?: Json | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string | null
          summary_headline?: string | null
          summary_keypoints?: Json | null
          summary_tldr?: string | null
          title?: string
          transcript?: string | null
          transcript_timestamps?: Json | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
