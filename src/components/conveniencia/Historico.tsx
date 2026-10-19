import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ClipboardList, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  estaAberto,
  maisRecente,
  PERGUNTAS,
  PROVIDENCIAS,
  type ChecklistLinha,
  type CodigoLinha,
  type Providencia,
} from "@/lib/checklist";
import { dataBR, dataHoraBR, useChecklists, useCodigos, useFotos } from "@/lib/conveniencia";
import { Esqueleto, FaixaErro, Vazio } from "./Estados";
import { SeloStatus } from "./SeloStatus";

type Linha = Record<string, unknown> & ChecklistLinha;

const TEXTOS = [
  ["pedidos_fornecedor", "Pedidos realizados ao fornecedor"],
  ["mercadoria_recebida", "Mercadoria recebida do fornecedor"],
  ["avariados_vencidos", "Códigos de produtos avariados/vencidos"],
  ["mercadorias_trocadas", "Mercadorias trocadas"],
  ["contagens", "Contagens"],
  ["outras_informacoes", "Outras informações"],
] as const;

function Situacao({ em }: { em: string | null }) {
  return em ? (
    <SeloStatus tipo="ok">Resolvido em {dataHoraBR(em)}</SeloStatus>
  ) : (
    <SeloStatus tipo="warn" icone={Clock}>
      Aberto
    </SeloStatus>
  );
}

function Miniatura({ path, nome }: { path: string; nome: string | null }) {
  const url = useQuery({
    queryKey: ["checklist_foto_url", path],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("documentos").createSignedUrl(path, 120);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  const rotulo = nome ?? "foto";
  const caixa = "aspect-square overflow-hidden rounded-lg border bg-muted";
  // Link direto com a URL já assinada: window.open depois de um await é bloqueado no Safari do iPhone.
  if (url.data) {
    return (
      <a
        href={url.data}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir foto ${rotulo}`}
        className={`block ${caixa} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <img src={url.data} alt="" className="h-full w-full object-cover" />
      </a>
    );
  }
  return (
    <div className={caixa}>
      {url.isError ? (
        <span className="p-1 text-xs text-muted-foreground">Sem prévia</span>
      ) : (
        <Skeleton className="h-full w-full" />
      )}
    </div>
  );
}

function Fotos({ checklistId }: { checklistId: string }) {
  const fotos = useFotos(checklistId);
  if (fotos.isError) {
    return (
      <Secao titulo="Fotos">
        <p role="alert" className="text-sm text-late">
          Não foi possível carregar as fotos.
        </p>
      </Secao>
    );
  }
  if (!fotos.data) {
    return (
      <Secao titulo="Fotos">
        <div className="grid grid-cols-3 gap-2" aria-busy="true" aria-label="Carregando fotos">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      </Secao>
    );
  }
  if (fotos.data.length === 0) return null;
  return (
    <Secao titulo="Fotos">
      <div className="grid grid-cols-3 gap-2">
        {fotos.data.map((f) => (
          <Miniatura key={f.id} path={f.path} nome={f.nome} />
        ))}
      </div>
    </Secao>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-semibold">{titulo}</h4>
      {children}
    </section>
  );
}

function Detalhe({ c, codigos }: { c: Linha; codigos: CodigoLinha[] }) {
  const grupos: [string, "operacional" | "manutencao"][] = [
    ["Operacional", "operacional"],
    ["Manutenção da loja", "manutencao"],
  ];
  const textos = TEXTOS.filter(([k]) => ((c[k] as string | null) ?? "").trim() !== "");
  return (
    <div className="space-y-5 pb-6">
      {grupos.map(([titulo, grupo]) => (
        <Secao key={grupo} titulo={titulo}>
          <ul className="divide-y rounded-lg border">
            {PERGUNTAS.filter((p) => p.grupo === grupo).map((p) => {
              const obs = c[`${p.chave}_obs`] as string | null;
              return (
                <li key={p.chave} className="flex flex-col gap-0.5 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>{p.rotulo}</span>
                    <span className="font-semibold">{c[p.chave] ? "Sim" : "Não"}</span>
                  </div>
                  {obs && <span className="text-xs text-muted-foreground">{obs}</span>}
                </li>
              );
            })}
          </ul>
        </Secao>
      ))}
      {textos.map(([k, rotulo]) => (
        <Secao key={k} titulo={rotulo}>
          <p className="whitespace-pre-line text-sm">{c[k] as string}</p>
        </Secao>
      ))}
      {(c.a_fazer ?? "").trim() !== "" && (
        <Secao titulo="O que precisa ser feito">
          <p className="whitespace-pre-line text-sm">{c.a_fazer}</p>
          <Situacao em={c.a_fazer_resolvido_em} />
        </Secao>
      )}
      {(Object.keys(PROVIDENCIAS) as Providencia[]).map((prov) => {
        const itens = codigos.filter((k) => k.providencia === prov);
        if (itens.length === 0) return null;
        return (
          <Secao key={prov} titulo={PROVIDENCIAS[prov]}>
            <ul className="divide-y rounded-lg border">
              {itens.map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-sm font-semibold">{k.codigo}</span>{" "}
                    <span className="text-sm tabular-nums text-muted-foreground">
                      Qtd: {k.quantidade}
                    </span>
                    {prov === "ajuste" && k.ajuste && <p className="text-sm">{k.ajuste}</p>}
                  </div>
                  <Situacao em={k.resolvido_em} />
                </li>
              ))}
            </ul>
          </Secao>
        );
      })}
      <Fotos checklistId={c.id} />
    </div>
  );
}

export function Historico() {
  const checklists = useChecklists();
  const codigos = useCodigos();
  const [aberto, setAberto] = useState<string | null>(null);

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
  if (checklists.data.length === 0) {
    return <Vazio icone={ClipboardList} texto="Nenhum checklist enviado ainda" />;
  }

  const todos = codigos.data as CodigoLinha[];
  const lista = [...(checklists.data as Linha[])].sort(maisRecente);
  const atual = lista.find((c) => c.id === aberto);

  return (
    <>
      <ul className="space-y-2">
        {lista.map((c) => {
          const n = todos.filter((k) => k.checklist_id === c.id && estaAberto(k)).length;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setAberto(c.id)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-sm tabular-nums">{dataBR(c.data)}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.funcionaria}</span>
                {n > 0 ? (
                  <SeloStatus tipo="warn">{n === 1 ? "1 aberto" : `${n} abertos`}</SeloStatus>
                ) : (
                  <SeloStatus tipo="ok">Tudo resolvido</SeloStatus>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <Sheet open={!!atual} onOpenChange={(o) => !o && setAberto(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {atual && (
            <>
              <SheetHeader>
                <SheetTitle>Checklist de {dataBR(atual.data)}</SheetTitle>
                <SheetDescription>
                  {atual.funcionaria} · enviado em {dataHoraBR(atual.created_at)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <Detalhe c={atual} codigos={todos.filter((k) => k.checklist_id === atual.id)} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
