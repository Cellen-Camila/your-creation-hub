import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

const TIPOS_PRAZO = ["Prazo fixo", "Prazo no documento", "Sem vencimento", "Rotina contínua"];

/** PRD LIC-01: cadastro de documentos além da lista inicial. */
export function NovoDocumento({ categorias, proximaOrdem, onSaved }: { categorias: string[]; proximaOrdem: number; onSaved: () => void }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [orgao, setOrgao] = useState("");
  const [tipoPrazo, setTipoPrazo] = useState("Prazo fixo");
  const [numero, setNumero] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [antec, setAntec] = useState("30");
  const [salvando, setSalvando] = useState(false);
  const semPrazo = tipoPrazo === "Sem vencimento" || tipoPrazo === "Rotina contínua";

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from("documentos").insert({
      nome: nome.trim(), categoria: categoria.trim(), orgao: orgao.trim(), tipo_prazo: tipoPrazo,
      numero: numero || null, responsavel: responsavel || null, ordem: proximaOrdem,
      vencimento: semPrazo ? null : vencimento || null,
      antecedencia_dias: semPrazo || antec === "" ? null : Number(antec),
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento cadastrado");
    onSaved();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 pb-8">
      <SheetHeader className="p-0"><SheetTitle className="text-left font-display text-xl">Novo documento</SheetTitle></SheetHeader>
      <div className="space-y-1.5"><Label>Nome</Label><Input required value={nome} onChange={(e) => setNome(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Input required list="categorias-doc" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <datalist id="categorias-doc">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="space-y-1.5"><Label>Órgão emissor</Label><Input required value={orgao} onChange={(e) => setOrgao(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Número</Label><Input value={numero} onChange={(e) => setNumero(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Responsável</Label><Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5">
        <Label>Tipo de prazo</Label>
        <select value={tipoPrazo} onChange={(e) => setTipoPrazo(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
          {TIPOS_PRAZO.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      {!semPrazo && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Vencimento</Label><Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Antecedência (dias)</Label><Input type="number" min={0} value={antec} onChange={(e) => setAntec(e.target.value)} /></div>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={salvando}>{salvando ? "Salvando…" : "Cadastrar"}</Button>
    </form>
  );
}
