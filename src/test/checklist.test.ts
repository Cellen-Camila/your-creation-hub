import { describe, expect, it } from "vitest";
import {
  type ChecklistLinha,
  type CodigoLinha,
  PERGUNTAS,
  agruparPendencias,
  estaAberto,
  checklistSchema,
  codigoSchema,
  hojeISO,
  normalizarCodigo,
  paraPayload,
  validarFotos,
} from "@/lib/checklist";

const respostas = Object.fromEntries(PERGUNTAS.map((p) => [p.chave, true])) as Record<
  string,
  boolean
>;
const base = () => ({ data: hojeISO(), funcionaria: "Maria", ...respostas });

const msgs = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.success ? [] : r.error!.issues.map((i) => i.message);

describe("PERGUNTAS", () => {
  it("tem as 9 perguntas com rótulos e grupos do combinado", () => {
    expect(PERGUNTAS.map((p) => p.chave)).toEqual([
      "produto_sem_cadastro",
      "mercadoria_abastecida",
      "notas_bonificacao",
      "transferencias_realizadas",
      "loja_limpa",
      "lixo_retirado",
      "loja_organizada",
      "freezers_organizados",
      "material_abastecido",
    ]);
    expect(PERGUNTAS.filter((p) => p.grupo === "operacional")).toHaveLength(4);
    expect(PERGUNTAS.find((p) => p.chave === "material_abastecido")?.rotulo).toBe(
      "Material de uso e consumo abastecido",
    );
    expect(PERGUNTAS.find((p) => p.chave === "loja_limpa")?.mensagem).toBe(
      "Responda se a loja está limpa",
    );
  });
});

describe("checklistSchema", () => {
  it("aceita um checklist completo", () => {
    const r = checklistSchema.safeParse(base());
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.codigos).toEqual([]);
  });

  it("prova 2: sem loja_limpa recusa com a mensagem certa", () => {
    const { loja_limpa: _, ...resto } = base() as Record<string, unknown>;
    expect(msgs(checklistSchema.safeParse(resto))).toContain("Responda se a loja está limpa");
    expect(msgs(checklistSchema.safeParse({ ...base(), loja_limpa: null }))).toContain(
      "Responda se a loja está limpa",
    );
  });

  it("exige o nome da funcionária", () => {
    expect(msgs(checklistSchema.safeParse({ ...base(), funcionaria: "   " }))).toContain(
      "Informe o nome da funcionária",
    );
  });

  it("prova 5: data futura recusada, hoje aceita", () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    expect(msgs(checklistSchema.safeParse({ ...base(), data: hojeISO(amanha) }))).toContain(
      "A data não pode ser futura",
    );
    expect(checklistSchema.safeParse({ ...base(), data: hojeISO() }).success).toBe(true);
    expect(checklistSchema.safeParse({ ...base(), data: "2020-01-01" }).success).toBe(true);
  });

  it("valida os códigos dentro do checklist", () => {
    const r = checklistSchema.safeParse({
      ...base(),
      codigos: [{ codigo: "78A9", providencia: "transferir" }],
    });
    expect(msgs(r)).toContain("Código só pode ter números");
  });
});

