import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nomeSeguro } from "@/lib/arquivos";
import { fmt, parseDate } from "@/lib/docs";
import {
  agruparPendencias,
  paraPayload,
  type ChecklistLinha,
  type ChecklistValido,
  type CodigoLinha,
} from "@/lib/checklist";

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

/** Id do login atual (a baixa guarda só o uuid; não há tabela de perfis). */
export function useUsuarioId() {
  return useQuery({
    queryKey: ["usuario_id"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

/** Dá baixa (ou reabre) um código ou o "o que precisa ser feito" de um checklist. */
export async function marcarResolvido(
  tabela: "checklist_codigos" | "checklists",
  id: string,
  resolvido: boolean,
): Promise<void> {
  let em: string | null = null;
  let por: string | null = null;
  if (resolvido) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    em = new Date().toISOString();
    por = data.user?.id ?? null;
  }
  const { error } =
    tabela === "checklist_codigos"
      ? await supabase
          .from("checklist_codigos")
          .update({ resolvido_em: em, resolvido_por: por })
          .eq("id", id)
      : await supabase
          .from("checklists")
          .update({ a_fazer_resolvido_em: em, a_fazer_resolvido_por: por })
          .eq("id", id);
  if (error) throw error;
}

export function useMarcarResolvido() {
  const qc = useQueryClient();
  return async (tabela: "checklist_codigos" | "checklists", id: string, resolvido: boolean) => {
    await marcarResolvido(tabela, id, resolvido);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["checklists"] }),
      qc.invalidateQueries({ queryKey: ["checklist_codigos"] }),
    ]);
  };
}

/** Total de pendências abertas (para o selo da aba). */
export function useTotalAbertos(): number {
  const cl = useChecklists();
  const co = useCodigos();
  if (!cl.data || !co.data) return 0;
  const g = agruparPendencias(co.data as CodigoLinha[], cl.data as ChecklistLinha[]);
  return g.transferir.length + g.devolucao.length + g.ajuste.length + g.aFazer.length;
}

/** "dd/mm/aaaa" de uma data AAAA-MM-DD. */
export const dataBR = (iso: string): string => fmt(parseDate(iso));

/** "dd/mm/aaaa hh:mm" no horário local. */
export function dataHoraBR(iso: string): string {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${d.toLocaleDateString("pt-BR")} ${hora}`;
}
