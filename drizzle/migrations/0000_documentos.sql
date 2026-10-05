CREATE TABLE public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  nome text NOT NULL,
  orgao text NOT NULL,
  base_legal text,
  tipo_prazo text NOT NULL,
  validade_tipica text,
  antecedencia_dias integer,
  emissao date,
  vencimento date,
  arquivo_path text,
  arquivo_nome text,
  observacoes text,
  ordem integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe lê" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe cria" ON public.documentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Equipe edita" ON public.documentos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Equipe exclui" ON public.documentos FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER documentos_touch BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.documentos (ordem, categoria, nome, orgao, base_legal, tipo_prazo, validade_tipica, antecedencia_dias) VALUES
(1,'Regulatório','Autorização da ANP para revenda varejista','ANP','Res. ANP nº 948/2023','Sem vencimento','Sem vencimento; manter cadastro atualizado e comunicar alterações (sócios, bandeira, tancagem)',NULL),
(2,'Regulatório','Cartão CNPJ','Receita Federal','IN RFB 2.119/2022','Sem vencimento','Sem vencimento; atualizar em alterações cadastrais',NULL),
(3,'Regulatório','Inscrição Estadual','SEFAZ-CE','Legislação ICMS-CE','Sem vencimento','Sem vencimento; manter situação ativa',NULL),
(4,'Regulatório','Certificado digital e-CNPJ (emissão de NF-e/NFC-e)','Autoridade certificadora','ICP-Brasil','Prazo fixo','12 meses (A1) ou até 36 meses (A3)',30),
(5,'Regulatório','Contrato com a distribuidora (bandeira)','Distribuidora','Res. ANP nº 948/2023','Prazo no documento','Prazo definido em contrato',90),
(6,'Municipal','Alvará de Funcionamento','Prefeitura','Código de posturas municipal','Prazo fixo','Geralmente anual',60),
(7,'Municipal','Licença Sanitária (loja de conveniência / lanchonete)','Vigilância Sanitária municipal','Lei 6.437/1977 e código sanitário local','Prazo fixo','Geralmente anual',60),
(8,'Municipal','Habite-se / Alvará de construção','Prefeitura','Código de obras municipal','Sem vencimento','Sem vencimento; novo pedido em caso de reforma',NULL),
(9,'Municipal','Licença de publicidade (totem e placas)','Prefeitura','Código de posturas municipal','Prazo no documento','Conforme a prefeitura (em geral anual)',30),
(10,'Ambiental','Licença de Operação (LO) ambiental','SEMACE ou órgão ambiental municipal','Res. CONAMA 273/2000 e 237/1997','Prazo no documento','Definida na licença (entre 4 e 10 anos)',120),
(11,'Ambiental','Teste de estanqueidade dos tanques e linhas (SASC)','Empresa acreditada pelo Inmetro','Res. CONAMA 273/2000 · ABNT NBR 13784','Prazo no documento','Conforme condicionante da LO e idade dos tanques',60),
(12,'Ambiental','Monitoramento ambiental (poços de monitoramento)','SEMACE / laboratório','Condicionantes da LO','Prazo no documento','Conforme condicionante da LO',30),
(13,'Ambiental','Cadastro Técnico Federal (CTF/APP) e RAPP','IBAMA','Lei 6.938/1981 · IN IBAMA 13/2021','Prazo fixo','Certificado de regularidade: 3 meses · RAPP anual até 31/03',15),
(14,'Ambiental','Contrato de coleta de resíduos (óleo usado, borra, embalagens)','Empresa licenciada','Res. CONAMA 362/2005 · PNRS','Prazo fixo','Conforme contrato (geralmente anual) · guardar MTR e CDF',30),
(15,'Ambiental','Limpeza da caixa separadora de água e óleo','Empresa licenciada','Condicionantes da LO','Prazo no documento','Periodicidade definida na LO',15),
(16,'Ambiental','Outorga de uso de água (poço) (se houver)','SRH-CE / COGERH','Lei Estadual 14.844/2010','Prazo no documento','Definida na outorga',90),
(17,'Segurança','Certificado de Conformidade do Corpo de Bombeiros','CBMCE','Lei Estadual 13.556/2004 e normas técnicas do CBMCE','Prazo no documento','Prazo impresso no certificado (conforme área e risco)',60),
(18,'Segurança','Recarga e inspeção de extintores','Empresa certificada pelo Inmetro','ABNT NBR 12962','Prazo fixo','Recarga anual · teste hidrostático a cada 5 anos',30),
(19,'Segurança','Treinamento da brigada de incêndio','CBMCE / empresa credenciada','ABNT NBR 14276','Prazo fixo','Reciclagem anual',30),
(20,'Segurança','Inspeção do compressor / vaso de pressão (calibrador)','Profissional habilitado','NR-13','Prazo no documento','Conforme categoria do vaso no prontuário',30),
(21,'Segurança','Laudo de SPDA (para-raios) e instalações elétricas','Engenheiro eletricista','ABNT NBR 5419 · NR-10','Prazo no documento','Conforme o laudo (inspeção periódica)',30),
(22,'Metrologia e Qualidade','Verificação periódica das bombas medidoras','Inmetro / IPEM-CE','Portaria Inmetro nº 227/2022','Prazo fixo','Anual',30),
(23,'Metrologia e Qualidade','Instrumentos de análise de qualidade (termodensímetro, proveta)','Laboratório acreditado','Res. ANP nº 948/2023','Prazo no documento','Conforme o certificado de calibração',30),
(24,'Metrologia e Qualidade','LMC - Livro de Movimentação de Combustíveis','ANP / SEFAZ','Portaria DNC 26/1992','Rotina contínua','Escrituração diária · guardar por 5 anos',NULL),
(25,'Metrologia e Qualidade','Registro de análises no recebimento de combustível','ANP','Res. ANP nº 948/2023','Rotina contínua','A cada recebimento · guardar amostra-testemunha',NULL),
(26,'Trabalhista e Saúde','PGR - Programa de Gerenciamento de Riscos','SESMT / consultoria','NR-1','Prazo fixo','Revisão a cada 2 anos (ou ao mudar processos)',60),
(27,'Trabalhista e Saúde','PCMSO e relatório analítico','Médico do trabalho','NR-7','Prazo fixo','Relatório analítico anual',30),
(28,'Trabalhista e Saúde','ASOs periódicos dos funcionários','Médico do trabalho','NR-7','Prazo fixo','Anual (frentistas expostos a benzeno)',30),
(29,'Trabalhista e Saúde','Treinamento NR-20 dos frentistas','Instrutor habilitado','NR-20','Prazo fixo','Atualização periódica conforme o curso (confirme com o SESMT)',60),
(30,'Trabalhista e Saúde','LTCAT e laudo de periculosidade','Engenheiro de segurança','Lei 8.213/1991 - NR-16','Prazo no documento','Atualizar quando houver mudança no ambiente',30),
(31,'Certidões','Certidão de Débitos Federais (CND/CPEN)','Receita Federal / PGFN','Portaria Conjunta RFB/PGFN 1.751/2014','Prazo fixo','180 dias',15),
(32,'Certidões','Certificado de Regularidade do FGTS (CRF)','Caixa','Lei 8.036/1990','Prazo fixo','30 dias',5),
(33,'Certidões','Certidão Negativa de Débitos Trabalhistas (CNDT)','TST','Lei 12.440/2011','Prazo fixo','180 dias',15),
(34,'Certidões','Certidão Negativa de Débitos Estaduais','SEFAZ-CE','Legislação estadual','Prazo no documento','Prazo impresso na certidão',10),
(35,'Certidões','Certidão Negativa de Débitos Municipais','Prefeitura','Legislação municipal','Prazo no documento','Prazo impresso na certidão',10),
(36,'Manutenção','Controle de pragas (dedetização)','Empresa licenciada','RDC Anvisa 622/2022','Prazo fixo','Geralmente semestral',15),
(37,'Manutenção','Limpeza da caixa d''água','Empresa especializada','Exigência da Vigilância Sanitária','Prazo fixo','Semestral',15),
(38,'Manutenção','Seguro do estabelecimento e responsabilidade ambiental','Seguradora','Contrato / exigência da distribuidora','Prazo fixo','Anual',30);

CREATE POLICY "Equipe lê arquivos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos');
CREATE POLICY "Equipe envia arquivos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "Equipe atualiza arquivos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documentos');
CREATE POLICY "Equipe remove arquivos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos');