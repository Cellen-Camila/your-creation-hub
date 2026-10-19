import { useRef, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  agruparPendencias,
  PROVIDENCIAS,
  type ChecklistLinha,
  type CodigoLinha,
  type Providencia,
} from "@/lib/checklist";
import {
  dataHoraBR,
  useChecklists,
  useCodigos,
  useMarcarResolvido,
  useUsuarioId,
} from "@/lib/conveniencia";
import { fmt, parseDate } from "@/lib/docs";
import { Esqueleto, FaixaErro, Vazio } from "./Estados";

type Tabela = "checklist_codigos" | "checklists";

const dataBR = (iso: string) => fmt(parseDate(iso));

function SeloResolvido({
  em,
  por,
  usuarioId,
}: {
  em: string;
  por: string | null;
  usuarioId: string | null | undefined;
}) {
  const quem = por && por === usuarioId ? "por você" : "por outra pessoa da equipe";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-ok-soft px-2 py-0.5 text-xs font-semibold text-ok">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      Resolvido em {dataHoraBR(em)} · {quem}
    </span>
  );
}

function Acao({
  resolvido,
  salvando,
  onClick,
}: {
  resolvido: boolean;
  salvando: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={resolvido ? "outline" : "default"}
      disabled={salvando}
      onClick={onClick}
    >
      {salvando ? (
        "Salvando…"
      ) : resolvido ? (
        <>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reabrir
        </>
      ) : (
        "Resolvido"
      )}
    </Button>
  );
}

export function Pendencias() {
  const checklists = useChecklists();
  const codigos = useCodigos();
  const usuario = useUsuarioId();
  const marcar = useMarcarResolvido();
  const [mostrar, setMostrar] = useState(false);
  const [salvando, setSalvando] = useState<ReadonlySet<string>>(new Set());
  const emVoo = useRef(new Set<string>());

  async function alternar(tabela: Tabela, id: string, resolvido: boolean) {
    if (emVoo.current.has(id)) return;
    emVoo.current.add(id);
    setSalvando(new Set(emVoo.current));
    try {
      await marcar(tabela, id, resolvido);
    } catch {
      toast.error("Não foi possível salvar. Tente de novo.");
    } finally {
      emVoo.current.delete(id);
      setSalvando(new Set(emVoo.current));
    }
  }

  const erro = checklists.error ?? codigos.error;
  if (erro) {
    return (
      <FaixaErro
        erro={erro}
        onRetry={() => {
          void checklists.refetch();
          void codigos.refetch();
        }}
      />
    );
  }
  if (!checklists.data || !codigos.data) return <Esqueleto />;

  const lista = (resolvidos: boolean) =>
    agruparPendencias(
      codigos.data as CodigoLinha[],
      checklists.data as ChecklistLinha[],
      resolvidos,
    );
  const abertos = lista(false);
  const g = mostrar ? lista(true) : abertos;
  const vazio =
    abertos.transferir.length +
      abertos.devolucao.length +
      abertos.ajuste.length +
      abertos.aFazer.length ===
    0;

  const blocoCodigos = (prov: Providencia) => {
    const itens = g[prov];
    const nAbertos = abertos[prov].length;
    return (
      <Bloco key={prov} titulo={PROVIDENCIAS[prov]} abertos={nAbertos}>
        {itens.map((c) => (
          <Linha key={c.id}>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-sm font-semibold">{c.codigo}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  Qtd: {c.quantidade}
                </span>
              </div>
              {prov === "ajuste" && c.ajuste && <p className="text-sm">{c.ajuste}</p>}
              <Origem data={c.data} funcionaria={c.funcionaria} />
              {c.resolvido_em && (
                <SeloResolvido em={c.resolvido_em} por={c.resolvido_por} usuarioId={usuario.data} />
              )}
            </div>
            <Acao
              resolvido={!!c.resolvido_em}
              salvando={salvando.has(c.id)}
              onClick={() => void alternar("checklist_codigos", c.id, !c.resolvido_em)}
            />
          </Linha>
        ))}
      </Bloco>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Switch id="mostrar-resolvidos" checked={mostrar} onCheckedChange={setMostrar} />
        <Label htmlFor="mostrar-resolvidos">Mostrar resolvidos</Label>
      </div>
      {vazio && !mostrar ? (
        <Vazio icone={CheckCircle2} texto="Nenhuma pendência aberta" />
      ) : (
        <>
          {blocoCodigos("transferir")}
          {blocoCodigos("devolucao")}
          {blocoCodigos("ajuste")}
          <Bloco titulo="O que precisa ser feito" abertos={abertos.aFazer.length}>
            {g.aFazer.map((c) => (
              <Linha key={c.id}>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="whitespace-pre-line text-sm">{c.a_fazer}</p>
                  <Origem data={c.data} funcionaria={c.funcionaria} />
                  {c.a_fazer_resolvido_em && (
                    <SeloResolvido
                      em={c.a_fazer_resolvido_em}
                      por={c.a_fazer_resolvido_por}
                      usuarioId={usuario.data}
                    />
                  )}
                </div>
                <Acao
                  resolvido={!!c.a_fazer_resolvido_em}
                  salvando={salvando.has(c.id)}
                  onClick={() => void alternar("checklists", c.id, !c.a_fazer_resolvido_em)}
                />
              </Linha>
            ))}
          </Bloco>
        </>
      )}
    </div>
  );
}

function Origem({ data, funcionaria }: { data: string; funcionaria: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="tabular-nums">{dataBR(data)}</span> · <span>{funcionaria}</span>
    </p>
  );
}

function Linha({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 first:border-t-0">
      {children}
    </li>
  );
}

function Bloco({
  titulo,
  abertos,
  children,
}: {
  titulo: string;
  abertos: number;
  children: React.ReactNode;
}) {
  const vazio = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <Card>
      <section aria-label={titulo}>
        <CardHeader className="space-y-0">
          <h3 className="flex items-center gap-3 text-base font-semibold leading-none tracking-tight">
            {titulo}
            <Badge
              variant="outline"
              className={
                abertos > 0 ? "border-warn/30 bg-warn-soft text-warn" : "text-muted-foreground"
              }
            >
              <span className="tabular-nums">{abertos}</span>
            </Badge>
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {vazio ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">Nada aqui.</p>
          ) : (
            <ul>{children}</ul>
          )}
        </CardContent>
      </section>
    </Card>
  );
}
