import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PERGUNTAS } from "@/lib/checklist";

const upload = vi.fn();
const rpc = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: { from: () => ({ upload: (...a: unknown[]) => upload(...a) }) },
    rpc: (...a: unknown[]) => rpc(...a),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { FormChecklist } from "@/components/conveniencia/FormChecklist";

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <FormChecklist />
    </QueryClientProvider>,
  );
}

const responder = (rotulo: string, resposta: "Sim" | "Não") => {
  const grupo = screen.getByRole("radiogroup", { name: rotulo });
  fireEvent.click(within(grupo).getByRole("radio", { name: resposta }));
};

const responderTodas = (menos?: string) => {
  for (const p of PERGUNTAS) if (p.rotulo !== menos) responder(p.rotulo, "Sim");
};

function adicionarCodigo(codigo: string, providencia: string, ajuste?: string) {
  fireEvent.change(screen.getByLabelText("Código de barras"), { target: { value: codigo } });
  fireEvent.change(screen.getByLabelText("Providência"), { target: { value: providencia } });
  if (ajuste) fireEvent.change(screen.getByLabelText("Qual ajuste"), { target: { value: ajuste } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar código" }));
}

const foto = (nome: string) => new File(["x"], nome, { type: "image/png" });
const nome = () => screen.getByLabelText(/Nome da funcionária/);
const enviar = () =>
  fireEvent.click(screen.getByRole("button", { name: /Enviar checklist|Enviando/ }));

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  upload.mockReset().mockResolvedValue({ error: null });
  rpc.mockReset().mockResolvedValue({ data: "id-1", error: null });
  URL.createObjectURL = vi.fn(() => "blob:x");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe("FormChecklist", () => {
  it("envia nove respostas, 2 fotos e 3 códigos (prova 1)", async () => {
    montar();
    fireEvent.change(nome(), { target: { value: "Maria" } });
    responderTodas();
    fireEvent.change(screen.getByLabelText("Arquivo de foto (galeria)"), {
      target: { files: [foto("a.png"), foto("b.png")] },
    });
    adicionarCodigo("7891234567890", "transferir");
    adicionarCodigo("123", "devolucao");
    adicionarCodigo("456", "ajuste", "Trocar etiqueta");
    expect(screen.getByText("Trocar etiqueta")).toBeInTheDocument();
    enviar();
    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledTimes(2);
    const [fn, args] = rpc.mock.calls[0] as [
      string,
      { p: { codigos: unknown[]; fotos: unknown[]; funcionaria: string } },
    ];
    expect(fn).toBe("enviar_checklist");
    expect(args.p.codigos).toHaveLength(3);
    expect(args.p.fotos).toHaveLength(2);
    expect(args.p.funcionaria).toBe("Maria");
  });

  it("segundo clique durante o envio não chama de novo", async () => {
    rpc.mockReturnValue(new Promise(() => {}));
    montar();
    fireEvent.change(nome(), { target: { value: "Maria" } });
    responderTodas();
    enviar();
    enviar();
    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Enviando…")).toBeInTheDocument();
    enviar();
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("falha do rpc mostra o aviso e mantém o que foi digitado", async () => {
    rpc.mockRejectedValue(new Error("boom"));
    montar();
    fireEvent.change(nome(), { target: { value: "Maria" } });
    responderTodas();
    enviar();
    expect(
      await screen.findByText("Não foi possível enviar. Nada foi gravado. Tente de novo."),
    ).toBeInTheDocument();
    expect(nome()).toHaveValue("Maria");
  });

  it("sem responder 'Loja limpa' mostra o erro e não envia", async () => {
    montar();
    fireEvent.change(nome(), { target: { value: "Maria" } });
    responderTodas("Loja limpa");
    enviar();
    expect(await screen.findByText("Responda se a loja está limpa")).toBeInTheDocument();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("código com letras não entra na lista", () => {
    montar();
    adicionarCodigo("78A9", "transferir");
    expect(screen.getByText("Código só pode ter números")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover código/ })).not.toBeInTheDocument();
  });
});
