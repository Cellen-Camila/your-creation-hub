import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo-posto-natal.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Posto Natal" },
      { name: "description", content: "Acesso da equipe ao painel de documentos do Posto Natal." },
      { property: "og:title", content: "Entrar — Posto Natal" },
      { property: "og:description", content: "Acesso da equipe ao painel de documentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/painel" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin + "/painel" } });
        if (error) throw error;
        toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        setModo("entrar");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 block w-fit">
          <img src={logoAsset.url} alt="Posto Natal" className="h-16 w-auto object-contain" />
        </Link>
        <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{modo === "entrar" ? "Entrar" : "Criar conta"}</h1>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}</Button>
          <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}>
            {modo === "entrar" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
