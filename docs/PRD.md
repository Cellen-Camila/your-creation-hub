# PRD – Sistema de Gestão do Posto Natal

| Campo | Informação |
| --- | --- |
| Versão | 2.0 (substitui integralmente a versão 1.0) |
| Data | 19/10/2026 |
| Status | Em validação |
| Fonte | Documento "CRIAÇÃO DO SISTEMA" (levantamento de rotinas do posto) |
| Posto | Posto Natal – Migra Combustíveis LTDA |
| CNPJ | 35.751.096/0001-04 |
| Endereço | Av. Almirante Alexandrino de Alencar, 593 – Alecrim – Natal/RN |

## Sumário

1. Visão geral
2. Objetivos
3. Quem usa
4. Módulos e calendário de rotinas
5. Regras comuns a todos os módulos
6. Requisitos por módulo
7. Requisitos não funcionais
8. Ordem de entrega
9. Pontos a confirmar
10. Glossário

## 1. Visão geral

O sistema substitui as planilhas, formulários em papel e controles de memória do posto por um único lugar onde cada rotina é registrada, cada documento tem prazo e cada manutenção tem histórico com valor e comprovante.

Ele cobre seis áreas: **Pista**, **Documentos e licenças**, **Cursos, treinamentos e exames**, **Conveniência**, **Administrativo e financeiro** e **RH**. Em todas, o sistema sabe com que frequência cada rotina deve acontecer e avisa quando ela está para vencer ou já atrasou.

Os formulários exigidos pela ANP (drenagem de diesel e análise de qualidade no recebimento) saem do sistema no mesmo formato do papel, prontos para imprimir e assinar em caso de fiscalização.

## 2. Objetivos

| Objetivo | Como saber que deu certo |
| --- | --- |
| Nenhuma rotina obrigatória esquecida | Toda rotina com frequência definida (diária, semanal, quinzenal, semestral, anual) aparece no painel quando vence, e o atraso fica visível. |
| Nenhum documento ou licença vencido sem aviso | Todo documento tem data de vencimento e é avisado com antecedência. |
| Fiscalização da ANP atendida na hora | Os registros de drenagem e de análise no recebimento podem ser impressos no formato exigido, para qualquer data. |
| Custo de manutenção conhecido | Cada manutenção tem data, serviço, profissional, valor e comprovante, e o gasto por equipamento e por período aparece em relatório. |
| Fim do papel e da planilha | Formulários, checklists e planilhas listados neste PRD passam a ser preenchidos no sistema, pelo celular. |

## 3. Quem usa

| Perfil | Quem é | O que faz no sistema |
| --- | --- | --- |
| Gerente | Gerente do posto | Vê tudo, confere e aprova rotinas, dá baixa em pendências, acompanha o painel. |
| Chefe de pista | Líder de turno da pista | Registra aferições, encerrantes de GNV, drenagem, análise no recebimento, inspeções e limpezas. |
| Auxiliar / frentista | Operador de pista | Ajuda nas aferições e registra rotinas simples (limpeza da calha, encerrantes). |
| Funcionária da conveniência | Caixa / repositora | Preenche o checklist da loja, temperatura dos equipamentos, contagem e validade. |
| Administrativo / financeiro | Escritório | LMC, contas a pagar, empréstimos, documentos e licenças, RH. |
| Diretoria | Sócios da Migra Combustíveis | Leitura de tudo, com foco em vendas, margem, empréstimos e vencimentos. |

Toda ação fica registrada com quem fez e quando. Perfis com permissões diferentes por módulo entram na fase 2 (ver seção 8). Até lá, toda a equipe logada vê e registra tudo.

## 4. Módulos e calendário de rotinas

