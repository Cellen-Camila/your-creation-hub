import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CheckCircle2 } from "lucide-react";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { SeloStatus } from "@/components/conveniencia/SeloStatus";
import { dataBR } from "@/lib/conveniencia";

afterEach(cleanup);

describe("SeloStatus", () => {
  it.each([
    ["ok", "bg-ok-soft", "text-ok"],
    ["warn", "bg-warn-soft", "text-warn"],
    ["late", "bg-late-soft", "text-late"],
    ["info", "bg-info-soft", "text-info"],
  ] as const)("tipo %s usa as classes do tema e mostra ícone + texto", (tipo, fundo, texto) => {
    render(
      <SeloStatus tipo={tipo} icone={CheckCircle2}>
        Texto do selo
      </SeloStatus>,
    );
    const selo = screen.getByText("Texto do selo");
    expect(selo).toHaveClass(fundo, texto);
    expect(selo.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("dataBR", () => {
  it("formata AAAA-MM-DD como dd/mm/aaaa", () => {
    expect(dataBR("2026-10-18")).toBe("18/10/2026");
  });
});
