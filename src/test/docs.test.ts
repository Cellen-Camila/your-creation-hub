import { describe, expect, it } from "vitest";
import { type Documento, type Renovacao, custosPorAno, faixaAlerta, proximaEtapa, statusDe } from "@/lib/docs";

const doc = (over: Partial<Documento> = {}): Documento => ({
  id: "d1", categoria: "Municipal", nome: "Alvará", orgao: "Prefeitura", base_legal: null, tipo_prazo: "Prazo fixo",
  validade_tipica: null, antecedencia_dias: 30, emissao: null, vencimento: "2026-12-31", arquivo_path: null,
  arquivo_nome: null, observacoes: null, ordem: 1, numero: null, responsavel: null, custo_renovacao: null,
  updated_at: "", created_at: "", ...over,
});

const ren = (over: Partial<Renovacao>): Renovacao => ({
  id: "r", documento_id: "d1", etapa: "concluida", protocolo: null, custo: null, iniciada_em: "2026-01-01",
  concluida_em: null, vencimento_anterior: null, novo_vencimento: null, observacoes: null, criado_por: null,
  updated_at: "", created_at: "", ...over,
});

describe("faixaAlerta", () => {
  it("encaixa os dias na menor faixa de 7/15/30/60/90", () => {
    expect(faixaAlerta(-1)).toBe("vencido");
    expect(faixaAlerta(0)).toBe(7);
    expect(faixaAlerta(7)).toBe(7);
    expect(faixaAlerta(8)).toBe(15);
    expect(faixaAlerta(31)).toBe(60);
    expect(faixaAlerta(90)).toBe(90);
    expect(faixaAlerta(91)).toBeNull();
    expect(faixaAlerta(null)).toBeNull();
  });
});

describe("statusDe", () => {
  const hoje = new Date(2026, 9, 17);

  it("mostra em renovação quando há renovação aberta, mesmo vencido", () => {
    expect(statusDe(doc({ vencimento: "2026-10-01" }), hoje)).toBe("vencido");
    expect(statusDe(doc({ vencimento: "2026-10-01" }), hoje, true)).toBe("em_renovacao");
  });

  it("documento sem vencimento ignora renovação", () => {
    expect(statusDe(doc({ tipo_prazo: "Sem vencimento" }), hoje, true)).toBe("sem_vencimento");
  });
});

describe("proximaEtapa", () => {
  it("segue a ordem e termina em concluída", () => {
    expect(proximaEtapa("juntar_documentos")).toBe("protocolar");
    expect(proximaEtapa("pagar_taxa")).toBe("aguardar_emissao");
    expect(proximaEtapa("aguardar_emissao")).toBe("concluida");
  });
});

describe("custosPorAno", () => {
  it("soma só renovações concluídas, por ano, do mais recente", () => {
    const r = custosPorAno([
      ren({ id: "a", concluida_em: "2025-03-01", custo: 100 }),
      ren({ id: "b", concluida_em: "2026-05-10", custo: 250.5 }),
      ren({ id: "c", concluida_em: "2026-08-01", custo: null }),
      ren({ id: "d", concluida_em: null, custo: 999 }),
    ]);
    expect(r).toEqual([
      { ano: 2026, total: 250.5, qtd: 2 },
      { ano: 2025, total: 100, qtd: 1 },
    ]);
  });
});
