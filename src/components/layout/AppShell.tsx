import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail,
  SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { MODULOS, progresso } from "@/lib/prd";
import { aplicarTema, temaAtual, type Tema } from "@/lib/tema";
import { Logo } from "./Logo";
import { NAV, tituloDaRota, type NavItem } from "./nav";

const iniciais = (email?: string) => (email ?? "?").slice(0, 2).toUpperCase();

function ItemMenu({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const d = item.destino;
  const href = "to" in d ? d.to : `/modulos/${d.modulo}`;
  const ativo = pathname === href;
  const emBreve = "modulo" in d && progresso(MODULOS.find((m) => m.slug === d.modulo)!) === 0;
  const Icone = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={ativo} tooltip={item.label}
        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]">
        {"to" in d ? (
          <Link to={d.to} onClick={() => setOpenMobile(false)}><Icone /><span>{item.label}</span></Link>
        ) : (
          <Link to="/modulos/$modulo" params={{ modulo: d.modulo }} onClick={() => setOpenMobile(false)}><Icone /><span>{item.label}</span></Link>
        )}
      </SidebarMenuButton>
      {emBreve && (
        <SidebarMenuBadge className="rounded-full bg-sidebar-border px-1.5 text-[10px] font-medium text-sidebar-foreground/70">em breve</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export function AppShell({ email, children }: { email: string | undefined; children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [tema, setTema] = useState<Tema>(() => (typeof document === "undefined" ? "claro" : temaAtual()));
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  function alternarTema() {
    const novo: Tema = temaAtual() === "escuro" ? "claro" : "escuro";
    aplicarTema(novo);
    setTema(novo);
  }

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="px-3 py-4">
          <Link to="/inicio" className="group-data-[collapsible=icon]:hidden"><Logo /></Link>
          <Link to="/inicio" className="hidden group-data-[collapsible=icon]:block"><Logo compacto /></Link>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map(({ grupo, itens }) => (
            <SidebarGroup key={grupo}>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/50">{grupo}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {itens.map((i) => <ItemMenu key={i.label} item={i} pathname={pathname} />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                      {iniciais(email)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left text-sm">{email}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={alternarTema}>
                    {tema === "escuro" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {tema === "escuro" ? "Tema claro" : "Tema escuro"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={sair}><LogOut className="mr-2 h-4 w-4" /> Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <p className="truncate text-sm font-semibold">{tituloDaRota(pathname)}</p>
          <p className="ml-auto hidden text-sm capitalize text-muted-foreground sm:block">{hoje}</p>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
