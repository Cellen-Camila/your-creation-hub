import { CheckCircle2, Info, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TipoSelo = "ok" | "warn" | "late" | "info";

const estilo: Record<TipoSelo, { classe: string; icone: LucideIcon }> = {
  ok: { classe: "border-ok/30 bg-ok-soft text-ok", icone: CheckCircle2 },
  warn: { classe: "border-warn/30 bg-warn-soft text-warn", icone: TriangleAlert },
  late: { classe: "border-late/30 bg-late-soft text-late", icone: OctagonAlert },
  info: { classe: "border-info/30 bg-info-soft text-info", icone: Info },
};

/** Selo de status: cor do tema + ícone + texto (nunca só cor). */
export function SeloStatus({
  tipo,
  icone,
  className,
  children,
}: {
  tipo: TipoSelo;
  icone?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  const e = estilo[tipo];
  const Icone = icone ?? e.icone;
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2", e.classe, className)}>
      <Icone className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </Badge>
  );
}
