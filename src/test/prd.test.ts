import { describe, expect, it } from "vitest";
import { MODULOS, progresso, situacaoDe } from "@/lib/prd";

describe("dados do PRD", () => {
  const ids = MODULOS.flatMap((m) => m.requisitos.map((r) => r.id));

  it("tem os 10 módulos e os 89 requisitos, sem IDs repetidos", () => {
    expect(MODULOS).toHaveLength(10);
    expect(ids).toHaveLength(89);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(MODULOS.map((m) => m.slug)).size).toBe(MODULOS.length);
  });

  it("calcula o progresso de Licenças com parcial valendo meio", () => {
    const lic = MODULOS.find((m) => m.slug === "licencas")!;
    expect(situacaoDe("LIC-02").situacao).toBe("parcial");
    expect(progresso(lic)).toBeCloseTo(4.5 / 7);
    expect(progresso(MODULOS.find((m) => m.slug === "pista")!)).toBe(0);
  });
});
