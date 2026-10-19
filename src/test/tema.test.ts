import { describe, expect, it } from "vitest";

import { temaInicial } from "@/lib/tema";

describe("temaInicial", () => {
  it("sem preferência salva, segue o sistema escuro", () => {
    expect(temaInicial(null, true)).toBe("escuro");
  });
  it("sem preferência e sem sistema escuro, fica claro", () => {
    expect(temaInicial(null, false)).toBe("claro");
  });
  it("a preferência salva vence o sistema", () => {
    expect(temaInicial("claro", true)).toBe("claro");
    expect(temaInicial("escuro", false)).toBe("escuro");
  });
});
