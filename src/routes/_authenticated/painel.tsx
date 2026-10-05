import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Fuel, LogOut, Paperclip, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  type Documento, type Status, statusDe, renovarEm, parseDate, diasAte, fmt, STATUS_LABEL, STATUS_CLASS,
} from "@/lib/docs";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — Posto Natal" },
      { name: "description", content: "Painel de vencimentos de documentos e licenças." },
      { property: "og:title", content: "Painel — Posto Natal" },
      { property: "og:description", content: "Painel de vencimentos de documentos e licenças." },
    ],
  }),
  component: Painel,
});

const FILTROS: (Status | "todos")[] = ["todos", "vencido", "renovar", "pendente", "em_dia", "sem_vencimento"];

function Painel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [filtro, setFiltro] = useState<Status | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Documento | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documentos").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: docs.length };
    docs.forEach((d) => { const s = statusDe(d); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [docs]);

  const proximos = useMemo(
    () => docs.filter((d) => ["vencido", "renovar"].includes(statusDe(d)))
      .sort((a, b) => (parseDate(a.vencimento)!.getTime() - parseDate(b.vencimento)!.getTime())),
    [docs],
  );

  const grupos = useMemo(() => {
    const q = busca.toLowerCase();
    const lista = docs.filter((d) => (filtro === "todos" || statusDe(d) === filtro) && (!q || `${d.nome} ${d.orgao}`.toLowerCase().includes(q)));
    const g = new Map<string, Documento[]>();
    lista.forEach((d) => g.set(d.categoria, [...(g.get(d.categoria) ?? []), d]));
    return [...g.entries()];
  }, [docs, filtro, busca]);

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
          <div className="flex items-center gap-2 font-display font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground"><Fuel className="h-4 w-4" /></span>
            Posto Natal · Documentos
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-ink-foreground/70 sm:inline">{user.email}</span>
            <button onClick={sair} className="flex items-center gap-1 hover:text-accent"><LogOut className="h-4 w-4" /> Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["vencido", "renovar", "pendente", "em_dia"] as Status[]).map((s) => (
            <button key={s} onClick={() => setFiltro(filtro === s ? "todos" : s)}
              className={`rounded-lg border bg-card p-5 text-left transition hover:shadow-md ${filtro === s ? "ring-2 ring-ring" : ""}`}>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
              <p className="mt-3 font-display text-4xl font-bold">{contagem[s] ?? 0}</p>
            </button>
          ))}
        </div>

        {proximos.length > 0 && (
          <section className="mt-8 rounded-lg border border-warn/40 bg-warn-soft p-5">
            <h2 className="font-semibold">Precisa de atenção</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {proximos.map((d) => {
                const dias = diasAte(parseDate(d.vencimento));
                return (
                  <li key={d.id}>
                    <button onClick={() => setAberto(d)} className="flex w-full justify-between gap-4 text-left hover:underline">
                      <span>{d.nome}</span>
                      <span className={dias! < 0 ? "font-semibold text-late" : "text-warn"}>
                        {dias! < 0 ? `vencido há ${-dias!} dias` : `vence em ${dias} dias`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`rounded-full border px-3 py-1 text-sm ${filtro === f ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                {f === "todos" ? "Todos" : STATUS_LABEL[f]} <span className="opacity-60">{contagem[f] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar documento ou órgão" value={busca} onChange={(e) => setBusca(e.target.value)} />
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
                    <th className="hidden px-4 py-2 md:table-cell">Vencimento</th>
                    <th className="hidden px-4 py-2 md:table-cell">Renovar em</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((d) => {
                    const s = statusDe(d);
                    return (
                      <tr key={d.id} onClick={() => setAberto(d)} className="cursor-pointer border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-medium">{d.nome}{d.arquivo_path && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}</div>
                          <div className="text-xs text-muted-foreground">{d.orgao}</div>
                        </td>
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

      <Sheet open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {aberto && <Editor key={aberto.id} doc={aberto} onSaved={() => { setAberto(null); qc.invalidateQueries({ queryKey: ["documentos"] }); }} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Editor({ doc, onSaved }: { doc: Documento; onSaved: () => void }) {
  const [emissao, setEmissao] = useState(doc.emissao ?? "");
  const [vencimento, setVencimento] = useState(doc.vencimento ?? "");
  const [antec, setAntec] = useState(doc.antecedencia_dias?.toString() ?? "");
  const [obs, setObs] = useState(doc.observacoes ?? "");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const semPrazo = doc.tipo_prazo === "Sem vencimento" || doc.tipo_prazo === "Rotina contínua";

  async function salvar() {
    setSalvando(true);
    try {
      let arquivo_path = doc.arquivo_path;
      let arquivo_nome = doc.arquivo_nome;
      if (arquivo) {
        const path = `${doc.id}/${Date.now()}-${arquivo.name.replace(/[^\w.\-]/g, "_")}`;
        const { error } = await supabase.storage.from("documentos").upload(path, arquivo);
        if (error) throw error;
        if (doc.arquivo_path) await supabase.storage.from("documentos").remove([doc.arquivo_path]);
        arquivo_path = path;
        arquivo_nome = arquivo.name;
      }
      const { error } = await supabase.from("documentos").update({
        emissao: emissao || null,
        vencimento: vencimento || null,
        antecedencia_dias: antec === "" ? null : Number(antec),
        observacoes: obs || null,
        arquivo_path, arquivo_nome,
      }).eq("id", doc.id);
      if (error) throw error;
      toast.success("Documento atualizado");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function baixar() {
    if (!doc.arquivo_path) return;
    const { data, error } = await supabase.storage.from("documentos").createSignedUrl(doc.arquivo_path, 120);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-5 pb-8">
      <SheetHeader className="p-0">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{doc.categoria}</p>
        <SheetTitle className="text-left font-display text-xl">{doc.nome}</SheetTitle>
      </SheetHeader>
      <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted p-4 text-sm">
        <div><dt className="text-xs text-muted-foreground">Órgão</dt><dd>{doc.orgao}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Base legal</dt><dd>{doc.base_legal}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Tipo de prazo</dt><dd>{doc.tipo_prazo}</dd></div>
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Validade típica</dt><dd>{doc.validade_tipica}</dd></div>
      </dl>

      {!semPrazo && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Emissão</Label><Input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Vencimento</Label><Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></div>
          <div className="col-span-2 space-y-1.5">
            <Label>Antecedência para renovar (dias)</Label>
            <Input type="number" min={0} value={antec} onChange={(e) => setAntec(e.target.value)} />
            <p className="text-xs text-muted-foreground">Renovar em: <strong>{fmt(renovarEm({ ...doc, vencimento: vencimento || null, antecedencia_dias: antec === "" ? null : Number(antec) }))}</strong></p>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Arquivo do documento</Label>
        {doc.arquivo_path && (
          <button onClick={baixar} className="flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm hover:bg-muted">
            <Download className="h-4 w-4" /> {doc.arquivo_nome}
          </button>
        )}
        <Input type="file" accept=".pdf,image/*" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
      </div>

      <div className="space-y-1.5"><Label>Observações</Label><Textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)} /></div>
      <Button className="w-full" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
    </div>
  );
}
