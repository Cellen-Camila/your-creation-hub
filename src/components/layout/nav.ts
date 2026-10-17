import {
  BarChart3, Boxes, Briefcase, FileCheck2, Fuel, Gauge, Home, Map, ShoppingBag, ShoppingCart, Users, Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  /** Rota própria (módulo já construído) ou slug da página do módulo no plano. */
  destino: { to: "/inicio" | "/painel" | "/modulos" } | { modulo: string };
};

export const NAV: { grupo: string; itens: NavItem[] }[] = [
  {
    grupo: "Visão geral",
    itens: [
      { label: "Início", icon: Home, destino: { to: "/inicio" } },
      { label: "Painel gerencial", icon: BarChart3, destino: { modulo: "painel-gerencial" } },
    ],
  },
  {
    grupo: "Operação",
    itens: [
      { label: "Pista e turnos", icon: Gauge, destino: { modulo: "pista" } },
      { label: "Combustíveis e LMC", icon: Fuel, destino: { modulo: "combustiveis" } },
    ],
  },
  {
    grupo: "Gestão",
    itens: [
      { label: "Licenças e documentos", icon: FileCheck2, destino: { to: "/painel" } },
      { label: "Financeiro", icon: Wallet, destino: { modulo: "financeiro" } },
      { label: "Administrativo", icon: Briefcase, destino: { modulo: "administrativo" } },
      { label: "Recursos humanos", icon: Users, destino: { modulo: "rh" } },
    ],
  },
  {
    grupo: "Loja e suprimentos",
    itens: [
      { label: "Conveniência", icon: ShoppingBag, destino: { modulo: "conveniencia" } },
      { label: "Estoques", icon: Boxes, destino: { modulo: "estoques" } },
      { label: "Pedidos e compras", icon: ShoppingCart, destino: { modulo: "pedidos" } },
    ],
  },
  {
    grupo: "Plataforma",
    itens: [{ label: "Plano do produto", icon: Map, destino: { to: "/modulos" } }],
  },
];

const ICONE_LICENCAS = FileCheck2;

export function iconeDoModulo(slug: string): LucideIcon {
  if (slug === "licencas") return ICONE_LICENCAS;
  for (const { itens } of NAV) for (const i of itens) if ("modulo" in i.destino && i.destino.modulo === slug) return i.icon;
  return Map;
}

/** Título da página atual para a barra superior. */
export function tituloDaRota(pathname: string) {
  for (const { itens } of NAV) {
    for (const i of itens) {
      const href = "to" in i.destino ? i.destino.to : `/modulos/${i.destino.modulo}`;
      if (pathname === href) return i.label;
    }
  }
  return pathname.startsWith("/modulos") ? "Plano do produto" : "Posto Natal";
}
