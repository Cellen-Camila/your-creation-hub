import { z } from "zod";

export type Grupo = "operacional" | "manutencao";

export const PERGUNTAS = [
  {
    chave: "produto_sem_cadastro",
    rotulo: "Veio produto sem cadastro",
    grupo: "operacional",
    mensagem: "Responda se veio produto sem cadastro",
  },
  {
    chave: "mercadoria_abastecida",
    rotulo: "Mercadoria abastecida",
    grupo: "operacional",
    mensagem: "Responda se a mercadoria foi abastecida",
  },
  {
    chave: "notas_bonificacao",
    rotulo: "Notas de bonificação/trocas",
    grupo: "operacional",
    mensagem: "Responda se há notas de bonificação/trocas",
  },
  {
    chave: "transferencias_realizadas",
    rotulo: "Transferências realizadas",
    grupo: "operacional",
    mensagem: "Responda se as transferências foram realizadas",
  },
  {
    chave: "loja_limpa",
    rotulo: "Loja limpa",
    grupo: "manutencao",
    mensagem: "Responda se a loja está limpa",
  },
  {
    chave: "lixo_retirado",
    rotulo: "Lixo retirado",
    grupo: "manutencao",
    mensagem: "Responda se o lixo foi retirado",
  },
  {
    chave: "loja_organizada",
    rotulo: "Loja organizada",
    grupo: "manutencao",
    mensagem: "Responda se a loja está organizada",
  },
  {
    chave: "freezers_organizados",
    rotulo: "Freezers organizados",
    grupo: "manutencao",
    mensagem: "Responda se os freezers estão organizados",
  },
  {
    chave: "material_abastecido",
    rotulo: "Material de uso e consumo abastecido",
    grupo: "manutencao",
    mensagem: "Responda se o material de uso e consumo foi abastecido",
  },
] as const satisfies readonly { chave: string; rotulo: string; grupo: Grupo; mensagem: string }[];

export type ChavePergunta = (typeof PERGUNTAS)[number]["chave"];

export const PROVIDENCIAS = {
  transferir: "Transferir",
  devolucao: "Nota de devolução",
  ajuste: "Ajuste",
} as const;
export type Providencia = keyof typeof PROVIDENCIAS;

/** Código lido pela câmera pode vir com espaço ou quebra de linha. */
export const normalizarCodigo = (s: string): string => s.replace(/\s+/g, "");

