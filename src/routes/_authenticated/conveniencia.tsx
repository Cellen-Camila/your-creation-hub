import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { History } from "lucide-react";
import { FormChecklist } from "@/components/conveniencia/FormChecklist";
import { Pendencias } from "@/components/conveniencia/Pendencias";
import { Vazio } from "@/components/conveniencia/Estados";
import { useTotalAbertos } from "@/lib/conveniencia";
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

function Conveniencia() {
  const aba = Route.useSearch().aba ?? "checklist";
  const navigate = useNavigate({ from: Route.fullPath });
  const abertos = useTotalAbertos();

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
          <TabsTrigger value="pendencias" className="gap-2">
            Pendências
            {abertos > 0 && (
              <span className="rounded-full bg-warn-soft px-1.5 text-xs font-semibold tabular-nums text-warn">
                {abertos}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="checklist" className="mt-4">
          <FormChecklist />
        </TabsContent>
        <TabsContent value="pendencias" className="mt-4">
          <Pendencias />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <Vazio icone={History} texto="Nenhum checklist enviado ainda" />
        </TabsContent>
      </Tabs>
    </>
  );
}
