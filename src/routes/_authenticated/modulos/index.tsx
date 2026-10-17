import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { MODULOS, ROADMAP, OBJETIVOS, PERFIS, INTEGRACOES, progresso, situacaoDe } from "@/lib/prd";

export const Route = createFileRoute("/_authenticated/modulos/")({
  head: () => ({ meta: [{ title: "Módulos — Posto Natal" }, { name: "description", content: "Módulos da plataforma de gestão do posto." }] }),
  component: Modulos,
});

const faseLabel = (f: number | null) => (f ? `Fase ${f}` : "Fase a definir");

function Barra({ valor }: { valor: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-ok" style={{ width: `${Math.round(valor * 100)}%` }} />
    </div>
  );
}

function Modulos() {
  const { user } = Route.useRouteContext();
  const todos = MODULOS.flatMap((m) => m.requisitos);
  const prontos = todos.filter((r) => situacaoDe(r.id).situacao === "pronto").length;
  const parciais = todos.filter((r) => situacaoDe(r.id).situacao === "parcial").length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">PRD v1.0 · 16/10/2026</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Plataforma de Gestão Integrada do Posto</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Toda a gestão do posto em um só lugar: pista, combustíveis, pessoas, rotinas administrativas, documentos, finanças,
          conveniência, estoques e compras. O Linx/Webposto continua cuidando da parte fiscal.
        </p>
        <p className="mt-4 text-sm">
          <strong>{prontos}</strong> de {todos.length} requisitos prontos{parciais > 0 && <>, <strong>{parciais}</strong> parcial</>}.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m) => {
            const p = progresso(m);
            return (
              <Link key={m.slug} to="/modulos/$modulo" params={{ modulo: m.slug }}
                className="flex flex-col rounded-lg border bg-card p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{m.nome}</h2>
                  <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${p > 0 ? "bg-ok-soft text-ok" : "bg-muted text-muted-foreground"}`}>
                    {p > 0 ? "Em uso" : faseLabel(m.fase)}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{m.escopo}</p>
                <div className="mt-4 space-y-1.5">
                  <Barra valor={p} />
                  <p className="text-xs text-muted-foreground">
                    {m.requisitos.length} requisitos · {m.requisitos.filter((r) => r.prioridade === "Alta").length} de prioridade alta
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Roadmap</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {ROADMAP.map((f) => (
              <div key={f.fase} className="rounded-lg border bg-card p-5">
                <p className="font-semibold">{f.nome}</p>
                <p className="text-xs text-muted-foreground">{f.prazo}</p>
                <p className="mt-3 text-sm">{f.conteudo}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Critério de aceite de cada fase: rotina executada por 30 dias no sistema, sem planilha paralela, com validação da gerência e do contador.
          </p>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Objetivos em 12 meses</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {OBJETIVOS.map((o) => (
                    <tr key={o.objetivo} className="border-t first:border-t-0">
                      <td className="px-4 py-3">{o.objetivo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.meta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Perfis de acesso</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {PERFIS.map((p) => (
                    <tr key={p.perfil} className="border-t first:border-t-0">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{p.perfil}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.necessidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Ações sensíveis (estorno, ajuste de estoque, abono de ponto, baixa de título) exigem aprovação do Gerente e ficam na trilha de auditoria.
            </p>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Integrações</h2>
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-2">Sistema</th><th className="hidden px-4 py-2 md:table-cell">Dados trocados</th><th className="px-4 py-2">Fase</th></tr>
              </thead>
              <tbody>
                {INTEGRACOES.map((i) => (
                  <tr key={i.sistema} className="border-t">
                    <td className="px-4 py-3 font-medium">{i.sistema}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{i.dados}</td>
                    <td className="px-4 py-3">{i.fase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Fora da versão 1: emissão de NF-e/NFC-e e PDV (ficam no Linx/Webposto); folha e eSocial (ficam na contabilidade); automação de bombas em tempo real (fase 3).
          </p>
        </section>
      </main>
    </div>
  );
}
