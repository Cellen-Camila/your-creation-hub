import { useEffect, useRef, useState } from "react";
import { Fuel } from "lucide-react";
import logoAsset from "@/assets/logo-posto-natal.jpg.asset.json";

/** Logo do posto; se a imagem não carregar (ex.: fora da hospedagem do Lovable), mostra a marca em texto. */
export function Logo({ compacto = false, fundoClaro = false }: { compacto?: boolean; fundoClaro?: boolean }) {
  const [falhou, setFalhou] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // Na página renderizada no servidor a imagem pode falhar antes do onError existir; confere ao montar.
  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth === 0) setFalhou(true);
  }, []);

  if (!falhou && !compacto) {
    return (
      <span className="inline-flex rounded-md bg-white px-2 py-1">
        <img ref={img} src={logoAsset.url} alt="Posto Natal" className="h-8 w-auto object-contain" onError={() => setFalhou(true)} />
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Fuel className="h-4 w-4" />
      </span>
      {!compacto && (
        <span className="leading-tight">
          <span className={`block font-display text-sm font-bold ${fundoClaro ? "text-foreground" : "text-sidebar-accent-foreground"}`}>Posto Natal</span>
          <span className={`block text-[11px] ${fundoClaro ? "text-muted-foreground" : "text-sidebar-foreground/70"}`}>Gestão integrada</span>
        </span>
      )}
    </span>
  );
}
