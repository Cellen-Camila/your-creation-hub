import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Renovacao } from "@/lib/docs";

export function useDocumentos() {
  return useQuery({
    queryKey: ["documentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documentos").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

/** null = tabela de renovações indisponível (migração ainda não aplicada); as telas seguem funcionando sem ela. */
export function useRenovacoes() {
  return useQuery({
    queryKey: ["renovacoes"],
    queryFn: async (): Promise<Renovacao[] | null> => {
      const { data, error } = await supabase.from("renovacoes").select("*").order("iniciada_em", { ascending: false });
      if (error) { console.warn("Renovações indisponíveis:", error.message); return null; }
      return data;
    },
  });
}
