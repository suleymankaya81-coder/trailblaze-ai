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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      click_events: {
        Row: {
          destination_slug: string | null
          id: string
          offer_id: string | null
          outcome: string | null
          referrer_page: string | null
          session_id: string | null
          timestamp: string
        }
        Insert: {
          destination_slug?: string | null
          id?: string
          offer_id?: string | null
          outcome?: string | null
          referrer_page?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          destination_slug?: string | null
          id?: string
          offer_id?: string | null
          outcome?: string | null
          referrer_page?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "click_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          aliases: string[]
          avg_daily_budget: number | null
          best_season: string | null
          camping_score: number | null
          created_at: string
          gallery: string[]
          hero_image: string | null
          id: string
          name: string
          region: string | null
          scenic_score: number | null
          seo_description: string | null
          seo_title: string | null
          similar_slugs: string[]
          slug: string
          status: string
          tagline: string | null
          trip_duration_days: string | null
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          avg_daily_budget?: number | null
          best_season?: string | null
          camping_score?: number | null
          created_at?: string
          gallery?: string[]
          hero_image?: string | null
          id?: string
          name: string
          region?: string | null
          scenic_score?: number | null
          seo_description?: string | null
          seo_title?: string | null
          similar_slugs?: string[]
          slug: string
          status?: string
          tagline?: string | null
          trip_duration_days?: string | null
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          avg_daily_budget?: number | null
          best_season?: string | null
          camping_score?: number | null
          created_at?: string
          gallery?: string[]
          hero_image?: string | null
          id?: string
          name?: string
          region?: string | null
          scenic_score?: number | null
          seo_description?: string | null
          seo_title?: string | null
          similar_slugs?: string[]
          slug?: string
          status?: string
          tagline?: string | null
          trip_duration_days?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          category: Database["public"]["Enums"]["offer_category"]
          created_at: string
          description: string | null
          destination_id: string
          duration: string | null
          external_url: string | null
          id: string
          image: string | null
          partner: string | null
          price_display: string | null
          price_unit: string | null
          price_value: number | null
          subcategory: string | null
          title: string
          updated_at: string
          why_recommended: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["offer_category"]
          created_at?: string
          description?: string | null
          destination_id: string
          duration?: string | null
          external_url?: string | null
          id?: string
          image?: string | null
          partner?: string | null
          price_display?: string | null
          price_unit?: string | null
          price_value?: number | null
          subcategory?: string | null
          title: string
          updated_at?: string
          why_recommended?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["offer_category"]
          created_at?: string
          description?: string | null
          destination_id?: string
          duration?: string | null
          external_url?: string | null
          id?: string
          image?: string | null
          partner?: string | null
          price_display?: string | null
          price_unit?: string | null
          price_value?: number | null
          subcategory?: string | null
          title?: string
          updated_at?: string
          why_recommended?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      offer_category:
        | "stay"
        | "rv_rental"
        | "gear_rental"
        | "gear_purchase"
        | "activity"
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
    Enums: {
      offer_category: [
        "stay",
        "rv_rental",
        "gear_rental",
        "gear_purchase",
        "activity",
      ],
    },
  },
} as const
