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
      click_events: {
        Row: {
          destination_slug: string | null
          id: string
          offer_id: string
          outcome: string | null
          referrer_page: string | null
          session_id: string | null
          timestamp: string
        }
        Insert: {
          destination_slug?: string | null
          id?: string
          offer_id: string
          outcome?: string | null
          referrer_page?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          destination_slug?: string | null
          id?: string
          offer_id?: string
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
          affiliate_potential: Json
          airport_lat: number | null
          airport_lng: number | null
          aliases: string[]
          avg_daily_budget: number | null
          best_season: string | null
          best_seasons: string[]
          camping_score: number | null
          created_at: string
          destination_type: string | null
          drive_miles: number | null
          drive_minutes: number | null
          experience_tags: string[]
          gallery: string[]
          gateway_cities: string[]
          hero_image: string | null
          homepage_eligible: boolean
          id: string
          inventory_priority: string | null
          lat: number | null
          lng: number | null
          name: string
          nearest_airport_code: string | null
          nearest_airport_name: string | null
          notes: string | null
          parent_slug: string | null
          permit_level: Database["public"]["Enums"]["permit_level"] | null
          plan_builder_eligible: boolean
          primary_keyword: string | null
          recommended_duration: string | null
          region: string | null
          relevance: Json
          scenic_score: number | null
          secondary_keywords: string[]
          seo_description: string | null
          seo_eligible: boolean
          seo_title: string | null
          similar_slugs: string[]
          slug: string
          state: string | null
          status: string
          tagline: string | null
          tier: string | null
          trip_duration_days: string | null
          trip_tags: string[]
          updated_at: string
        }
        Insert: {
          affiliate_potential?: Json
          airport_lat?: number | null
          airport_lng?: number | null
          aliases?: string[]
          avg_daily_budget?: number | null
          best_season?: string | null
          best_seasons?: string[]
          camping_score?: number | null
          created_at?: string
          destination_type?: string | null
          drive_miles?: number | null
          drive_minutes?: number | null
          experience_tags?: string[]
          gallery?: string[]
          gateway_cities?: string[]
          hero_image?: string | null
          homepage_eligible?: boolean
          id?: string
          inventory_priority?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          nearest_airport_code?: string | null
          nearest_airport_name?: string | null
          notes?: string | null
          parent_slug?: string | null
          permit_level?: Database["public"]["Enums"]["permit_level"] | null
          plan_builder_eligible?: boolean
          primary_keyword?: string | null
          recommended_duration?: string | null
          region?: string | null
          relevance?: Json
          scenic_score?: number | null
          secondary_keywords?: string[]
          seo_description?: string | null
          seo_eligible?: boolean
          seo_title?: string | null
          similar_slugs?: string[]
          slug: string
          state?: string | null
          status?: string
          tagline?: string | null
          tier?: string | null
          trip_duration_days?: string | null
          trip_tags?: string[]
          updated_at?: string
        }
        Update: {
          affiliate_potential?: Json
          airport_lat?: number | null
          airport_lng?: number | null
          aliases?: string[]
          avg_daily_budget?: number | null
          best_season?: string | null
          best_seasons?: string[]
          camping_score?: number | null
          created_at?: string
          destination_type?: string | null
          drive_miles?: number | null
          drive_minutes?: number | null
          experience_tags?: string[]
          gallery?: string[]
          gateway_cities?: string[]
          hero_image?: string | null
          homepage_eligible?: boolean
          id?: string
          inventory_priority?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          nearest_airport_code?: string | null
          nearest_airport_name?: string | null
          notes?: string | null
          parent_slug?: string | null
          permit_level?: Database["public"]["Enums"]["permit_level"] | null
          plan_builder_eligible?: boolean
          primary_keyword?: string | null
          recommended_duration?: string | null
          region?: string | null
          relevance?: Json
          scenic_score?: number | null
          secondary_keywords?: string[]
          seo_description?: string | null
          seo_eligible?: boolean
          seo_title?: string | null
          similar_slugs?: string[]
          slug?: string
          state?: string | null
          status?: string
          tagline?: string | null
          tier?: string | null
          trip_duration_days?: string | null
          trip_tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          destination_id: string | null
          email: string
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          destination_id?: string | null
          email: string
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          destination_id?: string | null
          email?: string
          id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_leads_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          category: Database["public"]["Enums"]["offer_category"]
          commissionable: boolean
          created_at: string
          description: string | null
          destination_id: string | null
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
          commissionable?: boolean
          created_at?: string
          description?: string | null
          destination_id?: string | null
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
          commissionable?: boolean
          created_at?: string
          description?: string | null
          destination_id?: string | null
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
      saved_plans: {
        Row: {
          created_at: string
          destination_slug: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          destination_slug: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          destination_slug?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_trip_plan: {
        Args: { p_destination_slug: string; p_email: string }
        Returns: undefined
      }
    }
    Enums: {
      offer_category:
        | "stay"
        | "rv_rental"
        | "gear_rental"
        | "gear_purchase"
        | "activity"
        | "insurance"
        | "esim"
        | "offline_maps"
        | "car_rental"
        | "travel_card"
        | "park_pass"
      permit_level: "high" | "moderate" | "none"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "insurance",
        "esim",
        "offline_maps",
        "car_rental",
        "travel_card",
        "park_pass",
      ],
      permit_level: ["high", "moderate", "none"],
    },
  },
} as const