| Rotina | Frequência | Módulo |
| --- | --- | --- |
| Encerrantes de GNV (06:00, 14:20 e 21:00) | Diária | Pista |
| Aferição de diesel S500 (bicos B3 e B4) | Diária | Pista |
| Limpeza da calha | Diária | Pista |
| Controle de temperatura dos 9 equipamentos | Diária | Conveniência |
| Contagem de itens | Diária | Conveniência |
| Checklist da conveniência | Diária | Conveniência |
| LMC | Diária | Administrativo e financeiro |
| Pesquisa de preço da concorrência | Quarta-feira e sábado | Pista |
| Aferição de todas as bombas (B1 a B16) | Semanal | Pista |
| Inspeção dos sumps das bombas | Semanal | Pista |
| Drenagem do fundo dos tanques de diesel | Quinzenal | Pista |
| Análise de qualidade | A cada recebimento de combustível | Pista |
| Dedetização | A cada 3 meses | Documentos e licenças |
| Certificado de Regularidade do IBAMA | A cada 3 meses | Documentos e licenças |
| Limpeza da caixa d'água | Semestral | Documentos e licenças |
| Manutenção do gerador | Semestral | Pista (manutenções) |
| ASO de frentistas e chefe de pista | Semestral | Cursos, treinamentos e exames |
| Documentos com renovação anual (AVCB, laudos, alvarás etc.) | Anual | Documentos e licenças |
| ASO de administrativo e conveniência | Anual | Cursos, treinamentos e exames |
| Boas práticas de manipulação de alimentos | Anual | Cursos, treinamentos e exames |
| NR-20 | A cada 2 anos | Cursos, treinamentos e exames |
| PGR | A cada 2 anos | Documentos e licenças |
| Trocas de filtro, óleo, limpeza de caixas separadoras e manutenções | Quando acontecer (data informada) | Pista (manutenções) |

## 5. Regras comuns a todos os módulos

**RC-01 – Rotina periódica.** Toda rotina com frequência gera uma ocorrência esperada. Se não for registrada até o fim do prazo, aparece como atrasada no painel, com o tempo de atraso.

**RC-02 – Registro de manutenção.** Toda manutenção usa o mesmo formulário: data do serviço, serviço realizado, profissional ou empresa, valor cobrado e documentos anexados (nota, orçamento, laudo, fotos). Cada registro fica ligado a um equipamento ou área.

**RC-03 – Documento com periodicidade.** Todo documento, licença ou laudo guarda: data de emissão ou realização, profissional ou empresa responsável, valor pago, arquivo anexado, periodicidade e próximo vencimento (calculado a partir da periodicidade, com possibilidade de ajuste manual quando o documento trouxer outra data).

**RC-04 – Avisos escalonados.** Vencimentos são avisados com antecedência (padrão: 90, 60, 30, 15 e 7 dias, ajustável por item) e aparecem no painel em verde (em dia), amarelo (vence em breve), vermelho (vencido) e azul (em renovação).

**RC-05 – Anexos.** Qualquer registro aceita fotos e PDFs, tirados pelo celular ou enviados do computador.

**RC-06 – Rastro.** Todo registro guarda quem criou, quem alterou e quando. Registros exigidos por órgãos (ANP, IPEM, Bombeiros) não podem ser apagados.

**RC-07 – Impressão no formato oficial.** Formulários que hoje são impressos e assinados (drenagem, análise no recebimento, aferição de bombas) são gerados em PDF no mesmo layout do papel, com espaço para assinatura.

## 6. Requisitos por módulo

Prioridade: **Alta** = obrigatório na primeira entrega do módulo; **Média** = segunda entrega; **Baixa** = evolução.

### 6.1 Pista

