import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Linha = Record<string, unknown>;
const store: Record<string, Linha[]> = { checklists: [], checklist_codigos: [] };
const updates: { tabela: string; vals: Linha; id: unknown }[] = [];
let falhaLeitura: unknown = null;
let segurarUpdate: Promise<void> | null = null;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "u-1" } }, error: null }) },
    from: (tabela: string) => ({
      select: () => {
        const res = () =>
          falhaLeitura
            ? Promise.resolve({ data: null, error: falhaLeitura })
            : Promise.resolve({ data: store[tabela], error: null });
        return { order: res, then: (f: never, r: never) => res().then(f, r) };
      },
      update: (vals: Linha) => ({
        eq: async (_c: string, id: unknown) => {
          updates.push({ tabela, vals, id });
          if (segurarUpdate) await segurarUpdate;
          const l = store[tabela]!.find((x) => x["id"] === id)!;
          Object.assign(l, vals);
          return { error: null };
        },
      }),
    }),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { Pendencias } from "@/components/conveniencia/Pendencias";

const cl = (id: string, extra: Linha = {}): Linha => ({
  id,
  data: "2026-10-18",
  funcionaria: "Maria",
  a_fazer: null,
  a_fazer_resolvido_em: null,
  a_fazer_resolvido_por: null,
  created_at: "2026-10-18T10:00:00Z",
  ...extra,
});
const cod = (id: string, providencia: string, extra: Linha = {}): Linha => ({
  id,
  checklist_id: "c1",
  codigo: "789",
  providencia,
  quantidade: 2,
  ajuste: null,
  resolvido_em: null,
  resolvido_por: null,
  ...extra,
});

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Pendencias />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  store["checklists"] = [cl("c1")];
  store["checklist_codigos"] = [cod("k1", "transferir")];
  updates.length = 0;
  falhaLeitura = null;
  segurarUpdate = null;
});
afterEach(cleanup);

describe("Pendencias", () => {
  it("Resolvido grava resolvido_em e resolvido_por e o item sai (prova 6)", async () => {
    montar();
    expect(await screen.findByText("789")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resolvido" }));
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]!.tabela).toBe("checklist_codigos");
    expect(updates[0]!.vals["resolvido_por"]).toBe("u-1");
    expect(typeof updates[0]!.vals["resolvido_em"]).toBe("string");
    await waitFor(() => expect(screen.queryByText("789")).not.toBeInTheDocument());
    expect(screen.getByText("Nenhuma pendência aberta")).toBeInTheDocument();
  });

  it("Mostrar resolvidos exibe o resolvido e Reabrir zera os dois campos (prova 6)", async () => {
    store["checklist_codigos"] = [
      cod("k1", "transferir", { resolvido_em: "2026-10-19T13:05:00", resolvido_por: "u-1" }),
    ];
    montar();
    await screen.findByText("Nenhuma pendência aberta");
    fireEvent.click(screen.getByRole("switch", { name: "Mostrar resolvidos" }));
    expect(await screen.findByText("789")).toBeInTheDocument();
    expect(screen.getByText(/Resolvido em 19\/10\/2026 13:05/)).toBeInTheDocument();
    expect(screen.getByText(/por você/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reabrir" }));
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]!.vals).toEqual({ resolvido_em: null, resolvido_por: null });
  });

  it("outra pessoa aparece como 'outra pessoa da equipe'", async () => {
    store["checklist_codigos"] = [
      cod("k1", "transferir", { resolvido_em: "2026-10-19T13:05:00", resolvido_por: "u-9" }),
    ];
    montar();
    await screen.findByText("Nenhuma pendência aberta");
    fireEvent.click(screen.getByRole("switch", { name: "Mostrar resolvidos" }));
    expect(await screen.findByText(/por outra pessoa da equipe/)).toBeInTheDocument();
  });

  it("o que precisa ser feito aparece e é resolvido do mesmo jeito (prova 7)", async () => {
    store["checklist_codigos"] = [];
    store["checklists"] = [cl("c1", { a_fazer: "Trocar a lâmpada do freezer" })];
    montar();
    const bloco = (await screen.findByText("Trocar a lâmpada do freezer")).closest("section")!;
    expect(within(bloco).getByText("Maria")).toBeInTheDocument();
    fireEvent.click(within(bloco).getByRole("button", { name: "Resolvido" }));
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]!.tabela).toBe("checklists");
    expect(updates[0]!.vals["a_fazer_resolvido_por"]).toBe("u-1");
    expect(updates[0]!.vals["a_fazer_resolvido_em"]).toEqual(expect.any(String));
    await waitFor(() =>
      expect(screen.queryByText("Trocar a lâmpada do freezer")).not.toBeInTheDocument(),
    );
  });

  it("mostra contagem, ajuste pedido e data dd/mm/aaaa", async () => {
    store["checklist_codigos"] = [
      cod("k1", "ajuste", { ajuste: "Trocar etiqueta" }),
      cod("k2", "transferir", { codigo: "123" }),
    ];
    montar();
    expect(await screen.findByText("Trocar etiqueta")).toBeInTheDocument();
    expect(screen.getAllByText("18/10/2026").length).toBe(2);
    expect(screen.getByRole("heading", { name: /Ajuste/ })).toHaveTextContent("1");
  });

  it("sem itens mostra 'Nenhuma pendência aberta'", async () => {
    store["checklist_codigos"] = [];
    montar();
    expect(await screen.findByText("Nenhuma pendência aberta")).toBeInTheDocument();
  });

  it("duplo clique em Resolvido chama update uma vez", async () => {
    let soltar!: () => void;
    segurarUpdate = new Promise<void>((r) => (soltar = r));
    montar();
    const b = await screen.findByRole("button", { name: "Resolvido" });
    fireEvent.click(b);
    fireEvent.click(b);
    const salvando = await screen.findByRole("button", { name: "Salvando…" });
    expect(salvando).toBeDisabled();
    fireEvent.click(salvando);
    soltar();
    await waitFor(() => expect(screen.queryByText("789")).not.toBeInTheDocument());
    expect(updates).toHaveLength(1);
  });

  it("erro mostra faixa e Tentar de novo busca de novo", async () => {
    falhaLeitura = { message: "boom" };
    montar();
    expect(await screen.findByText(/Não foi possível carregar/)).toBeInTheDocument();
    falhaLeitura = null;
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(await screen.findByText("789")).toBeInTheDocument();
  });

  it("tabela ausente avisa que o banco não foi atualizado", async () => {
    falhaLeitura = { code: "PGRST205", message: "x" };
    montar();
    expect(
      await screen.findByText("O banco ainda não foi atualizado. Avise a gerência."),
    ).toBeInTheDocument();
  });
});
