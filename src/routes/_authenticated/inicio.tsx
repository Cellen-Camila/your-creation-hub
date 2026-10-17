import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, RefreshCw, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { iconeDoModulo } from "@/components/layout/nav";
import { useDocumentos, useRenovacoes } from "@/lib/queries";
import { type Status, statusDe, parseDate, diasAte, fmt, STATUS_LABEL, STATUS_CLASS } from "@/lib/docs";
import { MODULOS, ROADMAP, progresso } from "@/lib/prd";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({ meta: [{ title: "Início — Posto Natal" }] }),
  component: Inicio,
});

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Indicador({ icone: Icone, rotulo, valor, detalhe, tom }: {
  icone: LucideIcon; rotulo: string; valor: string | number; detalhe: string; tom: "ok" | "warn" | "late" | "primary";
}) {
  const cores = { ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn", late: "bg-late-soft text-late", primary: "bg-primary/10 text-primary" }[tom];
  return (
    <Link to="/painel" className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{rotulo}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cores}`}><Icone className="h-4.5 w-4.5" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{valor}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>
    </Link>
  );
}

function Barra({ valor, className = "bg-ok" }: { valor: number; className?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.round(valor * 100)}%` }} />
    </div>
  );
}

function Inicio() {
  const { user } = Route.useRouteContext();
  const { data: docs = [], isLoading } = useDocumentos();
  const { data: renovacoes = null } = useRenovacoes();

  const resumo = useMemo(() => {
    const abertas = new Set((renovacoes ?? []).filter((r) => !r.concluida_em).map((r) => r.documento_id));
    const c: Partial<Record<Status, number>> = {};
    const comPrazo = docs.map((d) => ({ d, s: statusDe(d, undefined, abertas.has(d.id)) })).filter(({ s }) => s !== "sem_vencimento");
    comPrazo.forEach(({ s }) => { c[s] = (c[s] ?? 0) + 1; });
    const proximos = comPrazo
      .filter(({ d }) => d.vencimento)
      .map(({ d, s }) => ({ d, s, dias: diasAte(parseDate(d.vencimento))! }))
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 7);
    const emDia = c.em_dia ?? 0;
    return { c, total: comPrazo.length, emDia, saude: comPrazo.length ? emDia / comPrazo.length : 0, proximos };
  }, [docs, renovacoes]);

  const nome = user.email?.split("@")[0] ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={`${saudacao()}${nome ? `, ${nome}` : ""}`}
        description="Resumo do posto em uma tela: documentos, vencimentos e o andamento da plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador icone={CheckCircle2} tom="ok" rotulo="Documentos em dia" valor={isLoading ? "…" : `${Math.round(resumo.saude * 100)}%`}
          detalhe={`${resumo.emDia} de ${resumo.total} com prazo`} />
        <Indicador icone={CalendarClock} tom="warn" rotulo="Renovar agora" valor={resumo.c.renovar ?? 0} detalhe="Prazo de renovação já começou" />
        <Indicador icone={AlertTriangle} tom="late" rotulo="Vencidos" valor={resumo.c.vencido ?? 0} detalhe="Risco de multa ou interdição" />
        <Indicador icone={RefreshCw} tom="primary" rotulo="Em renovação" valor={resumo.c.em_renovacao ?? 0} detalhe="Processos em andamento" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">Próximos vencimentos</h2>
              <p className="text-xs text-muted-foreground">Os documentos que vencem primeiro</p>
            </div>
            <Link to="/painel" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {resumo.proximos.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">{isLoading ? "Carregando…" : "Nenhum documento com vencimento cadastrado. Preencha as datas em Licenças e documentos."}</p>
          ) : (
            <ul className="divide-y">
              {resumo.proximos.map(({ d, s, dias }) => (
                <li key={d.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.orgao} · vence {fmt(parseDate(d.vencimento))}</p>
                  </div>
                  <span className={`hidden whitespace-nowrap text-xs sm:block ${dias < 0 ? "font-semibold text-late" : "text-muted-foreground"}`}>
                    {dias < 0 ? `há ${-dias} dias` : dias === 0 ? "hoje" : `em ${dias} dias`}
                  </span>
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Andamento da plataforma</h2>
          <p className="text-xs text-muted-foreground">Requisitos do PRD entregues por fase</p>
          <div className="mt-5 space-y-5">
            {ROADMAP.map((f) => {
              const mods = MODULOS.filter((m) => m.fase === f.fase);
              const p = mods.length ? mods.reduce((s, m) => s + progresso(m) * m.requisitos.length, 0) / mods.reduce((s, m) => s + m.requisitos.length, 0) : 0;
              return (
                <div key={f.fase}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{f.nome}</span>
                    <span className="text-muted-foreground">{Math.round(p * 100)}%</span>
                  </div>
                  <Barra valor={p} className="bg-primary" />
                  <p className="mt-1 text-xs text-muted-foreground">{mods.map((m) => m.nome.split(",")[0]).join(" · ") || "Evoluções"} · {f.prazo}</p>
                </div>
              );
            })}
          </div>
          <Link to="/modulos" className="mt-6 flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver plano completo <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Módulos</h2>
            <p className="text-sm text-muted-foreground">Cada área do posto em um módulo</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {MODULOS.map((m) => {
            const Icone = iconeDoModulo(m.slug);
            const p = progresso(m);
            const conteudo = (
              <>
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${p > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icone className="h-5 w-5" />
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p > 0 ? "bg-ok-soft text-ok" : "bg-muted text-muted-foreground"}`}>
                    {p > 0 ? "Em uso" : m.fase ? `Fase ${m.fase}` : "A definir"}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug">{m.nome}</p>
                <div className="mt-3"><Barra valor={p} /></div>
              </>
            );
            const cls = "rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
            return m.rota ? (
              <Link key={m.slug} to={m.rota} className={cls}>{conteudo}</Link>
            ) : (
              <Link key={m.slug} to="/modulos/$modulo" params={{ modulo: m.slug }} className={cls}>{conteudo}</Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