#### Qualidade do combustível (ANP)

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-01 | **Drenagem quinzenal do fundo dos tanques de diesel** (Resolução ANP nº 968/2024, art. 21). Para cada tanque de diesel: produto, capacidade (L), presença de água no medidor (mm), aspecto, cor, volume de amostra drenado (L), presença de água (sim/não), volume de água drenado (L). Para o registro: data da coleta, nome, RG e assinatura do responsável. Cabeçalho com razão social e CNPJ do posto. | Alta |
| PIS-02 | Aviso quando a drenagem quinzenal de um tanque estiver para vencer ou atrasada. Segundo fontes do setor (texto oficial a conferir, seção 9), a regra geral é drenagem semanal, e o intervalo de 15 dias só vale com medição diária do nível de água no tanque. Se a medição diária encontrar água livre, a drenagem tem que ser feita na hora. Por isso o sistema registra a medição diária de água (PIS-22) e alerta para drenar quando ela acusar água. | Alta |
| PIS-03 | **Análise de qualidade no recebimento de combustível.** Dados do recebimento: produto, volume recebido (L), data da coleta, distribuidor e CNPJ, transportador e CNPJ, nota fiscal, placa do caminhão/reboque, nome e RG do motorista, nome do analista. Resultados: aspecto, cor, massa específica a 20 °C, teor de álcool na gasolina, teor alcoólico no etanol (AEHC). Responsável pelo preenchimento e assinatura. Cabeçalho com razão social, CNPJ, endereço e bairro do posto. | Alta |
| PIS-04 | Impressão da drenagem e da análise no recebimento no layout dos formulários atuais (RC-07). | Alta |

#### Aferições e encerrantes

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-05 | **Aferição semanal de todas as bombas.** Bicos B1-S10, B2-S10, B3-DC, B4-DC, B5-Eta, B6-GA, B7-GC, B8-GC, B9-Eta, B10-GC, B11-GA, B12-GC, B13-GA, B14-GC, B15-Eta e B16-GC. Para cada bico: vazão mínima em 20 L, vazão máxima em 20 L, tempo para o motor desligar, lacres rompidos (sim/não), vazão na proveta e encerrante. Ao final: nº do chamado e bico (quando houver problema), observações, chefe de pista, auxiliar e gerente. | Alta |
| PIS-06 | **Aferição diária do diesel S500** (bicos B3-DC e B4-DC), com os mesmos procedimentos da aferição semanal. | Alta |
| PIS-07 | Alerta quando a vazão na proveta sair da tolerância ou houver lacre rompido, pedindo nº do chamado técnico. | Alta |
| PIS-08 | **Encerrantes de GNV diários** dos bicos 17, 18, 19 e 20, nos horários 06:00, 14:20 e 21:00. O sistema calcula o volume vendido entre leituras. | Alta |
| PIS-09 | Cadastro dos bicos (número, produto, bomba) e dos tanques (produto, capacidade), para que os formulários já venham preenchidos. | Alta |

#### Pesquisa de preço

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-10 | **Pesquisa de preço toda quarta-feira e sábado.** Preço de gasolina comum, etanol e diesel S-10 dos concorrentes Leandro (Av. 9), Jota Flor, Campo Bello (Cemitério), Leandro (Santo Expedito) e Junior Tangará, e do próprio Posto Natal. | Média |
| PIS-11 | Cadastro de concorrentes editável (incluir e desativar postos). | Média |
| PIS-12 | Comparativo: diferença do Posto Natal para cada concorrente e histórico em gráfico. | Média |

#### Inspeções, trocas e limpezas

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-13 | **Inspeção semanal dos sumps das bombas:** data da inspeção e se houve necessidade de limpeza. | Alta |
| PIS-14 | **Limpeza diária da calha:** registro de feito/não feito, com foto opcional. | Média |
| PIS-15 | **Troca do filtro do diesel S10 e do S500:** data da troca, separada por produto. | Média |
| PIS-16 | **Troca do óleo do compressor:** data da troca. | Média |
| PIS-17 | **Limpeza da caixa separadora da pista** e **da caixa separadora da troca de óleo:** data da limpeza, empresa e comprovante. | Média |

#### Manutenções

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-18 | Registro de manutenção (RC-02) para: bombas, GNV, Veeder Root, tanques, compressor, gerador, predial e equipamentos em geral. | Alta |
| PIS-19 | Manutenção do gerador com periodicidade de 6 meses e aviso de vencimento. | Média |
| PIS-20 | **Compra de equipamentos reserva para a pista:** data da compra e documentos. | Média |
| PIS-21 | Relatório de gasto com manutenção por equipamento, por tipo e por período. | Média |

