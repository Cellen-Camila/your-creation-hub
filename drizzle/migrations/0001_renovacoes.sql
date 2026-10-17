-- PRD 5.5 (LIC-01, LIC-03, LIC-05): campos extras do documento e fluxo de renovação por etapas.
ALTER TABLE public.documentos
  ADD COLUMN numero text,
  ADD COLUMN responsavel text,
  ADD COLUMN custo_renovacao numeric(12,2);

CREATE TABLE public.renovacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid NOT NULL REFERENCES public.documentos(id) ON DELETE CASCADE,
  etapa text NOT NULL DEFAULT 'juntar_documentos'
    CHECK (etapa IN ('juntar_documentos', 'protocolar', 'pagar_taxa', 'aguardar_emissao', 'concluida')),
  protocolo text,
  custo numeric(12,2),
  iniciada_em date NOT NULL DEFAULT current_date,
  concluida_em date,
  vencimento_anterior date,
  novo_vencimento date,
  observacoes text,
  criado_por uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
-- No máximo uma renovação em andamento por documento.
CREATE UNIQUE INDEX renovacoes_uma_aberta ON public.renovacoes (documento_id) WHERE concluida_em IS NULL;
CREATE INDEX renovacoes_documento ON public.renovacoes (documento_id);

CREATE TABLE public.renovacao_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renovacao_id uuid NOT NULL REFERENCES public.renovacoes(id) ON DELETE CASCADE,
  etapa text NOT NULL,
  arquivo_path text NOT NULL,
  arquivo_nome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX renovacao_anexos_renovacao ON public.renovacao_anexos (renovacao_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.renovacoes, public.renovacao_anexos TO authenticated;
GRANT ALL ON public.renovacoes, public.renovacao_anexos TO service_role;
ALTER TABLE public.renovacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovacao_anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe lê" ON public.renovacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe cria" ON public.renovacoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Equipe edita" ON public.renovacoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Equipe exclui" ON public.renovacoes FOR DELETE TO authenticated USING (true);
CREATE POLICY "Equipe lê" ON public.renovacao_anexos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe cria" ON public.renovacao_anexos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Equipe exclui" ON public.renovacao_anexos FOR DELETE TO authenticated USING (true);

CREATE TRIGGER renovacoes_touch BEFORE UPDATE ON public.renovacoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Conclui a renovação e grava as novas datas no documento na mesma transação.
CREATE OR REPLACE FUNCTION public.concluir_renovacao(p_renovacao uuid, p_emissao date, p_vencimento date, p_custo numeric)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_doc uuid;
BEGIN
  UPDATE renovacoes r
     SET etapa = 'concluida', concluida_em = current_date, novo_vencimento = p_vencimento,
         custo = coalesce(p_custo, r.custo),
         vencimento_anterior = (SELECT d.vencimento FROM documentos d WHERE d.id = r.documento_id)
   WHERE r.id = p_renovacao AND r.concluida_em IS NULL
   RETURNING r.documento_id INTO v_doc;
  IF v_doc IS NULL THEN RAISE EXCEPTION 'Renovação não encontrada ou já concluída'; END IF;
  UPDATE documentos SET emissao = coalesce(p_emissao, emissao), vencimento = coalesce(p_vencimento, vencimento) WHERE id = v_doc;
END; $$;
GRANT EXECUTE ON FUNCTION public.concluir_renovacao(uuid, date, date, numeric) TO authenticated;
