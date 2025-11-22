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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      family_links: {
        Row: {
          created_at: string | null
          id: string
          relative_user_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          relative_user_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          relative_user_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          ai_interpretation: Json | null
          created_at: string | null
          description_text: string | null
          event_date: string
          file_url: string | null
          id: string
          record_type: string
          specialty: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: Json | null
          created_at?: string | null
          description_text?: string | null
          event_date: string
          file_url?: string | null
          id?: string
          record_type: string
          specialty?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          ai_interpretation?: Json | null
          created_at?: string | null
          description_text?: string | null
          event_date?: string
          file_url?: string | null
          id?: string
          record_type?: string
          specialty?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          allergies: string | null
          biological_sex: string
          birth_date: string
          blood_type: string | null
          chronic_diseases: string | null
          family_history: string | null
          height_cm: number | null
          id: string
          is_complete: boolean
          last_name: string | null
          medications: string | null
          name: string | null
          surgeries: string | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          biological_sex: string
          birth_date: string
          blood_type?: string | null
          chronic_diseases?: string | null
          family_history?: string | null
          height_cm?: number | null
          id?: string
          is_complete?: boolean
          last_name?: string | null
          medications?: string | null
          name?: string | null
          surgeries?: string | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          biological_sex?: string
          birth_date?: string
          blood_type?: string | null
          chronic_diseases?: string | null
          family_history?: string | null
          height_cm?: number | null
          id?: string
          is_complete?: boolean
          last_name?: string | null
          medications?: string | null
          name?: string | null
          surgeries?: string | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          action_type: string | null
          created_at: string | null
          id: string
          is_dismissed: boolean | null
          reason: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          reason?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          reason?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      family_members_with_details: {
        Row: {
          created_at: string | null
          id: string | null
          relative_email: string | null
          relative_name: string | null
          relative_user_id: string | null
          role: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      search_user_by_email: {
        Args: { search_email: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
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