#### Estoque de combustíveis

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PIS-22 | **Controle manual do estoque de combustíveis:** medição diária por tanque, com data e hora, incluindo o nível de água no fundo (mm). | Alta |
| PIS-23 | **Controle do estoque pelo sistema** (valor informado pelo Linx/Webposto) e comparativo com a medição manual, mostrando a diferença por tanque. | Alta |

### 6.2 Documentos e licenças

Todos os itens seguem RC-03 e RC-04. A periodicidade abaixo é a informada pelo posto. Os itens marcados como "a confirmar" dependem da pesquisa das regras de Natal/RN (seção 9).

| ID | Documento | Periodicidade |
| --- | --- | --- |
| DOC-01 | AVCB (Corpo de Bombeiros) – data, profissional responsável e valor | Anual |
| DOC-02 | Teste de estanqueidade do GNV – data, profissional e valor | Anual |
| DOC-03 | Teste de estanqueidade das bombas – data, profissional e valor | Anual |
| DOC-04 | Laudo de aceitação e estanqueidade do sistema de hidrantes – data, profissional e valor | Anual |
| DOC-05 | Laudo SPDA (para-raios) – data, profissional e valor | Anual |
| DOC-06 | Plano de manutenção do sistema de hidrante predial de combate a incêndio – data, profissional e valor | Anual |
| DOC-07 | Laudo de conformidade da reserva técnica de incêndio – data, profissional e valor | Anual |
| DOC-08 | Alvará de Funcionamento e Localização | A confirmar (Natal/RN) |
| DOC-09 | Licença de Operação (LO) ambiental | A confirmar (Natal/RN) |
| DOC-10 | Autorização de operação da ANP | A confirmar |
| DOC-11 | Cadastro Técnico Federal (CTF/APP) do IBAMA | A confirmar |
| DOC-12 | Certificado de Regularidade do IBAMA (CR) | A cada 3 meses |
| DOC-13 | Relatório Anual de Atividades (RAPP) do IBAMA | Anual (prazo a confirmar) |
| DOC-14 | CNPJ ativo | Sem vencimento (conferir situação) |
| DOC-15 | Contrato social | Sem vencimento (atualizar a cada alteração) |
| DOC-16 | Inscrição estadual | Sem vencimento (conferir situação) |
| DOC-17 | Inscrição municipal | Sem vencimento (conferir situação) |
| DOC-18 | Laudo de aferição das bombas (IPEM/Inmetro) | A confirmar (Natal/RN) |
| DOC-19 | Laudo de aferição das bombas de GNV (IPEM/Inmetro) | A confirmar (Natal/RN) |
| DOC-20 | Alvará sanitário | Anual |
| DOC-21 | Limpeza da caixa d'água | Semestral |
| DOC-22 | Dedetização | A cada 3 meses |
| DOC-23 | PCMSO (Programa de Controle Médico de Saúde Ocupacional) | Anual |
| DOC-24 | PGR (Programa de Gerenciamento de Riscos) | A cada 2 anos |
| DOC-25 | LTCAT | Sem validade (aditivo quando houver alteração) |
| DOC-26 | IPTU | Anual |

| ID | Requisito | Prioridade |
| --- | --- | --- |
| DOC-27 | Renovação em etapas (juntar documentos, protocolar, pagar taxa, aguardar emissão), com protocolo, custo e anexos por etapa; ao concluir, o vencimento é atualizado. | Alta |
| DOC-28 | Histórico de renovações e custo por documento e por ano. | Média |
| DOC-29 | Cadastro de novos documentos pela equipe, além da lista acima. | Alta |

### 6.3 Cursos, treinamentos e exames

Controle por funcionário, com data de realização, validade, certificado anexado e aviso de vencimento (RC-04).

