import type { Tables } from "@/integrations/supabase/types";

export type Documento = Tables<"documentos">;
export type Status = "sem_vencimento" | "pendente" | "em_dia" | "renovar" | "vencido";

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

export function statusDe(doc: Documento, hoje = new Date()): Status {
  if (doc.tipo_prazo === "Sem vencimento" || doc.tipo_prazo === "Rotina contínua") return "sem_vencimento";
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
  pendente: "Sem data",
  em_dia: "Em dia",
  sem_vencimento: "Sem vencimento",
};

export const STATUS_CLASS: Record<Status, string> = {
  vencido: "bg-late-soft text-late",
  renovar: "bg-warn-soft text-warn",
  pendente: "bg-muted text-muted-foreground",
  em_dia: "bg-ok-soft text-ok",
  sem_vencimento: "bg-secondary text-secondary-foreground",
};
