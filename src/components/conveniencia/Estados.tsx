import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tabelaAusente } from "@/lib/conveniencia";

export const MSG_SEM_TABELA = "O banco ainda não foi atualizado. Avise a gerência.";

export function Esqueleto() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function FaixaErro({ erro, onRetry }: { erro: unknown; onRetry: () => void }) {
  const msg = tabelaAusente(erro) ? MSG_SEM_TABELA : "Não foi possível carregar. Tente de novo.";
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-late/30 bg-late-soft px-4 py-3 text-sm text-late"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 font-medium">{msg}</span>
      {!tabelaAusente(erro) && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

export function Vazio({ icone: Icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}