| ID | Item | Para quem | Periodicidade |
| --- | --- | --- | --- |
| TRE-01 | Boas Práticas de Manipulação em Serviços de Alimentação | Conveniência | Anual |
| TRE-02 | NR-20 | Frentistas e chefe de pista | A cada 2 anos |
| TRE-03 | ASO | Administrativo e conveniência | Anual |
| TRE-04 | ASO | Frentistas e chefe de pista | Semestral |

| ID | Requisito | Prioridade |
| --- | --- | --- |
| TRE-05 | Cadastro de funcionários com função (frentista, chefe de pista, conveniência, administrativo); a função define quais cursos e exames são exigidos e com que periodicidade. | Alta |
| TRE-06 | Painel por funcionário: o que está em dia, o que vence em breve e o que está vencido. | Alta |

### 6.4 Conveniência

| ID | Requisito | Prioridade |
| --- | --- | --- |
| CONV-01 | **Controle diário de temperatura dos 9 equipamentos** (geladeiras, freezers e expositores): cadastro dos equipamentos com faixa de temperatura aceitável, registro diário e alerta quando a leitura sair da faixa ou não for feita. | Alta |
| CONV-02 | **Manutenção do ar-condicionado:** registro de manutenção (RC-02). | Média |
| CONV-03 | **Contagem diária de itens:** registro da contagem por item ou departamento, com comparação com o estoque do sistema quando disponível. | Alta |
| CONV-04 | **Controle de validade:** registro de produtos com data de validade e alerta dos que estão perto de vencer. | Alta |
| CONV-05 | **Pedido:** registro dos pedidos feitos a cada fornecedor (data, fornecedor, itens) e da mercadoria recebida. | Média |
| CONV-06 | **Checklist diário da conveniência** (substitui a folha "Checklist Conveniência"): pedidos e recebimentos do dia, perguntas de sim/não da operação e da manutenção da loja, avariados/vencidos, trocas, contagens, fotos do que foi feito, o que precisa ser feito e códigos de barras lidos pela câmera, cada um marcado como transferir, nota de devolução ou ajuste (com qual ajuste). Detalhe completo em `docs/sia/combinado.md`. | Alta |
| CONV-07 | **Pendências da gerente:** lista única dos códigos a transferir, a emitir nota de devolução e a ajustar, e do "o que precisa ser feito" de cada checklist, com baixa item a item (quem resolveu e quando) e opção de reabrir. | Alta |

### 6.5 Administrativo e financeiro

| ID | Requisito | Prioridade |
| --- | --- | --- |
| FIN-01 | **LMC diário** por produto: estoque de abertura, recebimentos, vendas, estoque de fechamento e perdas/sobras, com impressão para fiscalização. | Alta |
| FIN-02 | **Empréstimos concedidos pela Migra:** cadastro de cada tomador (hoje XP, Posto Amigo e RA) com valor emprestado, pagamentos recebidos e saldo atual; total geral em aberto. | Alta |
| FIN-03 | **Empréstimos tomados pela Migra:** por credor (hoje Transcopel), lançamentos de entrada e de pagamento com data e valor, situação de cada lançamento (em aberto / pago) e saldo devedor atualizado. | Alta |
| FIN-04 | Importação dos saldos e lançamentos das planilhas atuais de empréstimos, para que o histórico não se perca. | Alta |
| FIN-05 | **Vendas de combustível:** valor e litros vendidos por dia, produto e período. | Alta |
| FIN-06 | **Margem** por produto e por período (preço de venda menos custo). | Alta |
| FIN-07 | **Conferência do contas a pagar** entre o sistema (Linx/Webposto) e o DDA do Banco do Brasil, apontando boletos que estão num e não no outro, ou com valor ou vencimento diferente. | Alta |
| FIN-08 | **Planilha de valores pagos à Migra:** registro dos pagamentos com data, valor e origem, e total por período. | Média |
| FIN-09 | **Quantidade de litros vendidos** por produto, por dia e acumulada no mês. | Alta |

