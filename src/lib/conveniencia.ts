import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nomeSeguro } from "@/lib/arquivos";
import { paraPayload, type ChecklistValido } from "@/lib/checklist";

/** Tabela ou função do checklist ainda não existe no banco (migração não aplicada). */
export function tabelaAusente(err: unknown): boolean {
  const code = (err as { code?: unknown } | null | undefined)?.code;
  return code === "PGRST205" || code === "42P01" || code === "PGRST202";
}

/** Sobe as fotos e grava tudo de uma vez pela função do banco. Devolve o id do checklist. */
export async function enviarChecklist(valido: ChecklistValido, fotos: File[]): Promise<string> {
  const envio = crypto.randomUUID();
  const caminhos: { path: string; nome: string }[] = [];
  for (const [i, file] of fotos.entries()) {
    const path = `conveniencia/${envio}/${i}-${nomeSeguro(file.name)}`;
    const { error } = await supabase.storage.from("documentos").upload(path, file);
    if (error) throw error;
    caminhos.push({ path, nome: file.name });
  }
  const { data, error } = await supabase.rpc("enviar_checklist", {
    p: paraPayload(valido, caminhos),
  });
  if (error) throw error;
  return data;
}

export function useChecklists() {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCodigos() {
  return useQuery({
    queryKey: ["checklist_codigos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("checklist_codigos").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useFotos(checklistId: string | undefined) {
  return useQuery({
    queryKey: ["checklist_fotos", checklistId],
    enabled: !!checklistId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_fotos")
        .select("*")
        .eq("checklist_id", checklistId as string);
      if (error) throw error;
      return data;
    },
  });
}
