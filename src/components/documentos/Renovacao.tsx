import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Documento, type Renovacao as RenovacaoRow, ETAPAS, etapaLabel, proximaEtapa, parseDate, fmt, brl,
} from "@/lib/docs";
import { abrirArquivo, nomeSeguro } from "@/lib/arquivos";

/** PRD LIC-03 e LIC-05: fluxo de renovação por etapas e histórico do documento. */
export function Renovacao({ doc, renovacoes, onConcluida }: { doc: Documento; renovacoes: RenovacaoRow[]; onConcluida: () => void }) {
  const qc = useQueryClient();
  const aberta = renovacoes.find((r) => !r.concluida_em) ?? null;
  const historico = renovacoes.filter((r) => r.concluida_em);
  const [ocupado, setOcupado] = useState(false);

  async function iniciar() {
    setOcupado(true);
    const { error } = await supabase.from("renovacoes").insert({ documento_id: doc.id, custo: doc.custo_renovacao });
    setOcupado(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Renovação iniciada");
    qc.invalidateQueries({ queryKey: ["renovacoes"] });
  }

  return (
    <section className="space-y-3 rounded-md border p-4">
      <h3 className="font-semibold">Renovação</h3>
      {aberta ? (
        <EmAndamento key={aberta.id + aberta.etapa} renovacao={aberta} onConcluida={onConcluida} />
      ) : (
        <Button variant="outline" className="w-full" onClick={iniciar} disabled={ocupado}>
          {ocupado ? "Iniciando…" : "Iniciar renovação"}
        </Button>
      )}

      {historico.length > 0 && (
        <div className="pt-2">
          <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">Histórico</p>
          <ul className="divide-y rounded-md border text-sm">
            {historico.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span>
                  Concluída em {fmt(parseDate(r.concluida_em))}
                  <span className="block text-xs text-muted-foreground">
                    Vencimento {fmt(parseDate(r.vencimento_anterior))} → {fmt(parseDate(r.novo_vencimento))}
                    {r.protocolo && ` · protocolo ${r.protocolo}`}
                  </span>
                </span>
                <span className="whitespace-nowrap font-medium">{brl(r.custo)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function EmAndamento({ renovacao, onConcluida }: { renovacao: RenovacaoRow; onConcluida: () => void }) {
  const qc = useQueryClient();
  const [protocolo, setProtocolo] = useState(renovacao.protocolo ?? "");
  const [custo, setCusto] = useState(renovacao.custo?.toString() ?? "");
  const [emissao, setEmissao] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const atual = ETAPAS.findIndex((e) => e.id === renovacao.etapa);
  const ultima = atual === ETAPAS.length - 1;

  const { data: anexos = [] } = useQuery({
    queryKey: ["renovacao_anexos", renovacao.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("renovacao_anexos").select("*").eq("renovacao_id", renovacao.id).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  async function executar(acao: () => Promise<void>, sucesso: string) {
    setOcupado(true);
    try {
      if (arquivo) {
        const path = `renovacoes/${renovacao.id}/${Date.now()}-${nomeSeguro(arquivo.name)}`;
        const up = await supabase.storage.from("documentos").upload(path, arquivo);
        if (up.error) throw up.error;
        const { error } = await supabase.from("renovacao_anexos").insert({
          renovacao_id: renovacao.id, etapa: renovacao.etapa, arquivo_path: path, arquivo_nome: arquivo.name,
        });
        if (error) throw error;
      }
      await acao();
      toast.success(sucesso);
      qc.invalidateQueries({ queryKey: ["renovacoes"] });
      qc.invalidateQueries({ queryKey: ["renovacao_anexos", renovacao.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setOcupado(false);
    }
  }

  const camposComuns = { protocolo: protocolo || null, custo: custo === "" ? null : Number(custo) };

  const salvar = () => executar(async () => {
    const { error } = await supabase.from("renovacoes").update(camposComuns).eq("id", renovacao.id);
    if (error) throw error;
  }, "Renovação atualizada");

  const avancar = () => executar(async () => {
    const { error } = await supabase.from("renovacoes").update({ ...camposComuns, etapa: proximaEtapa(renovacao.etapa) }).eq("id", renovacao.id);
    if (error) throw error;
  }, `Etapa "${etapaLabel(renovacao.etapa)}" concluída`);

  const concluir = () => {
    if (!vencimento) { toast.error("Informe o novo vencimento"); return; }
    return executar(async () => {
      const up = await supabase.from("renovacoes").update({ protocolo: camposComuns.protocolo }).eq("id", renovacao.id);
      if (up.error) throw up.error;
      const { error } = await supabase.rpc("concluir_renovacao", {
        p_renovacao: renovacao.id, p_emissao: emissao || null, p_vencimento: vencimento, p_custo: camposComuns.custo,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["documentos"] });
      onConcluida();
    }, "Renovação concluída e vencimento atualizado");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Iniciada em {fmt(parseDate(renovacao.iniciada_em))}</p>
      <ol className="space-y-2">
        {ETAPAS.map((e, i) => {
          const feita = i < atual;
          const daEtapa = anexos.filter((a) => a.etapa === e.id);
          return (
            <li key={e.id} className="flex gap-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                feita ? "bg-ok text-white" : i === atual ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {feita ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className={i === atual ? "font-semibold" : feita ? "" : "text-muted-foreground"}>{e.label}</p>
                {daEtapa.map((a) => (
                  <button key={a.id} onClick={() => abrirArquivo(a.arquivo_path)} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                    <Paperclip className="h-3 w-3" /> {a.arquivo_nome}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Nº do protocolo</Label><Input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Custo (R$)</Label><Input type="number" min={0} step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} /></div>
      </div>

      <div className="space-y-1.5">
        <Label>Anexo desta etapa ({etapaLabel(renovacao.etapa)})</Label>
        <Input type="file" accept=".pdf,image/*" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
      </div>

      {ultima && (
        <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3">
          <p className="col-span-2 text-xs text-muted-foreground">Documento novo emitido? Informe as datas para concluir. O vencimento do documento será atualizado.</p>
          <div className="space-y-1.5"><Label>Nova emissão</Label><Input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Novo vencimento</Label><Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={salvar} disabled={ocupado}>Salvar</Button>
        {ultima ? (
          <Button className="flex-1" onClick={concluir} disabled={ocupado}>Concluir renovação</Button>
        ) : (
          <Button className="flex-1" onClick={avancar} disabled={ocupado}>Concluir etapa</Button>
        )}
      </div>
      {ultima && (
        <p className="text-xs text-muted-foreground">Depois de concluir, envie o documento novo no campo "Arquivo do documento".</p>
      )}
    </div>
  );
}