### 6.6 RH

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RH-01 | **Escala** de trabalho por funcionário e turno. | Alta |
| RH-02 | **Folgas:** registro e controle de folgas, ligado à escala. | Alta |
| RH-03 | **Férias:** período aquisitivo, data de vencimento e programação de férias. | Alta |
| RH-04 | **Atestados:** registro com data, dias de afastamento e anexo. | Alta |
| RH-05 | **Faltas sem justificativa:** registro por funcionário e total no período. | Alta |
| RH-06 | **Hora extra:** registro e total por funcionário e período. | Alta |
| RH-07 | **Produtividade dos funcionários:** indicadores por funcionário (a definir com a gerência: por exemplo, vendas, litros, rotinas cumpridas). | Média |

### 6.7 Painel

| ID | Requisito | Prioridade |
| --- | --- | --- |
| PAI-01 | Tela inicial com as rotinas do dia: o que já foi feito, o que falta e o que está atrasado, por módulo. | Alta |
| PAI-02 | Vencimentos de documentos, licenças, cursos e exames nos próximos 90 dias. | Alta |
| PAI-03 | Pendências abertas (conveniência, chamados de bomba, alertas de temperatura). | Alta |
| PAI-04 | Resumo financeiro para a diretoria: vendas, litros, margem e saldo dos empréstimos. | Média |

## 7. Requisitos não funcionais

- **Celular primeiro:** todos os formulários de rotina são preenchidos pelo celular, na pista ou na loja, com câmera para fotos e leitura de código de barras.
- **Acesso por login:** só a equipe logada vê os dados. Arquivos e fotos ficam em armazenamento fechado, abertos por link temporário.
- **Rastro e guarda:** registros exigidos pela ANP, IPEM e Bombeiros não podem ser apagados e ficam guardados por pelo menos 5 anos.
- **Impressão:** os formulários oficiais saem em PDF no layout do papel.
- **Sem retrabalho com o Linx/Webposto:** o sistema não substitui o PDV/ERP fiscal. Quando os dados existirem lá (vendas, estoque, contas a pagar), a meta é importar, e não redigitar.

## 8. Ordem de entrega

Proposta, a validar com a gerência.

| Fase | Conteúdo |
| --- | --- |
| 1 | Documentos e licenças (DOC) com os prazos de Natal/RN; cursos, treinamentos e exames (TRE); checklist e pendências da conveniência (CONV-06, CONV-07); painel de vencimentos (PAI-02). |
| 2 | Registros da ANP na pista (PIS-01 a PIS-09); manutenções (PIS-18 a PIS-21); temperatura, contagem e validade da conveniência (CONV-01, CONV-03, CONV-04); painel de rotinas do dia (PAI-01, PAI-03); perfis de acesso por função. |
| 3 | Pesquisa de preço, inspeções, trocas e limpezas (PIS-10 a PIS-17); estoque de combustíveis (PIS-22, PIS-23); administrativo e financeiro (FIN); RH. |

## 9. Pontos a confirmar

1. Periodicidade em Natal/RN do Alvará de Funcionamento e Localização, da Licença de Operação, dos laudos de aferição do IPEM (bombas e GNV) e do RAPP. Ver tabela abaixo.
2. Faixa de temperatura aceitável de cada um dos 9 equipamentos da conveniência.
3. Tolerância aceita na vazão da proveta (aferição) para gerar alerta.
4. Quais tanques são de diesel e entram na drenagem quinzenal, e a capacidade de cada um.
5. Indicadores de produtividade dos funcionários (RH-07).
6. O que a "planilha de valores pagos à Migra" registra hoje (origem dos pagamentos).

### Prazos pesquisados (19/10/2026)

Busca feita na internet. Poucos prazos foram confirmados em fonte oficial. Até virem as respostas por escrito dos órgãos, o sistema usa a periodicidade informada pelo posto e deixa o vencimento editável.

