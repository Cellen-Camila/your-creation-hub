import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PERGUNTAS } from "@/lib/checklist";

type Linha = Record<string, unknown>;
const store: Record<string, Linha[]> = {
  checklists: [],
  checklist_codigos: [],
  checklist_fotos: [],
};
let falhaLeitura: unknown = null;
let falhaFotos: unknown = null;
const createSignedUrl = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: { from: () => ({ createSignedUrl: (...a: unknown[]) => createSignedUrl(...a) }) },
    from: (tabela: string) => ({
      select: () => {
        const res = () =>
          falhaLeitura
            ? Promise.resolve({ data: null, error: falhaLeitura })
            : Promise.resolve({ data: store[tabela], error: null });
        return {
          order: res,
          eq: (_c: string, v: unknown) =>
            Promise.resolve(
              falhaFotos
                ? { data: null, error: falhaFotos }
                : {
                    data: store[tabela]!.filter((x) => x["checklist_id"] === v),
                    error: null,
                  },
            ),
          then: (f: never, r: never) => res().then(f, r),
        };
      },
    }),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { Historico } from "@/components/conveniencia/Historico";

const cl = (id: string, extra: Linha = {}): Linha => {
  const base: Linha = {
    id,
    data: "2026-10-18",
    funcionaria: "Maria",
    created_at: "2026-10-18T10:00:00Z",
    a_fazer: null,
    a_fazer_resolvido_em: null,
    a_fazer_resolvido_por: null,
    pedidos_fornecedor: null,
    mercadoria_recebida: null,
    avariados_vencidos: null,
    mercadorias_trocadas: null,
    contagens: null,
    outras_informacoes: null,
  };
  for (const p of PERGUNTAS) {
    base[p.chave] = true;
    base[`${p.chave}_obs`] = null;
  }
  return { ...base, ...extra };
};
const cod = (id: string, checklist_id: string, extra: Linha = {}): Linha => ({
  id,
  checklist_id,
  codigo: "789",
  providencia: "transferir",
  quantidade: 1,
  ajuste: null,
  resolvido_em: null,
  resolvido_por: null,
  ...extra,
});

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Historico />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  store["checklists"] = [];
  store["checklist_codigos"] = [];
  store["checklist_fotos"] = [];
  falhaLeitura = null;
  falhaFotos = null;
  createSignedUrl
    .mockReset()
    .mockResolvedValue({ data: { signedUrl: "https://x/foto" }, error: null });
});
afterEach(cleanup);

describe("Historico", () => {
  it("lista do mais recente para o mais antigo", async () => {
    store["checklists"] = [
      cl("a", { data: "2026-10-10", funcionaria: "Antiga" }),
      cl("b", { data: "2026-10-18", funcionaria: "Bia", created_at: "2026-10-18T09:00:00Z" }),
      cl("c", { data: "2026-10-18", funcionaria: "Carla", created_at: "2026-10-18T15:00:00Z" }),
    ];
    montar();
    await screen.findByText("Bia");
    const nomes = screen.getAllByRole("button").map((b) => b.textContent ?? "");
    const ordem = ["Carla", "Bia", "Antiga"].map((n) => nomes.findIndex((t) => t.includes(n)));
    expect(ordem).toEqual([0, 1, 2]);
  });

  it("conta os códigos abertos por checklist", async () => {
    store["checklists"] = [
      cl("a", { funcionaria: "Com abertos" }),
      cl("b", {
        funcionaria: "Sem abertos",
        created_at: "2026-10-17T10:00:00Z",
        data: "2026-10-17",
      }),
    ];
    store["checklist_codigos"] = [
      cod("k1", "a"),
      cod("k2", "a"),
      cod("k3", "a", { resolvido_em: "2026-10-19T10:00:00Z" }),
      cod("k4", "b", { resolvido_em: "2026-10-19T10:00:00Z" }),
    ];
    montar();
    const com = (await screen.findByText("Com abertos")).closest("button")!;
    expect(within(com).getByText("2 abertos")).toBeInTheDocument();
    const sem = screen.getByText("Sem abertos").closest("button")!;
    expect(within(sem).getByText("Tudo resolvido")).toBeInTheDocument();
  });

  it("sem checklists mostra 'Nenhum checklist enviado ainda'", async () => {
    montar();
    expect(await screen.findByText("Nenhum checklist enviado ainda")).toBeInTheDocument();
  });

  it("abrir um checklist mostra respostas, textos, códigos e fotos", async () => {
    store["checklists"] = [
      cl("a", {
        loja_limpa: true,
        lixo_retirado: false,
        lixo_retirado_obs: "Coleta atrasada",
        contagens: "Contei o freezer 2",
        a_fazer: "Trocar lâmpada",
      }),
    ];
    store["checklist_codigos"] = [cod("k1", "a", { codigo: "7891234567890", quantidade: 3 })];
    store["checklist_fotos"] = [
      { id: "f1", checklist_id: "a", path: "conveniencia/e/0-a.png", nome: "a.png" },
    ];
    montar();
    fireEvent.click((await screen.findByText("Maria")).closest("button")!);
    const painel = await screen.findByRole("dialog");
    const linha = within(painel).getByText("Loja limpa").closest("li")!;
    expect(within(linha).getByText("Sim")).toBeInTheDocument();
    const lixo = within(painel).getByText("Lixo retirado").closest("li")!;
    expect(within(lixo).getByText("Não")).toBeInTheDocument();
    expect(within(lixo).getByText("Coleta atrasada")).toBeInTheDocument();
    expect(within(painel).getByText("Contei o freezer 2")).toBeInTheDocument();
    expect(within(painel).queryByText("Pedidos realizados ao fornecedor")).not.toBeInTheDocument();
    expect(within(painel).getByText("Trocar lâmpada")).toBeInTheDocument();
    expect(within(painel).getByText("7891234567890")).toBeInTheDocument();
    const foto = await within(painel).findByRole("link", { name: /Abrir foto a\.png/ });
    expect(createSignedUrl).toHaveBeenCalledWith("conveniencia/e/0-a.png", 120);
    expect(foto).toHaveAttribute("href", "https://x/foto");
    expect(foto).toHaveAttribute("target", "_blank");
    expect(foto).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("falha ao buscar as fotos avisa em vez de sumir", async () => {
    store["checklists"] = [cl("a")];
    falhaFotos = { message: "boom" };
    montar();
    fireEvent.click((await screen.findByText("Maria")).closest("button")!);
    const painel = await screen.findByRole("dialog");
    expect(
      await within(painel).findByText("Não foi possível carregar as fotos."),
    ).toBeInTheDocument();
  });

  it("enquanto as fotos carregam mostra esqueleto", async () => {
    store["checklists"] = [cl("a")];
    montar();
    fireEvent.click((await screen.findByText("Maria")).closest("button")!);
    const painel = await screen.findByRole("dialog");
    expect(within(painel).getByLabelText("Carregando fotos")).toBeInTheDocument();
    await waitFor(() =>
      expect(within(painel).queryByLabelText("Carregando fotos")).not.toBeInTheDocument(),
    );
  });

  it("erro mostra faixa e tabela ausente avisa o banco", async () => {
    falhaLeitura = { code: "PGRST205", message: "x" };
    montar();
    expect(
      await screen.findByText("O banco ainda não foi atualizado. Avise a gerência."),
    ).toBeInTheDocument();
  });
});
