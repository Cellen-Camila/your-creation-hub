-- Combinado: Checklist da Conveniência (docs/sia/combinado.md).
-- Três tabelas (checklist, fotos, códigos com providência) e uma função que grava tudo de uma vez.
-- Regra de ouro: depois de enviado, nada muda e nada é apagado. Só as "baixas" (resolvido_*).

-- Um checklist por envio. As nove perguntas são obrigatórias (NOT NULL) e cada uma tem observação.
CREATE TABLE public.checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nunca futura, no fuso de Natal (Fortaleza, UTC-3, sem horário de verão): current_date usaria o fuso do servidor (UTC).
  data date NOT NULL CHECK (data <= (now() AT TIME ZONE 'America/Fortaleza')::date),
  funcionaria text NOT NULL CHECK (btrim(funcionaria) <> ''),
  -- Operacional
  produto_sem_cadastro boolean NOT NULL,
  produto_sem_cadastro_obs text,
  mercadoria_abastecida boolean NOT NULL,
  mercadoria_abastecida_obs text,
  notas_bonificacao boolean NOT NULL,
  notas_bonificacao_obs text,
  transferencias_realizadas boolean NOT NULL,
  transferencias_realizadas_obs text,
  -- Manutenção
  loja_limpa boolean NOT NULL,
  loja_limpa_obs text,
  lixo_retirado boolean NOT NULL,
  lixo_retirado_obs text,
  loja_organizada boolean NOT NULL,
  loja_organizada_obs text,
  freezers_organizados boolean NOT NULL,
  freezers_organizados_obs text,
  material_abastecido boolean NOT NULL,
  material_abastecido_obs text,
  -- Campos de texto da folha
  pedidos_fornecedor text,
  mercadoria_recebida text,
  avariados_vencidos text,
  mercadorias_trocadas text,
  contagens text,
  outras_informacoes text,
  a_fazer text,
  -- Baixa do "o que precisa ser feito": os dois campos juntos, ou nenhum.
  a_fazer_resolvido_em timestamptz,
  a_fazer_resolvido_por uuid,
  CONSTRAINT checklists_baixa_coerente
    CHECK ((a_fazer_resolvido_em IS NULL) = (a_fazer_resolvido_por IS NULL)),
  enviado_por uuid NOT NULL DEFAULT auth.uid(),                   -- quem enviou, gravado pelo banco
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX checklists_data ON public.checklists (data DESC);

-- Fotos: só o caminho no storage. Sem ON DELETE CASCADE: nada é apagado.
CREATE TABLE public.checklist_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.checklists(id),
  path text NOT NULL,
  nome text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX checklist_fotos_checklist ON public.checklist_fotos (checklist_id);

-- Códigos de produto com a providência (transferir, devolução ou ajuste).
CREATE TABLE public.checklist_codigos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.checklists(id),
  codigo text NOT NULL CHECK (codigo ~ '^[0-9]{1,20}$'),          -- só números, 1 a 20 dígitos
  providencia text NOT NULL CHECK (providencia IN ('transferir', 'devolucao', 'ajuste')),
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade >= 1),
  ajuste text,
  CONSTRAINT checklist_codigos_ajuste_obrigatorio
    CHECK (providencia <> 'ajuste' OR (ajuste IS NOT NULL AND btrim(ajuste) <> '')),
  resolvido_em timestamptz,
  resolvido_por uuid,
  CONSTRAINT checklist_codigos_baixa_coerente
    CHECK ((resolvido_em IS NULL) = (resolvido_por IS NULL)),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX checklist_codigos_checklist ON public.checklist_codigos (checklist_id);
CREATE INDEX checklist_codigos_pendentes ON public.checklist_codigos (providencia) WHERE resolvido_em IS NULL;

