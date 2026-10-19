import { useRef, useState } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  checklistSchema,
  hojeISO,
  PERGUNTAS,
  type ChecklistForm,
  type ChecklistValido,
} from "@/lib/checklist";
import { enviarChecklist, tabelaAusente } from "@/lib/conveniencia";
import { CodigosChecklist, type CodigoForm, type CodigosHandle } from "./CodigosChecklist";
import { MSG_SEM_TABELA } from "./Estados";
import { FotosChecklist } from "./FotosChecklist";

const MSG_ERRO = "Não foi possível enviar. Nada foi gravado. Tente de novo.";

const campoClass = "text-base md:text-sm";
// Glow da marca (visual.md, brand-glow) a partir de --primary.
const glow =
  "shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_45%,transparent),0_8px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] disabled:shadow-none";

const valoresIniciais = (): DefaultValues<ChecklistForm> => ({
  data: hojeISO(),
  funcionaria: "",
  codigos: [],
});

function Erro({ id, msg }: { id: string; msg?: string | undefined }) {
  if (!msg) return null;
  return (
    <p id={id} className="text-sm text-late">
      {msg}
    </p>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

type CampoTexto =
  | "pedidos_fornecedor"
  | "mercadoria_recebida"
  | "avariados_vencidos"
  | "mercadorias_trocadas"
  | "contagens"
  | "outras_informacoes"
  | "a_fazer";

export function FormChecklist() {
  const qc = useQueryClient();
  const form = useForm<ChecklistForm, unknown, ChecklistValido>({
    resolver: zodResolver(checklistSchema),
    defaultValues: valoresIniciais(),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors, submitCount } = formState;
  const [fotos, setFotos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const trava = useRef(false);
  const codigos = useRef<CodigosHandle>(null);
  // Muda após o envio: recria o bloco de códigos e descarta o rascunho dele.
  const [versao, setVersao] = useState(0);

  const texto = (nome: CampoTexto, rotulo: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={nome}>{rotulo}</Label>
      <Textarea id={nome} rows={3} className={campoClass} disabled={enviando} {...register(nome)} />
    </div>
  );

  const pergunta = (p: (typeof PERGUNTAS)[number]) => {
    const rid = `q-${p.chave}`;
    const msg = errors[p.chave]?.message;
    return (
      <div key={p.chave} className="space-y-2 rounded-lg border p-3">
        <p id={`${rid}-rotulo`} className="text-sm font-medium">
          {p.rotulo}
        </p>
        <Controller
          control={control}
          name={p.chave}
          render={({ field }) => (
            <RadioGroup
              aria-labelledby={`${rid}-rotulo`}
              aria-invalid={msg ? true : undefined}
              aria-describedby={msg ? `${rid}-erro` : undefined}
              className="flex gap-6"
              disabled={enviando}
              value={field.value === undefined ? "" : field.value ? "sim" : "nao"}
              onValueChange={(v) => field.onChange(v === "sim")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem ref={field.ref} id={`${rid}-sim`} value="sim" />
                <Label htmlFor={`${rid}-sim`}>Sim</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id={`${rid}-nao`} value="nao" />
                <Label htmlFor={`${rid}-nao`}>Não</Label>
              </div>
            </RadioGroup>
          )}
        />
        <Erro id={`${rid}-erro`} msg={msg} />
        <Input
          aria-label={`Observação: ${p.rotulo}`}
          placeholder="Observação (opcional)"
          className={campoClass}
          disabled={enviando}
          {...register(`${p.chave}_obs`)}
        />
      </div>
    );
  };

  const aoEnviar = handleSubmit(async (valido) => {
    setEnviando(true);
    setFalha(null);
    try {
      await enviarChecklist(valido, fotos);
    } catch (err) {
      setFalha(tabelaAusente(err) ? MSG_SEM_TABELA : MSG_ERRO);
      toast.error(tabelaAusente(err) ? MSG_SEM_TABELA : MSG_ERRO);
      return;
    }
    toast.success("Checklist enviado");
    reset(valoresIniciais());
    setFotos([]);
    setVersao((v) => v + 1);
    void qc.invalidateQueries({ queryKey: ["checklists"] });
    void qc.invalidateQueries({ queryKey: ["checklist_codigos"] });
  });

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (trava.current) return;
    if (codigos.current && !codigos.current.verificarRascunho()) return;
    trava.current = true;
    try {
      await aoEnviar();
    } finally {
      trava.current = false;
      setEnviando(false);
    }
  }

  const erroData = errors.data?.message;
  const erroNome = errors.funcionaria?.message;
  const nErros = Object.keys(errors).length;

  return (
    <form onSubmit={submeter} noValidate className="space-y-4">
      <Secao titulo="Cabeçalho">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              max={hojeISO()}
              className={campoClass}
              disabled={enviando}
              aria-invalid={erroData ? true : undefined}
              aria-describedby={erroData ? "data-erro" : undefined}
              {...register("data")}
            />
            <Erro id="data-erro" msg={erroData} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="funcionaria">Nome da funcionária</Label>
            <Input
              id="funcionaria"
              autoComplete="name"
              className={campoClass}
              disabled={enviando}
              aria-invalid={erroNome ? true : undefined}
              aria-describedby={erroNome ? "funcionaria-erro" : undefined}
              {...register("funcionaria")}
            />
            <Erro id="funcionaria-erro" msg={erroNome} />
          </div>
        </div>
      </Secao>

      <Secao titulo="Operacional">
        {texto("pedidos_fornecedor", "Pedidos realizados ao fornecedor")}
        {texto("mercadoria_recebida", "Mercadoria recebida do fornecedor")}
        {PERGUNTAS.filter((p) => p.grupo === "operacional").map(pergunta)}
        {texto("avariados_vencidos", "Códigos de produtos avariados/vencidos")}
        {texto("mercadorias_trocadas", "Mercadorias trocadas")}
      </Secao>

      <Secao titulo="Manutenção da loja">
        {PERGUNTAS.filter((p) => p.grupo === "manutencao").map(pergunta)}
      </Secao>

      <Secao titulo="Contagens e outras informações">
        {texto("contagens", "Contagens")}
        {texto("outras_informacoes", "Outras informações")}
      </Secao>

      <Secao titulo="Fotos do que foi feito">
        <FotosChecklist value={fotos} onChange={setFotos} disabled={enviando} />
      </Secao>

      <Secao titulo="O que precisa ser feito">{texto("a_fazer", "Recado para a gerente")}</Secao>

      <Secao titulo="Códigos para a gerente">
        <Controller
          control={control}
          name="codigos"
          render={({ field }) => (
            <CodigosChecklist
              key={versao}
              ref={codigos}
              value={(field.value ?? []) as CodigoForm[]}
              onChange={field.onChange}
              disabled={enviando}
            />
          )}
        />
      </Secao>

      {falha && (
        <div
          role="alert"
          className="rounded-lg border border-late/50 bg-late-soft px-4 py-3 text-sm text-late"
        >
          {falha}
        </div>
      )}

      {submitCount > 0 && nErros > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-late/50 bg-late-soft px-4 py-3 text-sm font-medium text-late"
        >
          {nErros === 1 ? "Há 1 campo para corrigir" : `Há ${nErros} campos para corrigir`}
        </div>
      )}

      <Button type="submit" size="lg" className={`w-full sm:w-auto ${glow}`} disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          "Enviar checklist"
        )}
      </Button>
    </form>
  );
}
