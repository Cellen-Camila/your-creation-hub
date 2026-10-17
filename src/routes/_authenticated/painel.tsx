import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { LogOut, Paperclip, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Editor } from "@/components/documentos/Editor";
import { NovoDocumento } from "@/components/documentos/NovoDocumento";
import logoAsset from "@/assets/logo-posto-natal.jpg.asset.json";
import {
  type Documento, type Renovacao, type Status, statusDe, renovarEm, parseDate, diasAte, fmt, brl,
  faixaAlerta, FAIXAS_ALERTA, custosPorAno, etapaLabel, STATUS_LABEL, STATUS_CLASS,
} from "@/lib/docs";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — Posto Natal" },
      { name: "description", content: "Painel de vencimentos de documentos e licenças." },
      { property: "og:title", content: "Painel — Posto Natal" },
      { property: "og:description", content: "Painel de vencimentos de documentos e licenças." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

const FILTROS: (Status | "todos")[] = ["todos", "vencido", "renovar", "em_renovacao", "pendente", "em_dia", "sem_vencimento"];
const CARDS: Status[] = ["vencido", "renovar", "em_renovacao", "em_dia", "pendente"];

type Faixa = ReturnType<typeof faixaAlerta>;
const FAIXA_LABEL = (f: NonNullable<Faixa> | "aberto") =>
  f === "vencido" ? "Vencidos" : f === "aberto" ? "Prazo de renovação aberto" : `Até ${f} dias`;

function Painel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [filtro, setFiltro] = useState<Status | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Documento | null>(null);
  const [novo, setNovo] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documentos").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });

  // null = tabela de renovações indisponível (migração ainda não aplicada); o painel segue funcionando sem ela.
  const { data: renovacoes = null } = useQuery({
    queryKey: ["renovacoes"],
    queryFn: async (): Promise<Renovacao[] | null> => {
      const { data, error } = await supabase.from("renovacoes").select("*").order("iniciada_em", { ascending: false });
      if (error) { console.warn("Renovações indisponíveis:", error.message); return null; }
      return data;
    },
  });

  const abertas = useMemo(() => new Map((renovacoes ?? []).filter((r) => !r.concluida_em).map((r) => [r.documento_id, r])), [renovacoes]);
  const status = useCallback((d: Documento) => statusDe(d, undefined, abertas.has(d.id)), [abertas]);

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: docs.length };
    docs.forEach((d) => { const s = status(d); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [docs, status]);

  // PRD LIC-02: documentos com vencimento nos próximos 90 dias, agrupados por faixa de alerta.
  const alertas = useMemo(() => {
    const g = new Map<NonNullable<Faixa> | "aberto", { doc: Documento; dias: number }[]>();
    for (const d of docs) {
      const s = status(d);
      if (s === "sem_vencimento" || s === "em_renovacao" || s === "pendente") continue;
      const dias = diasAte(parseDate(d.vencimento))!;
      const faixa = faixaAlerta(dias) ?? (s === "renovar" ? "aberto" : null);
      if (faixa) g.set(faixa, [...(g.get(faixa) ?? []), { doc: d, dias }]);
    }
    const ordem: (NonNullable<Faixa> | "aberto")[] = ["vencido", ...FAIXAS_ALERTA, "aberto"];
    return ordem.filter((f) => g.has(f)).map((f) => [f, g.get(f)!.sort((a, b) => a.dias - b.dias)] as const);
  }, [docs, status]);

  const custos = useMemo(() => custosPorAno(renovacoes ?? []), [renovacoes]);

  const grupos = useMemo(() => {
    const q = busca.toLowerCase();
    const lista = docs.filter((d) => (filtro === "todos" || status(d) === filtro)
      && (!q || `${d.nome} ${d.orgao} ${d.numero ?? ""} ${d.responsavel ?? ""}`.toLowerCase().includes(q)));
    const g = new Map<string, Documento[]>();
    lista.forEach((d) => g.set(d.categoria, [...(g.get(d.categoria) ?? []), d]));
    return [...g.entries()];
  }, [docs, filtro, busca, status]);

  const categorias = useMemo(() => [...new Set(docs.map((d) => d.categoria))], [docs]);
  const fechar = () => { setAberto(null); setNovo(false); qc.invalidateQueries({ queryKey: ["documentos"] }); };

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-card px-2 py-1">
              <img src={logoAsset.url} alt="Posto Natal" className="h-9 w-auto object-contain" />
            </span>
            <span className="hidden font-display font-semibold sm:inline">Documentos</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-ink-foreground/70 sm:inline">{user.email}</span>
            <button onClick={sair} className="flex items-center gap-1 hover:text-accent"><LogOut className="h-4 w-4" /> Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {renovacoes === null && !isLoading && (
          <p className="mb-6 rounded-md border bg-muted p-3 text-sm text-muted-foreground">
            O fluxo de renovação ainda não está disponível: falta aplicar a atualização do banco de dados.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CARDS.map((s) => (
            <button key={s} onClick={() => setFiltro(filtro === s ? "todos" : s)}
              className={`rounded-lg border bg-card p-5 text-left transition hover:shadow-md ${filtro === s ? "ring-2 ring-ring" : ""}`}>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
              <p className="mt-3 font-display text-4xl font-bold">{contagem[s] ?? 0}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border bg-card p-5 lg:col-span-2">
            <h2 className="font-semibold">Alertas de vencimento</h2>
            <p className="text-xs text-muted-foreground">Faixas de 90, 60, 30, 15 e 7 dias. Documentos em renovação não aparecem aqui.</p>
            {alertas.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nada vencendo nos próximos 90 dias.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {alertas.map(([faixa, itens]) => (
                  <div key={faixa}>
                    <p className={`mb-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                      faixa === "vencido" ? "text-late" : faixa === 7 || faixa === 15 ? "text-warn" : "text-muted-foreground"}`}>
                      {FAIXA_LABEL(faixa)} · {itens.length}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {itens.map(({ doc, dias }) => (
                        <li key={doc.id}>
                          <button onClick={() => setAberto(doc)} className="flex w-full justify-between gap-4 text-left hover:underline">
                            <span>{doc.nome}</span>
                            <span className={dias < 0 ? "whitespace-nowrap font-semibold text-late" : "whitespace-nowrap text-muted-foreground"}>
                              {dias < 0 ? `vencido há ${-dias} dias` : dias === 0 ? "vence hoje" : `vence em ${dias} dias`}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            {abertas.size > 0 && (
              <div className="rounded-lg border bg-card p-5">
                <h2 className="font-semibold">Em renovação</h2>
                <ul className="mt-3 space-y-1 text-sm">
                  {docs.filter((d) => abertas.has(d.id)).map((d) => (
                    <li key={d.id}>
                      <button onClick={() => setAberto(d)} className="flex w-full justify-between gap-4 text-left hover:underline">
                        <span>{d.nome}</span>
                        <span className="whitespace-nowrap text-primary">{etapaLabel(abertas.get(d.id)!.etapa)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">Custos de regularização</h2>
              {custos.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Os custos aparecem aqui quando renovações forem concluídas.</p>
              ) : (
                <ul className="mt-3 space-y-1 text-sm">
                  {custos.map((c) => (
                    <li key={c.ano} className="flex justify-between">
                      <span>{c.ano} <span className="text-muted-foreground">· {c.qtd} {c.qtd === 1 ? "renovação" : "renovações"}</span></span>
                      <span className="font-medium">{brl(c.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`rounded-full border px-3 py-1 text-sm ${filtro === f ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                {f === "todos" ? "Todos" : STATUS_LABEL[f]} <span className="opacity-60">{contagem[f] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar documento, órgão, nº ou responsável" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Button onClick={() => setNovo(true)}><Plus className="h-4 w-4" /> Novo</Button>
          </div>
        </div>

        {isLoading ? <p className="mt-10 text-muted-foreground">Carregando…</p> : grupos.map(([cat, lista]) => (
          <section key={cat} className="mt-8">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{cat} · {lista.length}</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Documento</th>
                    <th className="hidden px-4 py-2 lg:table-cell">Responsável</th>
                    <th className="hidden px-4 py-2 md:table-cell">Vencimento</th>
                    <th className="hidden px-4 py-2 md:table-cell">Renovar em</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((d) => {
                    const s = status(d);
                    return (
                      <tr key={d.id} onClick={() => setAberto(d)} className="cursor-pointer border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-medium">{d.nome}{d.arquivo_path && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}</div>
                          <div className="text-xs text-muted-foreground">{d.orgao}{d.numero && ` · nº ${d.numero}`}</div>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">{d.responsavel ?? "—"}</td>
                        <td className="hidden px-4 py-3 md:table-cell">{fmt(parseDate(d.vencimento))}</td>
                        <td className="hidden px-4 py-3 md:table-cell">{fmt(renovarEm(d))}</td>
                        <td className="px-4 py-3"><span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>

      <Sheet open={!!aberto || novo} onOpenChange={(o) => { if (!o) { setAberto(null); setNovo(false); } }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {aberto && (
            <Editor key={aberto.id} doc={aberto} onSaved={fechar}
              renovacoes={renovacoes && renovacoes.filter((r) => r.documento_id === aberto.id)} />
          )}
          {novo && !aberto && (
            <NovoDocumento categorias={categorias} proximaOrdem={Math.max(0, ...docs.map((d) => d.ordem)) + 1} onSaved={fechar} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
