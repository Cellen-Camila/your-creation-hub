import { createFileRoute, Link } from "@tanstack/react-router";
import { Fuel, ShieldCheck, Bell, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Posto Natal — Documentos e Licenças em dia" },
      { name: "description", content: "Plataforma da equipe do Posto Natal para controlar vencimentos de licenças, certidões e laudos." },
      { property: "og:title", content: "Posto Natal — Documentos e Licenças em dia" },
      { property: "og:description", content: "Controle de vencimentos, arquivos e alertas de renovação para o Posto Natal." },
    ],
  }),
  component: Index,
});

function Index() {
  const itens = [
    { icon: ShieldCheck, t: "38 documentos mapeados", d: "ANP, prefeitura, SEMACE, bombeiros, certidões e mais." },
    { icon: Bell, t: "Data de renovação automática", d: "Vencimento menos a antecedência recomendada." },
    { icon: FolderOpen, t: "Arquivos guardados", d: "Anexe o PDF ou foto de cada documento." },
  ];
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground"><Fuel className="h-5 w-5" /></span>
          Posto Natal
        </div>
        <Link to="/auth" className="rounded-md border border-ink-foreground/30 px-4 py-2 text-sm font-medium hover:bg-ink-foreground/10">Entrar</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="font-display text-sm uppercase tracking-[0.25em] text-accent">Documentos e licenças</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">Nenhuma licença vencida no posto.</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-foreground/70">Toda a papelada de funcionamento em um só painel, com a data certa para começar cada renovação.</p>
        <Link to="/auth" className="mt-10 inline-flex rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90">Acessar o painel</Link>
        <div className="mt-24 grid gap-px overflow-hidden rounded-lg bg-ink-foreground/15 md:grid-cols-3">
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
