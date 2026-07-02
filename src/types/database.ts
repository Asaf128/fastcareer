// Auto-generiert via: pnpm db:types
// NICHT manuell bearbeiten

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      applications: {
        Row: {
          answered: boolean
          applied: boolean
          arbeitgeber: string
          cover_letter: string | null
          created_at: string
          id: string
          job_refnr: string
          match_begruendung: Json | null
          match_score: number | null
          notes: string
          ort: string | null
          status: string
          titel: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answered?: boolean
          applied?: boolean
          arbeitgeber: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_refnr: string
          match_begruendung?: Json | null
          match_score?: number | null
          notes?: string
          ort?: string | null
          status?: string
          titel: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answered?: boolean
          applied?: boolean
          arbeitgeber?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_refnr?: string
          match_begruendung?: Json | null
          match_score?: number | null
          notes?: string
          ort?: string | null
          status?: string
          titel?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          arbeitszeit: string
          created_at: string
          id: string
          last_sent_at: string | null
          umkreis: number
          user_id: string
          was: string
          wo: string
        }
        Insert: {
          arbeitszeit?: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          umkreis?: number
          user_id: string
          was: string
          wo?: string
        }
        Update: {
          arbeitszeit?: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          umkreis?: number
          user_id?: string
          was?: string
          wo?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          arbeitgeber: string
          created_at: string
          id: string
          job_refnr: string
          ort: string | null
          titel: string
          user_id: string
        }
        Insert: {
          arbeitgeber: string
          created_at?: string
          id?: string
          job_refnr: string
          ort?: string | null
          titel: string
          user_id: string
        }
        Update: {
          arbeitgeber?: string
          created_at?: string
          id?: string
          job_refnr?: string
          ort?: string | null
          titel?: string
          user_id?: string
        }
        Relationships: []
      }
      job_summaries: {
        Row: {
          created_at: string
          job_refnr: string
          model: string
          summary: Json
        }
        Insert: {
          created_at?: string
          job_refnr: string
          model: string
          summary: Json
        }
        Update: {
          created_at?: string
          job_refnr?: string
          model?: string
          summary?: Json
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_name: string | null
          billing_postal_code: string | null
          billing_state: string | null
          created_at: string | null
          customer_email: string | null
          customer_phone: string | null
          id: string
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_name: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          status: string | null
          stripe_session_id: string | null
          total: number
          user_id: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total: number
          user_id?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          aktiv: boolean
          created_at: string | null
          description: string | null
          gewicht: string | null
          id: string
          image_url: string | null
          kategorie: string | null
          name: string
          price: number
          stock: number | null
        }
        Insert: {
          aktiv?: boolean
          created_at?: string | null
          description?: string | null
          gewicht?: string | null
          id?: string
          image_url?: string | null
          kategorie?: string | null
          name: string
          price: number
          stock?: number | null
        }
        Update: {
          aktiv?: boolean
          created_at?: string | null
          description?: string | null
          gewicht?: string | null
          id?: string
          image_url?: string | null
          kategorie?: string | null
          name?: string
          price?: number
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          birth_date: string | null
          created_at: string
          cv_path: string | null
          education: Json
          full_name: string | null
          headline: string | null
          id: string
          languages: string[]
          location: string | null
          skills: string[]
          updated_at: string
          work_experience: Json
        }
        Insert: {
          about?: string | null
          birth_date?: string | null
          created_at?: string
          cv_path?: string | null
          education?: Json
          full_name?: string | null
          headline?: string | null
          id: string
          languages?: string[]
          location?: string | null
          skills?: string[]
          updated_at?: string
          work_experience?: Json
        }
        Update: {
          about?: string | null
          birth_date?: string | null
          created_at?: string
          cv_path?: string | null
          education?: Json
          full_name?: string | null
          headline?: string | null
          id?: string
          languages?: string[]
          location?: string | null
          skills?: string[]
          updated_at?: string
          work_experience?: Json
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      site_content: {
        Row: {
          content_type: string
          id: string
          key: string
          section: string
          updated_at: string | null
          value: string
        }
        Insert: {
          content_type?: string
          id?: string
          key: string
          section: string
          updated_at?: string | null
          value: string
        }
        Update: {
          content_type?: string
          id?: string
          key?: string
          section?: string
          updated_at?: string | null
          value?: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