/** Data LOCAL em AAAA-MM-DD (toISOString usaria UTC e viraria o dia à noite). */
export function hojeISO(agora: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

export const codigoSchema = z
  .object({
    codigo: z
      .string({ required_error: "Informe o código" })
      .min(1, "Informe o código")
      .max(20, "Código pode ter no máximo 20 dígitos")
      .regex(/^[0-9]*$/, "Código só pode ter números"),
    providencia: z.enum(["transferir", "devolucao", "ajuste"], {
      errorMap: () => ({ message: "Escolha a providência" }),
    }),
    quantidade: z
      .number({ invalid_type_error: "Quantidade deve ser um número inteiro a partir de 1" })
      .int("Quantidade deve ser um número inteiro a partir de 1")
      .min(1, "Quantidade deve ser um número inteiro a partir de 1")
      .default(1),
    ajuste: z.string().optional(),
  })
  .refine((c) => c.providencia !== "ajuste" || (c.ajuste ?? "").trim() !== "", {
    message: "Escreva qual ajuste precisa ser feito",
    path: ["ajuste"],
  });

const sim = (mensagem: string) =>
  z.boolean({ required_error: mensagem, invalid_type_error: mensagem });

const CAMPOS_TEXTO = [
  "pedidos_fornecedor",
  "mercadoria_recebida",
  "avariados_vencidos",
  "mercadorias_trocadas",
  "contagens",
  "outras_informacoes",
  "a_fazer",
] as const;

const formaPerguntas = Object.fromEntries(
  PERGUNTAS.flatMap((p) => [
    [p.chave, sim(p.mensagem)],
    [`${p.chave}_obs`, z.string().optional()],
  ]),
) as { [K in ChavePergunta]: z.ZodBoolean } & {
  [K in `${ChavePergunta}_obs`]: z.ZodOptional<z.ZodString>;
};

const formaTextos = Object.fromEntries(CAMPOS_TEXTO.map((c) => [c, z.string().optional()])) as {
  [K in (typeof CAMPOS_TEXTO)[number]]: z.ZodOptional<z.ZodString>;
};

export const checklistSchema = z.object({
  data: z
    .string({ required_error: "Informe a data" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data")
    .refine((d) => d <= hojeISO(), "A data não pode ser futura"),
  funcionaria: z
    .string({ required_error: "Informe o nome da funcionária" })
    .trim()
    .min(1, "Informe o nome da funcionária"),
  ...formaPerguntas,
  ...formaTextos,
  codigos: z.array(codigoSchema).default([]),
});

export type ChecklistForm = z.input<typeof checklistSchema>;
export type ChecklistValido = z.output<typeof checklistSchema>;

const MB = 1024 * 1024;

export function validarFotos(files: { size: number; type: string }[]): string | null {
  if (files.length > 10) return "Envie no máximo 10 fotos";
  if (files.some((f) => !f.type.startsWith("image/"))) return "Só imagens são aceitas";
  if (files.some((f) => f.size > 10 * MB)) return "Cada foto pode ter até 10 MB";
  return null;
}

export type PayloadEnvio = {
  data: string;
  funcionaria: string;
} & { [K in ChavePergunta]: boolean } & { [K in `${ChavePergunta}_obs`]: string | null } & {
  [K in (typeof CAMPOS_TEXTO)[number]]: string | null;
} & {
  fotos: { path: string; nome: string }[];
  codigos: {
    codigo: string;
    providencia: Providencia;
    quantidade: number;
    ajuste: string | null;
  }[];
};

const vazioNulo = (s: string | undefined): string | null =>
  s && s.trim() !== "" ? s.trim() : null;

export function paraPayload(
  v: ChecklistValido,
  fotos: { path: string; nome: string }[],
): PayloadEnvio {
  const p: Record<string, unknown> = { data: v.data, funcionaria: v.funcionaria };
  for (const q of PERGUNTAS) {
    p[q.chave] = v[q.chave];
    p[`${q.chave}_obs`] = vazioNulo(v[`${q.chave}_obs`]);
  }
  for (const c of CAMPOS_TEXTO) p[c] = vazioNulo(v[c]);
  p["fotos"] = fotos.map((f) => ({ path: f.path, nome: f.nome }));
  p["codigos"] = v.codigos.map((c) => ({
    codigo: c.codigo,
    providencia: c.providencia,
    quantidade: c.quantidade,
    ajuste: c.providencia === "ajuste" ? vazioNulo(c.ajuste) : null,
  }));
  return p as PayloadEnvio;
}

export type CodigoLinha = {
  id: string;
  checklist_id: string;
  codigo: string;
  providencia: Providencia;
  quantidade: number;
  ajuste: string | null;
  resolvido_em: string | null;
  resolvido_por: string | null;
};

export type ChecklistLinha = {
  id: string;
  data: string;
  funcionaria: string;
  a_fazer: string | null;
  a_fazer_resolvido_em: string | null;
  a_fazer_resolvido_por: string | null;
  created_at: string;
};

export type CodigoPendente = CodigoLinha & { data: string; funcionaria: string };

export type Pendencias = {
  transferir: CodigoPendente[];
  devolucao: CodigoPendente[];
  ajuste: CodigoPendente[];
  aFazer: ChecklistLinha[];
};

/** Aberto = ainda sem baixa (código: resolvido_em; "o que fazer" do checklist: a_fazer_resolvido_em). */
export const estaAberto = (c: {
  resolvido_em?: string | null | undefined;
  a_fazer_resolvido_em?: string | null | undefined;
}): boolean => !(c.resolvido_em ?? c.a_fazer_resolvido_em);

/** Mais recente primeiro: data do checklist, depois hora do envio. */
export const maisRecente = (
  a: { data: string; created_at: string },
  b: { data: string; created_at: string },
) => b.data.localeCompare(a.data) || b.created_at.localeCompare(a.created_at);

export function agruparPendencias(
  codigos: CodigoLinha[],
  checklists: ChecklistLinha[],
  mostrarResolvidos = false,
): Pendencias {
  const porId = new Map(checklists.map((c) => [c.id, c]));
  const out: Pendencias = { transferir: [], devolucao: [], ajuste: [], aFazer: [] };

  const enriquecidos = codigos
    .filter((c) => mostrarResolvidos || estaAberto(c))
    .flatMap((c) => {
      const cl = porId.get(c.checklist_id);
      return cl ? [{ item: { ...c, data: cl.data, funcionaria: cl.funcionaria }, cl }] : [];
    })
    .sort((a, b) => maisRecente(a.cl, b.cl));
  for (const { item } of enriquecidos) out[item.providencia].push(item);

  out.aFazer = checklists
    .filter((c) => (c.a_fazer ?? "").trim() !== "" && (mostrarResolvidos || estaAberto(c)))
    .sort(maisRecente);
  return out;
}
