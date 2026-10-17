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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      documentos: {
        Row: {
          antecedencia_dias: number | null
          arquivo_nome: string | null
          arquivo_path: string | null
          base_legal: string | null
          categoria: string
          created_at: string
          custo_renovacao: number | null
          emissao: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          ordem: number
          orgao: string
          responsavel: string | null
          tipo_prazo: string
          updated_at: string
          validade_tipica: string | null
          vencimento: string | null
        }
        Insert: {
          antecedencia_dias?: number | null
          arquivo_nome?: string | null
          arquivo_path?: string | null
          base_legal?: string | null
          categoria: string
          created_at?: string
          custo_renovacao?: number | null
          emissao?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          ordem?: number
          orgao: string
          responsavel?: string | null
          tipo_prazo: string
          updated_at?: string
          validade_tipica?: string | null
          vencimento?: string | null
        }
        Update: {
          antecedencia_dias?: number | null
          arquivo_nome?: string | null
          arquivo_path?: string | null
          base_legal?: string | null
          categoria?: string
          created_at?: string
          custo_renovacao?: number | null
          emissao?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          ordem?: number
          orgao?: string
          responsavel?: string | null
          tipo_prazo?: string
          updated_at?: string
          validade_tipica?: string | null
          vencimento?: string | null
        }
        Relationships: []
      }
      renovacao_anexos: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          created_at: string
          etapa: string
          id: string
          renovacao_id: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          created_at?: string
          etapa: string
          id?: string
          renovacao_id: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          created_at?: string
          etapa?: string
          id?: string
          renovacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "renovacao_anexos_renovacao_id_fkey"
            columns: ["renovacao_id"]
            isOneToOne: false
            referencedRelation: "renovacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      renovacoes: {
        Row: {
          concluida_em: string | null
          created_at: string
          criado_por: string | null
          custo: number | null
          documento_id: string
          etapa: string
          id: string
          iniciada_em: string
          novo_vencimento: string | null
          observacoes: string | null
          protocolo: string | null
          updated_at: string
          vencimento_anterior: string | null
        }
        Insert: {
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          custo?: number | null
          documento_id: string
          etapa?: string
          id?: string
          iniciada_em?: string
          novo_vencimento?: string | null
          observacoes?: string | null
          protocolo?: string | null
          updated_at?: string
          vencimento_anterior?: string | null
        }
        Update: {
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          custo?: number | null
          documento_id?: string
          etapa?: string
          id?: string
          iniciada_em?: string
          novo_vencimento?: string | null
          observacoes?: string | null
          protocolo?: string | null
          updated_at?: string
          vencimento_anterior?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renovacoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      concluir_renovacao: {
        Args: {
          p_custo: number | null
          p_emissao: string | null
          p_renovacao: string
          p_vencimento: string | null
        }
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
    Enums: {},
  },
} as const
