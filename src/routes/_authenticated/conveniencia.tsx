import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, History, type LucideIcon } from "lucide-react";
import { FormChecklist } from "@/components/conveniencia/FormChecklist";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ABAS = ["checklist", "pendencias", "historico"] as const;
type Aba = (typeof ABAS)[number];

export const Route = createFileRoute("/_authenticated/conveniencia")({
  validateSearch: (search: Record<string, unknown>): { aba?: Aba | undefined } => ({
    aba: ABAS.find((a) => a === search["aba"]),
  }),
  head: () => ({
    meta: [
      { title: "Conveniência — Posto Natal" },
      {
        name: "description",
        content: "Checklist diário, pendências e histórico da loja de conveniência.",
      },
    ],
  }),
  component: Conveniencia,
});

function Vazio({ icone: Icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

function Conveniencia() {
  const aba = Route.useSearch().aba ?? "checklist";
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <>
      <PageHeader
        eyebrow="Loja e suprimentos"
        title="Conveniência"
        description="Checklist diário da loja, pendências para a gerência e o histórico de envios."
      />
      <Tabs
        value={aba}
        onValueChange={(v) => navigate({ search: { aba: v as Aba }, replace: true })}
      >
        <TabsList>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="pendencias">Pendências</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="checklist" className="mt-4">
          <FormChecklist />
        </TabsContent>
        <TabsContent value="pendencias" className="mt-4">
          <Vazio icone={CheckCircle2} texto="Nenhuma pendência aberta" />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <Vazio icone={History} texto="Nenhum checklist enviado ainda" />
        </TabsContent>
      </Tabs>
    </>
  );
}
