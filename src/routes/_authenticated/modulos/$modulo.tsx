import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { MODULOS, PRIORIDADE_CLASS, SITUACAO_CLASS, SITUACAO_LABEL, progresso, situacaoDe } from "@/lib/prd";

export const Route = createFileRoute("/_authenticated/modulos/$modulo")({
  loader: ({ params }) => {
    const modulo = MODULOS.find((m) => m.slug === params.modulo);
    if (!modulo) throw notFound();
    return { modulo };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.modulo.nome ?? "Módulo"} — Posto Natal` }] }),
  component: ModuloDetalhe,
});

function ModuloDetalhe() {
  const { user } = Route.useRouteContext();
  const { modulo: m } = Route.useLoaderData();
  const p = Math.round(progresso(m) * 100);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/modulos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Módulos
        </Link>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {m.fase ? `Fase ${m.fase}` : "Fase a definir no roadmap"} · {p}% pronto
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">{m.nome}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{m.escopo}</p>
          </div>
          {m.rota ? (
            <Button asChild><Link to={m.rota}>Abrir módulo</Link></Button>
          ) : (
            <span className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">Telas ainda não construídas</span>
          )}
        </div>

        {m.kpis.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Indicadores:</span>
            {m.kpis.map((k) => <span key={k} className="rounded-full border bg-card px-3 py-1">{k}</span>)}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Requisito</th>
                <th className="hidden px-4 py-2 sm:table-cell">Prioridade</th>
                <th className="px-4 py-2">Situação</th>
              </tr>
            </thead>
            <tbody>
              {m.requisitos.map((r) => {
                const s = situacaoDe(r.id);
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3">
                      {r.texto}
                      {"nota" in s && s.nota && <span className="mt-1 block text-xs text-muted-foreground">{s.nota}</span>}
                      <span className={`mt-1 block text-xs sm:hidden ${PRIORIDADE_CLASS[r.prioridade]}`}>Prioridade {r.prioridade.toLowerCase()}</span>
                    </td>
                    <td className={`hidden px-4 py-3 sm:table-cell ${PRIORIDADE_CLASS[r.prioridade]}`}>{r.prioridade}</td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${SITUACAO_CLASS[s.situacao]}`}>{SITUACAO_LABEL[s.situacao]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Prioridade alta = obrigatório no MVP; média = segunda entrega; baixa = evolução futura.</p>
      </main>
    </div>
  );
}
