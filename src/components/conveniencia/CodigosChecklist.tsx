import { useEffect, useRef, useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { codigoSchema, normalizarCodigo, PROVIDENCIAS, type Providencia } from "@/lib/checklist";

export type CodigoForm = {
  codigo: string;
  providencia: Providencia;
  quantidade: number;
  ajuste?: string | undefined;
};

type Props = {
  value: CodigoForm[];
  onChange: (v: CodigoForm[]) => void;
  /** Parte 5: abre o leitor. Sem a prop, o botão não aparece. */
  onLerCodigo?: () => void;
  /** Quando muda, preenche o campo de código e foca a quantidade. */
  codigoLido?: string;
  disabled?: boolean;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function CodigosChecklist({ value, onChange, onLerCodigo, codigoLido, disabled }: Props) {
  const [codigo, setCodigo] = useState("");
  const [providencia, setProvidencia] = useState<Providencia>("transferir");
  const [quantidade, setQuantidade] = useState("1");
  const [ajuste, setAjuste] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const campoCodigo = useRef<HTMLInputElement>(null);
  const campoQuantidade = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!codigoLido) return;
    setCodigo(normalizarCodigo(codigoLido));
    setErro(null);
    campoQuantidade.current?.focus();
  }, [codigoLido]);

  function adicionar() {
    const r = codigoSchema.safeParse({
      codigo: normalizarCodigo(codigo),
      providencia,
      quantidade: quantidade.trim() === "" ? Number.NaN : Number(quantidade),
      ajuste,
    });
    if (!r.success) {
      setErro(r.error.issues[0]?.message ?? "Código inválido");
      return;
    }
    const { codigo: c, quantidade: q, ajuste: a } = r.data;
    onChange([
      ...value,
      {
        codigo: c,
        providencia,
        quantidade: q,
        ajuste: providencia === "ajuste" ? a?.trim() : undefined,
      },
    ]);
    setCodigo("");
    setQuantidade("1");
    setAjuste("");
    setErro(null);
    campoCodigo.current?.focus();
  }

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionar();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cod-codigo">Código de barras</Label>
          <div className="flex gap-2">
            <Input
              id="cod-codigo"
              ref={campoCodigo}
              inputMode="numeric"
              autoComplete="off"
              className="font-mono text-base md:text-sm"
              value={codigo}
              disabled={disabled}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? "cod-erro" : undefined}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={aoTeclar}
            />
            {onLerCodigo && (
              <Button type="button" variant="outline" disabled={disabled} onClick={onLerCodigo}>
                <Camera className="h-4 w-4" aria-hidden /> Ler código
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cod-providencia">Providência</Label>
          <select
            id="cod-providencia"
            className={selectClass}
            value={providencia}
            disabled={disabled}
            onChange={(e) => setProvidencia(e.target.value as Providencia)}
          >
            {(Object.keys(PROVIDENCIAS) as Providencia[]).map((k) => (
              <option key={k} value={k}>
                {PROVIDENCIAS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cod-quantidade">Quantidade</Label>
          <Input
            id="cod-quantidade"
            ref={campoQuantidade}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="text-base md:text-sm"
            value={quantidade}
            disabled={disabled}
            onChange={(e) => setQuantidade(e.target.value)}
            onKeyDown={aoTeclar}
          />
        </div>
        {providencia === "ajuste" && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cod-ajuste">Qual ajuste</Label>
            <Input
              id="cod-ajuste"
              className="text-base md:text-sm"
              value={ajuste}
              disabled={disabled}
              onChange={(e) => setAjuste(e.target.value)}
              onKeyDown={aoTeclar}
            />
          </div>
        )}
      </div>
      {erro && (
        <p id="cod-erro" role="alert" className="text-sm text-late">
          {erro}
        </p>
      )}
      <Button type="button" variant="secondary" disabled={disabled} onClick={adicionar}>
        <Plus className="h-4 w-4" aria-hidden /> Adicionar código
      </Button>

      {value.length > 0 && (
        <div className="space-y-4">
          {(Object.keys(PROVIDENCIAS) as Providencia[]).map((p) => {
            const itens = value.map((c, i) => ({ c, i })).filter(({ c }) => c.providencia === p);
            if (itens.length === 0) return null;
            return (
              <section key={p} aria-label={PROVIDENCIAS[p]}>
                <h4 className="mb-2 text-sm font-semibold">
                  {PROVIDENCIAS[p]} ({itens.length})
                </h4>
                <ul className="divide-y rounded-lg border bg-card">
                  {itens.map(({ c, i }) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-mono">{c.codigo}</span>
                        <span className="ml-2 text-muted-foreground">× {c.quantidade}</span>
                        {c.ajuste && (
                          <span className="block break-words text-muted-foreground">
                            {c.ajuste}
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        aria-label={`Remover código ${c.codigo}`}
                        onClick={() => onChange(value.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
