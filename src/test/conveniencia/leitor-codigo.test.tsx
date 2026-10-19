import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

const iniciarLeitor = vi.fn();
vi.mock("@/lib/leitor", () => ({
  iniciarLeitor: (...a: unknown[]) => iniciarLeitor(...a),
}));

import { CodigosChecklist, type CodigoForm } from "@/components/conveniencia/CodigosChecklist";

function Tela() {
  const [v, setV] = useState<CodigoForm[]>([]);
  return <CodigosChecklist value={v} onChange={setV} />;
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  iniciarLeitor.mockReset();
});
afterEach(cleanup);

const abrir = () => fireEvent.click(screen.getByRole("button", { name: /Ler código/ }));

describe("LeitorCodigo", () => {
  it("câmera negada: avisa e foca o campo de código (prova 10)", async () => {
    iniciarLeitor.mockRejectedValue(new DOMException("negado", "NotAllowedError"));
    render(<Tela />);
    abrir();
    expect(await screen.findByText("Não consegui ler. Digite o código.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Código de barras")).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("leitura preenche o campo, fecha o diálogo e para a câmera", async () => {
    const parar = vi.fn();
    let ler: (t: string) => void = () => {};
    iniciarLeitor.mockImplementation(async (_v: unknown, aoLer: (t: string) => void) => {
      ler = aoLer;
      return { parar };
    });
    render(<Tela />);
    abrir();
    expect(await screen.findByRole("dialog", { name: "Ler código de barras" })).toBeInTheDocument();
    await waitFor(() => expect(iniciarLeitor).toHaveBeenCalled());
    act(() => ler("7891234567890\n"));
    await waitFor(() =>
      expect(screen.getByLabelText("Código de barras")).toHaveValue("7891234567890"),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(parar).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByLabelText("Quantidade")).toHaveFocus());
  });

  it("ao fechar o diálogo, a câmera é liberada", async () => {
    const parar = vi.fn();
    iniciarLeitor.mockResolvedValue({ parar });
    render(<Tela />);
    abrir();
    await screen.findByRole("dialog");
    await waitFor(() => expect(iniciarLeitor).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Close|Fechar/ }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(parar).toHaveBeenCalled();
  });
});
