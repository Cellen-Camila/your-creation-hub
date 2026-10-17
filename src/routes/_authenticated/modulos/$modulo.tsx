import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { iconeDoModulo } from "@/components/layout/nav";
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
  const { modulo: m } = Route.useLoaderData();
  const p = Math.round(progresso(m) * 100);
  const Icone = iconeDoModulo(m.slug);

  return (
    <>
      <Link to="/modulos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Plano do produto
      </Link>

      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <Icone className="h-4 w-4" /> {m.fase ? `Fase ${m.fase}` : "Fase a definir no roadmap"}
          </span>
        }
        title={m.nome}
        description={m.escopo}
        actions={m.rota && <Button asChild><Link to={m.rota}>Abrir módulo <ArrowRight className="h-4 w-4" /></Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { rotulo: "Requisitos", valor: m.requisitos.length },
          { rotulo: "Prioridade alta (MVP)", valor: m.requisitos.filter((r) => r.prioridade === "Alta").length },
          { rotulo: "Prontos", valor: m.requisitos.filter((r) => situacaoDe(r.id).situacao === "pronto").length },
          { rotulo: "Progresso", valor: `${p}%` },
        ].map((c) => (
          <div key={c.rotulo} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{c.rotulo}</p>
            <p className="mt-2 font-display text-3xl font-bold">{c.valor}</p>
          </div>
        ))}
      </div>

      {!m.rota && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-dashed bg-card p-6 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Construction className="h-6 w-6" /></span>
          <div>
            <p className="font-semibold">Módulo em planejamento</p>
            <p className="text-sm text-muted-foreground">
              As telas deste módulo ainda serão construídas, seguindo os requisitos abaixo. Os de prioridade alta entram primeiro.
            </p>
          </div>
        </div>
      )}

      {m.kpis.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Indicadores acompanhados:</span>
          {m.kpis.map((k) => <span key={k} className="rounded-full border bg-card px-3 py-1 shadow-sm">{k}</span>)}
        </div>
      )}

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Requisitos</h2>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
    </>
  );
}