-- Grava checklist + fotos + códigos numa transação só: se qualquer CHECK falhar, nada fica gravado.
-- É o ÚNICO caminho de inserção: authenticated não tem INSERT nas tabelas (ver GRANTs abaixo).
-- SECURITY DEFINER é seguro aqui: não usa SQL dinâmico, o search_path é fixo (public, pg_temp) e a função
-- só insere em 3 tabelas conhecidas. O dono é o papel que roda a migração (padrão, não alterado).
-- Autoria é do banco: enviado_por = auth.uid(); resolvido_* e a_fazer_resolvido_* NUNCA vêm do payload.
-- Pergunta ausente ou null vira NULL e o NOT NULL da coluna recusa.
CREATE OR REPLACE FUNCTION public.enviar_checklist(p jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_id uuid;
  f jsonb;
  c jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem login'; END IF;

  INSERT INTO checklists (
    data, funcionaria,
    produto_sem_cadastro, produto_sem_cadastro_obs,
    mercadoria_abastecida, mercadoria_abastecida_obs,
    notas_bonificacao, notas_bonificacao_obs,
    transferencias_realizadas, transferencias_realizadas_obs,
    loja_limpa, loja_limpa_obs,
    lixo_retirado, lixo_retirado_obs,
    loja_organizada, loja_organizada_obs,
    freezers_organizados, freezers_organizados_obs,
    material_abastecido, material_abastecido_obs,
    pedidos_fornecedor, mercadoria_recebida, avariados_vencidos, mercadorias_trocadas,
    contagens, outras_informacoes, a_fazer, enviado_por
  ) VALUES (
    (p->>'data')::date, p->>'funcionaria',
    (p->>'produto_sem_cadastro')::boolean, p->>'produto_sem_cadastro_obs',
    (p->>'mercadoria_abastecida')::boolean, p->>'mercadoria_abastecida_obs',
    (p->>'notas_bonificacao')::boolean, p->>'notas_bonificacao_obs',
    (p->>'transferencias_realizadas')::boolean, p->>'transferencias_realizadas_obs',
    (p->>'loja_limpa')::boolean, p->>'loja_limpa_obs',
    (p->>'lixo_retirado')::boolean, p->>'lixo_retirado_obs',
    (p->>'loja_organizada')::boolean, p->>'loja_organizada_obs',
    (p->>'freezers_organizados')::boolean, p->>'freezers_organizados_obs',
    (p->>'material_abastecido')::boolean, p->>'material_abastecido_obs',
    p->>'pedidos_fornecedor', p->>'mercadoria_recebida', p->>'avariados_vencidos', p->>'mercadorias_trocadas',
    p->>'contagens', p->>'outras_informacoes', p->>'a_fazer', auth.uid()
  ) RETURNING id INTO v_id;

  FOR f IN SELECT * FROM jsonb_array_elements(coalesce(p->'fotos', '[]'::jsonb)) LOOP
    INSERT INTO checklist_fotos (checklist_id, path, nome) VALUES (v_id, f->>'path', f->>'nome');
  END LOOP;

  FOR c IN SELECT * FROM jsonb_array_elements(coalesce(p->'codigos', '[]'::jsonb)) LOOP
    INSERT INTO checklist_codigos (checklist_id, codigo, providencia, quantidade, ajuste)
    VALUES (v_id, c->>'codigo', c->>'providencia', coalesce((c->>'quantidade')::integer, 1), c->>'ajuste');
  END LOOP;

  RETURN v_id;
END; $$;

-- Segurança: começa sem nada para ninguém, depois concede só o necessário.
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_codigos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.checklists, public.checklist_fotos, public.checklist_codigos FROM PUBLIC, anon, authenticated;

-- Só leitura direta. INSERT só pela função enviar_checklist.
GRANT SELECT ON public.checklists, public.checklist_fotos, public.checklist_codigos TO authenticated;
-- UPDATE só nas colunas de baixa. Nenhum DELETE para ninguém (exceto service_role).
GRANT UPDATE (resolvido_em, resolvido_por) ON public.checklist_codigos TO authenticated;
GRANT UPDATE (a_fazer_resolvido_em, a_fazer_resolvido_por) ON public.checklists TO authenticated;
GRANT ALL ON public.checklists, public.checklist_fotos, public.checklist_codigos TO service_role;

CREATE POLICY "Equipe lê" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe dá baixa" ON public.checklists FOR UPDATE TO authenticated USING (true)
  WITH CHECK (a_fazer_resolvido_por IS NULL OR a_fazer_resolvido_por = auth.uid());
CREATE POLICY "Equipe lê" ON public.checklist_fotos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe lê" ON public.checklist_codigos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe dá baixa" ON public.checklist_codigos FOR UPDATE TO authenticated USING (true)
  WITH CHECK (resolvido_por IS NULL OR resolvido_por = auth.uid());

REVOKE EXECUTE ON FUNCTION public.enviar_checklist(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enviar_checklist(jsonb) TO authenticated;

-- Storage: as fotos do checklist (conveniencia/) não podem ser alteradas nem apagadas.
-- A 0000 liberava UPDATE e DELETE no bucket inteiro; aqui recria as duas sem a pasta conveniencia/.
-- INSERT e SELECT continuam como na 0000.
DROP POLICY IF EXISTS "Equipe atualiza arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Equipe remove arquivos" ON storage.objects;
CREATE POLICY "Equipe atualiza arquivos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos' AND name NOT LIKE 'conveniencia/%')
  WITH CHECK (bucket_id = 'documentos' AND name NOT LIKE 'conveniencia/%');
CREATE POLICY "Equipe remove arquivos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos' AND name NOT LIKE 'conveniencia/%');
