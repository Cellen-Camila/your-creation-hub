import type { Tables } from "@/integrations/supabase/types";

export type Documento = Tables<"documentos">;
export type Renovacao = Tables<"renovacoes">;
export type RenovacaoAnexo = Tables<"renovacao_anexos">;
export type Status = "sem_vencimento" | "pendente" | "em_dia" | "renovar" | "vencido" | "em_renovacao";

// PRD LIC-03: etapas do fluxo de renovação, na ordem.
export const ETAPAS = [
  { id: "juntar_documentos", label: "Juntar documentos" },
  { id: "protocolar", label: "Protocolar" },
  { id: "pagar_taxa", label: "Pagar taxa" },
  { id: "aguardar_emissao", label: "Aguardar emissão" },
] as const;
export type Etapa = (typeof ETAPAS)[number]["id"] | "concluida";

export const etapaLabel = (e: string) => ETAPAS.find((x) => x.id === e)?.label ?? "Concluída";

export function proximaEtapa(e: string): Etapa {
  const i = ETAPAS.findIndex((x) => x.id === e);
  return (i >= 0 && ETAPAS[i + 1]?.id) || "concluida";
}

// PRD LIC-02: alertas escalonados de vencimento.
export const FAIXAS_ALERTA = [7, 15, 30, 60, 90] as const;

/** Menor faixa (7, 15, 30, 60 ou 90 dias) em que o vencimento já entrou; "vencido" se já passou. */
export function faixaAlerta(dias: number | null): (typeof FAIXAS_ALERTA)[number] | "vencido" | null {
  if (dias == null) return null;
  if (dias < 0) return "vencido";
  return FAIXAS_ALERTA.find((f) => dias <= f) ?? null;
}

export const brl = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** PRD LIC-05: soma do custo das renovações concluídas, por ano de conclusão (mais recente primeiro). */
export function custosPorAno(renovacoes: Renovacao[]) {
  const m = new Map<number, { total: number; qtd: number }>();
  for (const r of renovacoes) {
    if (!r.concluida_em) continue;
    const ano = Number(r.concluida_em.slice(0, 4));
    const atual = m.get(ano) ?? { total: 0, qtd: 0 };
    m.set(ano, { total: atual.total + Number(r.custo ?? 0), qtd: atual.qtd + 1 });
  }
  return [...m.entries()].sort((a, b) => b[0] - a[0]).map(([ano, v]) => ({ ano, ...v }));
}

export function parseDate(d: string | null) {
  if (!d) return null;
  const [y = 0, m = 1, day = 1] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function renovarEm(doc: Documento) {
  const v = parseDate(doc.vencimento);
  if (!v || doc.antecedencia_dias == null) return v;
  const r = new Date(v);
  r.setDate(r.getDate() - doc.antecedencia_dias);
  return r;
}

export function statusDe(doc: Documento, hoje = new Date(), emRenovacao = false): Status {
  if (doc.tipo_prazo === "Sem vencimento" || doc.tipo_prazo === "Rotina contínua") return "sem_vencimento";
  if (emRenovacao) return "em_renovacao";
  const v = parseDate(doc.vencimento);
  if (!v) return "pendente";
  const h = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (v < h) return "vencido";
  const r = renovarEm(doc);
  if (r && r <= h) return "renovar";
  return "em_dia";
}

export function diasAte(d: Date | null) {
  if (!d) return null;
  const h = new Date();
  const hoje = new Date(h.getFullYear(), h.getMonth(), h.getDate());
  return Math.round((d.getTime() - hoje.getTime()) / 86400000);
}

export const fmt = (d: Date | null) => (d ? d.toLocaleDateString("pt-BR") : "—");

export const STATUS_LABEL: Record<Status, string> = {
  vencido: "Vencido",
  renovar: "Renovar agora",
  em_renovacao: "Em renovação",
  pendente: "Sem data",
  em_dia: "Em dia",
  sem_vencimento: "Sem vencimento",
};

export const STATUS_CLASS: Record<Status, string> = {
  vencido: "bg-late-soft text-late",
  renovar: "bg-warn-soft text-warn",
  em_renovacao: "bg-primary/10 text-primary",
  pendente: "bg-muted text-muted-foreground",
  em_dia: "bg-ok-soft text-ok",
  sem_vencimento: "bg-secondary text-secondary-foreground",
};
