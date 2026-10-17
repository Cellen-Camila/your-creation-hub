import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, FileCheck2, Fuel, Users, Wallet, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Posto Natal — Gestão integrada do posto" },
      { name: "description", content: "Plataforma do Posto Natal: pista, combustíveis, licenças, pessoas, finanças e conveniência em um só lugar." },
      { property: "og:title", content: "Posto Natal — Gestão integrada do posto" },
      { property: "og:description", content: "Pista, combustíveis, licenças, pessoas, finanças e conveniência em uma só plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const itens = [
    { icon: FileCheck2, t: "Licenças e documentos", d: "Vencimentos, alertas e renovação por etapas de cada alvará, laudo e certidão." },
    { icon: Fuel, t: "Pista e combustíveis", d: "Turnos, caixa por frentista, medições de tanque e LMC." },
    { icon: Wallet, t: "Financeiro", d: "Contas a pagar e receber, conciliação bancária e de cartões." },
    { icon: Users, t: "Pessoas", d: "Ponto, escalas, atestados, uniformes e EPI." },
    { icon: ShoppingBag, t: "Loja e estoques", d: "Entrada de notas, precificação, avarias e pedidos." },
    { icon: BarChart3, t: "Visão gerencial", d: "Indicadores e alertas do posto em uma tela." },
  ];
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/auth" className="rounded-md border border-ink-foreground/30 px-4 py-2 text-sm font-medium hover:bg-ink-foreground/10">Entrar</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="font-display text-sm uppercase tracking-[0.25em] text-accent">Gestão integrada do posto</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">O posto inteiro em uma só plataforma.</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-foreground/70">
          Operação, documentos, pessoas e finanças organizados em módulos, com alertas antes que algo vença, falte ou atrase.
        </p>
        <Link to="/auth" className="mt-10 inline-flex rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90">Acessar a plataforma</Link>
        <div className="mt-24 grid gap-px overflow-hidden rounded-xl bg-ink-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map(({ icon: I, t, d }) => (
            <div key={t} className="bg-ink p-8">
              <I className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-ink-foreground/65">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