| Item | O que foi encontrado | Confiança | Próximo passo |
| --- | --- | --- | --- |
| Alvará de Funcionamento e Localização | Emitido pela SEMURB (Prefeitura do Natal). Validade não encontrada. | Baixa | Perguntar à SEMURB |
| Licença de Operação (LO) | Provavelmente emitida pelo IDEMA/RN. Validade não encontrada. Pela Res. CONAMA 237/1997, a renovação deve ser pedida 120 dias antes do vencimento. | Baixa | Conferir na própria LO e com o IDEMA |
| RAPP (IBAMA) | Anual, entregue entre 1º/02 e 31/03, sobre o ano anterior (Lei 6.938/1981). | Média | Usar 31/03 como vencimento |
| Certificado de Regularidade (IBAMA) | Validade de 3 meses não confirmada em norma federal (aparece em norma do Pará). | Baixa | Conferir no próprio certificado |
| Aferição das bombas (IPEM-RN/Inmetro) | Verificação anual, segundo o IPEM. Nova verificação obrigatória após reparo (Portaria Inmetro 227/2022, alterada pela 516/2023). | Média | Usar anual |
| Aferição do GNV (IPEM-RN) | O IPEM-RN fiscaliza dispensers de GNV. Portaria e intervalo não encontrados. | Baixa | Perguntar ao IPEM-RN |
| Alvará sanitário (Natal) | Nenhuma fonte de Natal encontrada. | Baixa | Perguntar à Vigilância Sanitária de Natal |
| AVCB (CBMRN) | Validade não encontrada. | Baixa | Conferir no próprio certificado |
| Autorização da ANP | Nenhuma indicação de vencimento. Exige manter os requisitos em dia, inclusive a licença ambiental (Res. ANP 948/2023). | Baixa | Conferir na cartilha da ANP para postos |
| Drenagem do diesel | Semanal como regra. Quinzenal só com medição diária de água, e drenagem imediata se houver água livre (Res. ANP 968/2024). Artigo e exigência de registro não confirmados. | Média-baixa | Conferir o texto consolidado no site da ANP |
| Análise no recebimento | Amostra-testemunha por compartimento do caminhão e "Registro de Análise da Qualidade", aparentemente pela Res. ANP 898/2022. Prazo de guarda não confirmado. | Média | Conferir com a ANP ou a distribuidora |

## 10. Glossário

| Termo | Significado |
| --- | --- |
| ANP | Agência Nacional do Petróleo, Gás Natural e Biocombustíveis. |
| AEHC | Álcool etílico hidratado combustível (etanol). |
| ASO | Atestado de Saúde Ocupacional. |
| AVCB | Auto de Vistoria do Corpo de Bombeiros. |
| B1…B16 | Número do bico. S10 = diesel S10; DC = diesel comum (S500); GC = gasolina comum; GA = gasolina aditivada; Eta = etanol. |
| DDA | Débito Direto Autorizado: boletos registrados no CPF/CNPJ, consultados no banco. |
| Encerrante | Contador acumulado da bomba, usado para calcular o volume vendido. |
| GNV | Gás natural veicular. |
| IPEM | Instituto de Pesos e Medidas, que faz a verificação das bombas pelo Inmetro. |
| LMC | Livro de Movimentação de Combustíveis. |
| LO | Licença de Operação ambiental. |
| LTCAT | Laudo Técnico das Condições Ambientais do Trabalho. |
| PCMSO | Programa de Controle Médico de Saúde Ocupacional. |
| PGR | Programa de Gerenciamento de Riscos. |
| RAPP | Relatório Anual de Atividades Potencialmente Poluidoras (IBAMA). |
| SPDA | Sistema de Proteção contra Descargas Atmosféricas (para-raios). |
| Sump | Câmara de contenção sob a bomba, que evita vazamento para o solo. |
| Veeder Root | Sistema de medição automática dos tanques. |