describe("codigoSchema", () => {
  it("prova 4: letra recusada, 13 dígitos aceito, 21 recusado", () => {
    expect(msgs(codigoSchema.safeParse({ codigo: "78A9", providencia: "transferir" }))).toContain(
      "Código só pode ter números",
    );
    expect(
      codigoSchema.safeParse({ codigo: "7891234567890", providencia: "transferir" }).success,
    ).toBe(true);
    expect(
      msgs(codigoSchema.safeParse({ codigo: "1".repeat(21), providencia: "transferir" })),
    ).toContain("Código pode ter no máximo 20 dígitos");
    expect(
      codigoSchema.safeParse({ codigo: "1".repeat(20), providencia: "transferir" }).success,
    ).toBe(true);
  });

  it("código vazio pede o código", () => {
    expect(msgs(codigoSchema.safeParse({ codigo: "", providencia: "transferir" }))).toContain(
      "Informe o código",
    );
  });

  it("prova 3: ajuste sem texto é recusado no campo ajuste", () => {
    const r = codigoSchema.safeParse({ codigo: "123", providencia: "ajuste", ajuste: "  " });
    expect(r.success).toBe(false);
    if (!r.success) {
      const i = r.error.issues.find((x) => x.message === "Escreva qual ajuste precisa ser feito");
      expect(i?.path).toEqual(["ajuste"]);
    }
    expect(codigoSchema.safeParse({ codigo: "123", providencia: "ajuste" }).success).toBe(false);
    expect(
      codigoSchema.safeParse({ codigo: "123", providencia: "ajuste", ajuste: "baixar 2" }).success,
    ).toBe(true);
  });

  it("quantidade: padrão 1, zero e fração recusados", () => {
    const ok = codigoSchema.parse({ codigo: "123", providencia: "devolucao" });
    expect(ok.quantidade).toBe(1);
    expect(
      codigoSchema.safeParse({ codigo: "123", providencia: "devolucao", quantidade: 0 }).success,
    ).toBe(false);
    expect(
      codigoSchema.safeParse({ codigo: "123", providencia: "devolucao", quantidade: 1.5 }).success,
    ).toBe(false);
  });

  it("providência fora da lista é recusada", () => {
    expect(codigoSchema.safeParse({ codigo: "123", providencia: "outra" }).success).toBe(false);
  });
});

describe("normalizarCodigo", () => {
  it("tira espaços e quebras de linha", () => {
    expect(normalizarCodigo(" 7891234567890\n")).toBe("7891234567890");
    expect(normalizarCodigo("789 123\r\n4567")).toBe("7891234567");
  });
});

describe("hojeISO", () => {
  it("usa a data local, não UTC", () => {
    expect(hojeISO(new Date(2026, 9, 19, 23, 30))).toBe("2026-10-19");
    expect(hojeISO(new Date(2026, 0, 5, 0, 10))).toBe("2026-01-05");
  });
});

describe("validarFotos", () => {
  const foto = { size: 1000, type: "image/jpeg" };
  it("aceita de 0 a 10 imagens pequenas", () => {
    expect(validarFotos([])).toBeNull();
    expect(validarFotos(Array(10).fill(foto))).toBeNull();
  });
  it("recusa 11 fotos, não imagem e mais de 10 MB", () => {
    expect(validarFotos(Array(11).fill(foto))).toBe("Envie no máximo 10 fotos");
    expect(validarFotos([{ size: 10, type: "application/pdf" }])).toBe("Só imagens são aceitas");
    expect(validarFotos([{ size: 11 * 1024 * 1024, type: "image/png" }])).toBe(
      "Cada foto pode ter até 10 MB",
    );
    expect(validarFotos([{ size: 10 * 1024 * 1024, type: "image/png" }])).toBeNull();
  });
});

describe("paraPayload", () => {
  it("vira objeto plano, vazios viram null e ajuste só vai no tipo ajuste", () => {
    const v = checklistSchema.parse({
      ...base(),
      loja_limpa_obs: "",
      lixo_retirado_obs: "feito",
      a_fazer: "   ",
      contagens: "10 caixas",
      codigos: [
        { codigo: "123", providencia: "transferir", ajuste: "lixo" },
        { codigo: "456", providencia: "ajuste", ajuste: "baixar 2", quantidade: 3 },
      ],
    });
    const p = paraPayload(v, [{ path: "conveniencia/x/a.jpg", nome: "a.jpg" }]);
    expect(p.loja_limpa).toBe(true);
    expect(p.loja_limpa_obs).toBeNull();
    expect(p.lixo_retirado_obs).toBe("feito");
    expect(p.a_fazer).toBeNull();
    expect(p.pedidos_fornecedor).toBeNull();
    expect(p.contagens).toBe("10 caixas");
    expect(p.funcionaria).toBe("Maria");
    expect(p.fotos).toEqual([{ path: "conveniencia/x/a.jpg", nome: "a.jpg" }]);
    expect(p.codigos).toEqual([
      { codigo: "123", providencia: "transferir", quantidade: 1, ajuste: null },
      { codigo: "456", providencia: "ajuste", quantidade: 3, ajuste: "baixar 2" },
    ]);
  });
});

