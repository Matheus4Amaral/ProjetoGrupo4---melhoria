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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      atribuicoes_avaliacao: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          ciclo_id: string
          criado_em: string
          id: string
          status: Database["public"]["Enums"]["status_atribuicao"]
          tipo_relacionamento: Database["public"]["Enums"]["tipo_relacionamento"]
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          ciclo_id: string
          criado_em?: string
          id?: string
          status?: Database["public"]["Enums"]["status_atribuicao"]
          tipo_relacionamento: Database["public"]["Enums"]["tipo_relacionamento"]
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          ciclo_id?: string
          criado_em?: string
          id?: string
          status?: Database["public"]["Enums"]["status_atribuicao"]
          tipo_relacionamento?: Database["public"]["Enums"]["tipo_relacionamento"]
        }
        Relationships: [
          {
            foreignKeyName: "atribuicoes_avaliacao_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atribuicoes_avaliacao_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atribuicoes_avaliacao_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos_avaliacao"
            referencedColumns: ["id"]
          },
        ]
      }
      ciclos_avaliacao: {
        Row: {
          criado_em: string
          data_inicio: string
          data_limite: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_ciclo"]
          template_id: string
        }
        Insert: {
          criado_em?: string
          data_inicio: string
          data_limite: string
          id?: string
          nome: string
          status?: Database["public"]["Enums"]["status_ciclo"]
          template_id: string
        }
        Update: {
          criado_em?: string
          data_inicio?: string
          data_limite?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["status_ciclo"]
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciclos_avaliacao_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_competencia"
            referencedColumns: ["id"]
          },
        ]
      }
      ciclos_times: {
        Row: {
          ciclo_id: string
          criado_em: string
          id: string
          time_id: string
        }
        Insert: {
          ciclo_id: string
          criado_em?: string
          id?: string
          time_id: string
        }
        Update: {
          ciclo_id?: string
          criado_em?: string
          id?: string
          time_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciclos_times_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos_avaliacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ciclos_times_time_id_fkey"
            columns: ["time_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_aberto_avaliacao: {
        Row: {
          atribuicao_id: string
          criado_em: string
          id: string
          pontos_fortes: string | null
          pontos_melhoria: string | null
        }
        Insert: {
          atribuicao_id: string
          criado_em?: string
          id?: string
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
        }
        Update: {
          atribuicao_id?: string
          criado_em?: string
          id?: string
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_aberto_avaliacao_atribuicao_id_fkey"
            columns: ["atribuicao_id"]
            isOneToOne: true
            referencedRelation: "atribuicoes_avaliacao"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_time: {
        Row: {
          criado_em: string
          id: string
          perfil_id: string
          time_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          perfil_id: string
          time_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          perfil_id?: string
          time_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_time_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_time_time_id_fkey"
            columns: ["time_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          ativo: boolean
          criado_em: string
          email: string
          gestor_id: string | null
          id: string
          nome_completo: string
          papel: Database["public"]["Enums"]["papel_perfil"]
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          email: string
          gestor_id?: string | null
          id: string
          nome_completo: string
          papel?: Database["public"]["Enums"]["papel_perfil"]
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          email?: string
          gestor_id?: string | null
          id?: string
          nome_completo?: string
          papel?: Database["public"]["Enums"]["papel_perfil"]
        }
        Relationships: [
          {
            foreignKeyName: "perfis_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      perguntas_template: {
        Row: {
          competencia: string
          criado_em: string
          descricao_niveis: string | null
          id: string
          ordem: number
          template_id: string
        }
        Insert: {
          competencia: string
          criado_em?: string
          descricao_niveis?: string | null
          id?: string
          ordem?: number
          template_id: string
        }
        Update: {
          competencia?: string
          criado_em?: string
          descricao_niveis?: string | null
          id?: string
          ordem?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_template_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_competencia"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_avaliacao: {
        Row: {
          atribuicao_id: string
          criado_em: string
          id: string
          nota: number
          pergunta_id: string
        }
        Insert: {
          atribuicao_id: string
          criado_em?: string
          id?: string
          nota: number
          pergunta_id: string
        }
        Update: {
          atribuicao_id?: string
          criado_em?: string
          id?: string
          nota?: number
          pergunta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_avaliacao_atribuicao_id_fkey"
            columns: ["atribuicao_id"]
            isOneToOne: false
            referencedRelation: "atribuicoes_avaliacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_avaliacao_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas_template"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_competencia: {
        Row: {
          criado_em: string
          eh_padrao: boolean
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          eh_padrao?: boolean
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string
          eh_padrao?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      times: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fechar_ciclo_avaliacao: { Args: { p_ciclo_id: string }; Returns: Json }
      fechar_ciclos_vencidos: { Args: never; Returns: number }
      finalizar_avaliacao: {
        Args: { p_atribuicao_id: string; p_pontos_fortes?: string; p_pontos_melhoria?: string; p_respostas: Json }
        Returns: Json
      }
      gerar_atribuicoes_ciclo: { Args: { p_ciclo_id: string }; Returns: Json }
      listar_ciclos_avaliador: {
        Args: never
        Returns: { atribuicoes: Json; autoavaliacao: Json; ciclo_id: string; data_inicio: string; data_limite: string; disponivel: boolean; nome: string; pendentes_terceiros: number }[]
      }
      listar_ciclos_avaliacao: {
        Args: never
        Returns: {
          atribuicoes_concluidas: number
          criado_em: string
          data_inicio: string
          data_limite: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_ciclo"]
          template_id: string
          template_nome: string
          times: Json
          total_atribuicoes: number
        }[]
      }
      listar_resultados_colaborador: {
        Args: never
        Returns: { ciclo_id: string; data_inicio: string; data_limite: string; nome: string }[]
      }
      meu_papel: {
        Args: never
        Returns: Database["public"]["Enums"]["papel_perfil"]
      }
      meus_subordinados: { Args: never; Returns: string[] }
      obter_atribuicao_avaliacao: { Args: { p_atribuicao_id: string }; Returns: Json }
      obter_resultado_colaborador: { Args: { p_ciclo_id: string }; Returns: Json }
      salvar_rascunho_avaliacao: {
        Args: { p_atribuicao_id: string; p_pontos_fortes?: string; p_pontos_melhoria?: string; p_respostas: Json }
        Returns: Json
      }
      salvar_ciclo_avaliacao: {
        Args: {
          p_ciclo_id?: string
          p_data_inicio: string
          p_data_limite: string
          p_nome: string
          p_template_id: string
          p_time_ids: string[]
        }
        Returns: Json
      }
      salvar_template_competencia: {
        Args: { p_competencias: Json; p_nome: string; p_template_id: string }
        Returns: string
      }
    }
    Enums: {
      papel_perfil: "admin" | "rh" | "colaborador"
      status_atribuicao: "pending" | "in_progress" | "completed"
      status_ciclo: "draft" | "active" | "closed"
      tipo_relacionamento: "autoavaliacao" | "gestor" | "pares" | "subordinado"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      papel_perfil: ["admin", "rh", "colaborador"],
      status_atribuicao: ["pending", "in_progress", "completed"],
      status_ciclo: ["draft", "active", "closed"],
      tipo_relacionamento: ["autoavaliacao", "gestor", "pares", "subordinado"],
    },
  },
} as const
