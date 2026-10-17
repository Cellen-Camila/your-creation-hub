import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { type Documento, type Renovacao as RenovacaoRow, renovarEm, fmt } from "@/lib/docs";
import { abrirArquivo, nomeSeguro } from "@/lib/arquivos";
import { Renovacao } from "./Renovacao";

export function Editor({ doc, renovacoes, onSaved }: { doc: Documento; renovacoes: RenovacaoRow[] | null; onSaved: () => void }) {
  const [numero, setNumero] = useState(doc.numero ?? "");
  const [responsavel, setResponsavel] = useState(doc.responsavel ?? "");
  const [custo, setCusto] = useState(doc.custo_renovacao?.toString() ?? "");
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
        const path = `${doc.id}/${Date.now()}-${nomeSeguro(arquivo.name)}`;
        const { error } = await supabase.storage.from("documentos").upload(path, arquivo);
        if (error) throw error;
        if (doc.arquivo_path) await supabase.storage.from("documentos").remove([doc.arquivo_path]);
        arquivo_path = path;
        arquivo_nome = arquivo.name;
      }
      const { error } = await supabase.from("documentos").update({
        numero: numero || null,
        responsavel: responsavel || null,
        custo_renovacao: custo === "" ? null : Number(custo),
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

  return (
    <div className="space-y-5 pb-8">
      <SheetHeader className="p-0">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{doc.categoria}</p>
        <SheetTitle className="text-left font-display text-xl">{doc.nome}</SheetTitle>
      </SheetHeader>
      <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted p-4 text-sm">
        <div><dt className="text-xs text-muted-foreground">Órgão</dt><dd>{doc.orgao}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Base legal</dt><dd>{doc.base_legal ?? "—"}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Tipo de prazo</dt><dd>{doc.tipo_prazo}</dd></div>
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Validade típica</dt><dd>{doc.validade_tipica ?? "—"}</dd></div>
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Número do documento</Label><Input value={numero} onChange={(e) => setNumero(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Responsável</Label><Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></div>
        {!semPrazo && (
          <div className="col-span-2 space-y-1.5">
            <Label>Custo estimado da renovação (R$)</Label>
            <Input type="number" min={0} step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} />
          </div>
        )}
      </div>

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

      {!semPrazo && renovacoes && <Renovacao doc={doc} renovacoes={renovacoes} onConcluida={onSaved} />}

      <div className="space-y-1.5">
        <Label>Arquivo do documento</Label>
        {doc.arquivo_path && (
          <button onClick={() => abrirArquivo(doc.arquivo_path!)} className="flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm hover:bg-muted">
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