describe("agruparPendencias", () => {
  const cl = (over: Partial<ChecklistLinha>): ChecklistLinha => ({
    id: "c1",
    data: "2026-10-18",
    funcionaria: "Maria",
    a_fazer: null,
    a_fazer_resolvido_em: null,
    a_fazer_resolvido_por: null,
    created_at: "2026-10-18T10:00:00Z",
    ...over,
  });
  const co = (over: Partial<CodigoLinha>): CodigoLinha => ({
    id: "k1",
    checklist_id: "c1",
    codigo: "1",
    providencia: "transferir",
    quantidade: 1,
    ajuste: null,
    resolvido_em: null,
    resolvido_por: null,
    ...over,
  });
  const checklists = [
    cl({ id: "c1", data: "2026-10-18", a_fazer: "Trocar lâmpada" }),
    cl({ id: "c2", data: "2026-10-19", funcionaria: "Ana", created_at: "2026-10-19T10:00:00Z" }),
    cl({
      id: "c3",
      data: "2026-10-17",
      a_fazer: "Pedir sacolas",
      a_fazer_resolvido_em: "2026-10-18T12:00:00Z",
      a_fazer_resolvido_por: "u1",
    }),
  ];
  const codigos = [
    co({ id: "k1", checklist_id: "c1", providencia: "transferir" }),
    co({ id: "k2", checklist_id: "c2", providencia: "devolucao" }),
    co({ id: "k3", checklist_id: "c2", providencia: "ajuste", ajuste: "baixar" }),
    co({
      id: "k4",
      checklist_id: "c1",
      providencia: "transferir",
      resolvido_em: "2026-10-19T09:00:00Z",
      resolvido_por: "u1",
    }),
    co({ id: "k5", checklist_id: "c2", providencia: "transferir" }),
  ];

  it("separa por providência, enriquece e ordena do mais recente", () => {
    const g = agruparPendencias(codigos, checklists);
    expect(g.transferir.map((x) => x.id)).toEqual(["k5", "k1"]);
    expect(g.devolucao.map((x) => x.id)).toEqual(["k2"]);
    expect(g.ajuste.map((x) => x.id)).toEqual(["k3"]);
    expect(g.transferir[0]).toMatchObject({ data: "2026-10-19", funcionaria: "Ana" });
  });

  it("esconde resolvidos e mostra com a flag", () => {
    expect(agruparPendencias(codigos, checklists).transferir.map((x) => x.id)).not.toContain("k4");
    const g = agruparPendencias(codigos, checklists, true);
    expect(g.transferir.map((x) => x.id)).toEqual(["k5", "k1", "k4"]);
  });

  it("aFazer só tem checklists com texto, e esconde o resolvido", () => {
    expect(agruparPendencias(codigos, checklists).aFazer.map((x) => x.id)).toEqual(["c1"]);
    expect(agruparPendencias(codigos, checklists, true).aFazer.map((x) => x.id)).toEqual([
      "c1",
      "c3",
    ]);
  });

  it("ignora código de checklist desconhecido", () => {
    const g = agruparPendencias([co({ id: "z", checklist_id: "nao-existe" })], checklists);
    expect(g.transferir).toEqual([]);
  });
});

describe("estaAberto", () => {
  it("código ou 'a fazer' sem baixa está aberto; com baixa, não", () => {
    expect(estaAberto({ resolvido_em: null })).toBe(true);
    expect(estaAberto({ resolvido_em: "2026-10-19T10:00:00Z" })).toBe(false);
    expect(estaAberto({ a_fazer_resolvido_em: null })).toBe(true);
    expect(estaAberto({ a_fazer_resolvido_em: "2026-10-19T10:00:00Z" })).toBe(false);
  });
});
