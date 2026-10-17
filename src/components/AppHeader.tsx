import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo-posto-natal.jpg.asset.json";

const LINKS = [
  { to: "/painel", label: "Documentos" },
  { to: "/modulos", label: "Módulos" },
] as const;

export function AppHeader({ email }: { email: string | undefined }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="rounded-sm bg-card px-2 py-1">
            <img src={logoAsset.url} alt="Posto Natal" className="h-9 w-auto object-contain" />
          </span>
          <nav className="flex gap-1 text-sm">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-md px-3 py-1.5 text-ink-foreground/70 hover:text-ink-foreground"
                activeProps={{ className: "bg-ink-foreground/10 font-semibold !text-ink-foreground" }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-ink-foreground/70 md:inline">{email}</span>
          <button onClick={sair} className="flex items-center gap-1 hover:text-accent"><LogOut className="h-4 w-4" /> Sair</button>
        </div>
      </div>
    </header>
  );
}
