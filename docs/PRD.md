# PRD – Plataforma de Gestão Integrada para Posto de Combustível

Pista • Combustíveis • RH • Administrativo • Licenças e Alvarás • Financeiro • Conveniência • Estoques • Pedidos

| Campo | Informação |
| --- | --- |
| Versão | 1.0 (rascunho para validação) |
| Data | 16/10/2026 |
| Status | Em definição |
| Responsável | Gerência do posto |
| Sistema atual de referência | Linx / Webposto |

> Fonte: `PRD_Plataforma_Gestao_Posto.pdf`. Este arquivo é a transcrição em Markdown para servir de referência ao desenvolvimento.

## Sumário

1. Visão geral do produto
2. Problema e objetivos
3. Usuários e perfis de acesso
4. Escopo e arquitetura de módulos
5. Requisitos funcionais por módulo
6. Integrações
7. Requisitos não funcionais
8. Indicadores de sucesso (KPIs)
9. Roadmap de entregas
10. Riscos e premissas
11. Glossário

## 1. Visão geral do produto

A plataforma é um sistema web e mobile que concentra, em um único lugar, toda a gestão do posto: operação de pista, controle de combustíveis e tanques, pessoas, rotinas administrativas, documentos regulatórios, finanças, loja de conveniência, estoques e compras. Ela não substitui o PDV/ERP fiscal já em uso (Linx/Webposto) no primeiro momento: consome os dados dele e acrescenta as camadas de controle, conferência, alerta e visão gerencial que hoje são feitas em planilhas, papel e WhatsApp.

### Proposta de valor

- **Visão macro em uma tela:** vendas, margem, caixa, estoque de tanques, pendências de RH e vencimentos de licenças.
- **Fim do retrabalho:** conciliações (bancária, cartões, LMC) feitas com apoio automático e não à mão.
- **Prevenção:** alertas antes de faltar combustível, vencer um alvará, estourar uma folga ou um título ficar em atraso.
- **Rastreabilidade:** cada diferença de caixa, perda de combustível ou avaria tem responsável, motivo e histórico.
- **Envio à contabilidade organizado:** pacote mensal (fiscal, financeiro e RH) gerado pelo sistema.

## 2. Problema e objetivos

### Problemas atuais

- Informações espalhadas entre ERP, planilhas, extratos bancários, portais de adquirentes e papel.
- Conciliação de cartões e bancária manual e demorada; taxas e recebíveis divergentes passam despercebidos.
- LMC e medições de tanque dependem de lançamento manual, com risco de erro e de não conformidade com a ANP.
- Controle de ponto, atestados, escalas (inclusive a do GNV), uniformes e EPI sem visão consolidada.
- Vencimentos de licenças, alvarás e laudos controlados de memória ou em planilha, com risco de multa ou interdição.
- Diferenças de caixa por frentista e perdas/avarias na conveniência sem histórico estruturado.
- Pedidos de combustível e de mercadoria feitos sem base em giro e cobertura de estoque.

### Objetivos do produto

| Objetivo | Meta indicativa (12 meses) |
| --- | --- |
| Reduzir tempo de rotinas financeiras diárias | -50% no tempo gasto em conciliações |
| Zerar vencimentos não planejados de licenças | 0 documentos vencidos sem alerta prévio |
| Controlar perdas de combustível | Variação do LMC dentro da tolerância regulatória em 100% dos dias, com justificativa registrada |
| Evitar ruptura de combustível | 0 bicos parados por falta de produto |
| Reduzir diferenças de caixa | -30% no valor total de quebras de caixa |
| Agilizar fechamento mensal com a contabilidade | Pacote enviado até o 3º dia útil |

## 3. Usuários e perfis de acesso

| Perfil | Quem é | Principais necessidades |
| --- | --- | --- |
| Proprietário / Diretor | Dono ou sócio | Visão consolidada de resultado, margem, caixa e riscos; acesso de leitura a tudo. |
| Gerente | Gerente geral do posto | Operar e aprovar todas as rotinas; dashboards; alertas; envio à contabilidade. |
| Administrativo / Financeiro | Auxiliar administrativo | Contas a pagar/receber, conciliações, LMC, documentos. |
| Chefe de pista / Supervisor | Líder de turno | Abertura e fechamento de turno, encerrantes, medições, escalas do turno. |
| Frentista | Operador de pista | App simples: registrar ponto, ver escala, prestar contas do caixa, solicitar EPI. |
| Operador de conveniência | Caixa / repositor da loja | Entrada de mercadoria, contagem, registro de avaria. |
| Contador (externo) | Escritório de contabilidade | Acesso restrito ao pacote mensal e documentos compartilhados. |

**Regras de permissão:** acesso por perfil e por módulo (ver, criar, editar, aprovar, excluir); ações sensíveis (estorno, ajuste de estoque, abono de ponto, baixa de título) exigem aprovação do Gerente e ficam registradas em trilha de auditoria.

## 4. Escopo e arquitetura de módulos

| Módulo | Escopo resumido |
| --- | --- |
| Pista | Turnos, frentistas, bicos/encerrantes, fechamento de caixa, GNV, serviços (troca de óleo, lavagem). |
| Combustíveis e tanques | Medições, LMC, descargas, perdas/sobras, preços e pesquisa de concorrência. |
| RH / DP | Cadastro, ponto, atestados, escalas, férias, uniformes e EPI, advertências, comunicados, envio à contabilidade. |
| Administrativo | Tarefas, checklists, manutenção, fornecedores, contratos, ocorrências. |
| Licenças e alvarás | Cadastro de documentos, vencimentos, alertas, repositório digital, histórico de renovações. |
| Financeiro | Contas a pagar/receber, conciliação bancária e de cartões, fluxo de caixa, DRE gerencial. |
| Conveniência | Entrada de notas, precificação, margem, avarias e perdas, curva ABC. |
| Estoques | Estoque da loja, lubrificantes, filtros, insumos, uniformes/EPI; inventários e ajustes. |
| Pedidos e compras | Sugestão de compra, pedidos de combustível e mercadoria, cotação, recebimento. |
| Painel e alertas | Dashboard gerencial, notificações, relatórios. |

**Fora do escopo da versão 1:** emissão de NF-e/NFC-e e operação de PDV (permanecem no Linx/Webposto); folha de pagamento e envio ao eSocial (permanecem na contabilidade); automação de bombas em tempo real (avaliar na fase 3).

## 5. Requisitos funcionais por módulo

Prioridade: **Alta** = obrigatório no MVP; **Média** = segunda entrega; **Baixa** = evolução futura.

### 5.1 Pista e operação de turno

| ID | Requisito | Prior. |
| --- | --- | --- |
| PIS-01 | Cadastrar turnos (horários, dias) e vincular frentistas e chefe de pista a cada turno. | Alta |
| PIS-02 | Abertura de turno com registro dos encerrantes iniciais de cada bico (manual ou importado do ERP/automação). | Alta |
| PIS-03 | Fechamento de turno com encerrantes finais, cálculo automático de litros vendidos por bico, produto e frentista. | Alta |
| PIS-04 | Prestação de contas do frentista: dinheiro, cartões (por bandeira/adquirente), PIX, notas a prazo, vales e sangrias. | Alta |
| PIS-05 | Cálculo automático da diferença de caixa (sobra/falta) por frentista e turno, com campo de justificativa e aprovação. | Alta |
| PIS-06 | Histórico e ranking de diferenças de caixa por frentista, com opção de gerar desconto/advertência vinculada ao RH. | Média |
| PIS-07 | Controle específico do GNV: vendas por compressor/bico, leitura de medidor, escala dedicada e paradas de manutenção. | Alta |
| PIS-08 | Registro de serviços de pista (troca de óleo, filtros, aditivos, lavagem) com comissão por frentista. | Média |
| PIS-09 | Checklist de abertura/fechamento de pista (limpeza, extintores, iluminação, calibrador, área de descarga). | Média |
| PIS-10 | Registro de aferição volumétrica diária dos bicos (medida de 20 L) com alerta de desvio. | Alta |
| PIS-11 | Registro de ocorrências de pista (drive-off/evasão, acidentes, reclamações) com fotos. | Média |
| PIS-12 | Metas de vendas por frentista (litros, aditivados, lubrificantes, conveniência) e painel de acompanhamento. | Baixa |

### 5.2 Combustíveis, tanques e LMC

| ID | Requisito | Prior. |
| --- | --- | --- |
| CMB-01 | Cadastro de tanques (produto, capacidade, tabela de arqueação/conversão régua x litros) e bicos vinculados. | Alta |
| CMB-02 | Registro de medição diária por régua (e/ou sonda) com conversão automática para litros. | Alta |
| CMB-03 | Geração do LMC diário por produto: estoque de abertura, recebimentos, vendas, estoque escritural, estoque de fechamento e perdas/sobras. | Alta |
| CMB-04 | Alerta quando a perda ou sobra ultrapassar a tolerância regulatória, exigindo justificativa antes de fechar o dia. | Alta |
| CMB-05 | Registro de descarga: NF do distribuidor, volume faturado x medido antes/depois, temperatura/densidade, teste de qualidade, motorista e placa. | Alta |
| CMB-06 | Cálculo de cobertura de estoque (dias restantes) com base na média de vendas e alerta de nível mínimo. | Alta |
| CMB-07 | Histórico de custo médio por litro e de preço de bomba por produto. | Alta |
| CMB-08 | Simulador de preço: margem bruta por litro, impacto de reajuste e preço sugerido. | Média |
| CMB-09 | Pesquisa de preços da concorrência: cadastro de postos concorrentes, registro periódico de preços e comparativo. | Média |
| CMB-10 | Registro de alterações de preço com data/hora, responsável e motivo. | Alta |
| CMB-11 | Impressão/exportação do LMC no formato exigido para fiscalização e arquivo. | Alta |

### 5.3 Recursos Humanos / DP

| ID | Requisito | Prior. |
| --- | --- | --- |
| RH-01 | Cadastro completo de colaboradores: dados pessoais, cargo, admissão, salário base, documentos digitalizados, tamanhos de uniforme e calçado. | Alta |
| RH-02 | Controle de ponto: importação do relógio de ponto ou registro via app com geolocalização; espelho de ponto; banco de horas. | Alta |
| RH-03 | Tratamento de ocorrências de ponto: atrasos, faltas, horas extras, abonos (com aprovação do gerente). | Alta |
| RH-04 | Registro de atestados médicos (data, dias, CID opcional, anexo) com reflexo automático no ponto e na escala. | Alta |
| RH-05 | Escala de folgas mensal com regras (folga semanal, domingos alternados, limites de horas), detecção de conflitos e publicação no app. | Alta |
| RH-06 | Escala do GNV separada, com cobertura mínima por turno e alerta de buraco na escala. | Alta |
| RH-07 | Programação e controle de férias (período aquisitivo, vencimento, aviso). | Média |
| RH-08 | Uniformes e EPI: estoque por item e tamanho, ficha de entrega com assinatura digital, periodicidade de troca e CA do EPI com validade. | Alta |
| RH-09 | Alerta de EPI/uniforme com troca vencida por colaborador e sugestão de compra. | Média |
| RH-10 | Advertências e suspensões: modelo de documento, registro, assinatura e histórico por colaborador. | Alta |
| RH-11 | Comunicados internos com confirmação de leitura pelo app. | Média |
| RH-12 | Controle de ASO (admissional, periódico, demissional) e treinamentos obrigatórios com validade. | Alta |
| RH-13 | Fechamento mensal do RH: relatório de ponto, faltas, atestados, horas extras e descontos para a contabilidade. | Alta |
| RH-14 | Admissão e desligamento com checklist de documentos e devolução de uniformes/EPI. | Média |

### 5.4 Administrativo

| ID | Requisito | Prior. |
| --- | --- | --- |
| ADM-01 | Gestão de tarefas e rotinas recorrentes (diárias, semanais, mensais) com responsável, prazo e status. | Alta |
| ADM-02 | Checklists configuráveis (abertura de loja, limpeza de banheiros, inspeção de extintores, etc.) preenchidos pelo celular com foto. | Média |
| ADM-03 | Manutenção de equipamentos: cadastro (bombas, compressor GNV, gerador, câmaras frias), manutenções preventivas e corretivas, custos. | Média |
| ADM-04 | Cadastro de fornecedores e prestadores com contatos, condições comerciais e avaliação. | Alta |
| ADM-05 | Gestão de contratos (bandeira/distribuidora, aluguel, prestadores, adquirentes) com vigência, reajuste e alertas. | Média |
| ADM-06 | Livro de ocorrências administrativas e registro de visitas de fiscalização. | Média |
| ADM-07 | Agenda do gerente integrada a vencimentos de todos os módulos. | Baixa |

### 5.5 Licenças, alvarás e documentos

Cada documento é cadastrado com: tipo, órgão emissor, número, data de emissão, data de vencimento, responsável, custo da renovação, antecedência necessária para renovar e anexo digital. Exemplos de documentos a controlar (lista a ser validada com a contabilidade e órgãos locais):

| Documento | Órgão / observação |
| --- | --- |
| Autorização de revenda (registro ANP) | ANP |
| Alvará de funcionamento | Prefeitura |
| Licença ambiental de operação | Órgão ambiental estadual/municipal |
| Certificado do Corpo de Bombeiros | Corpo de Bombeiros Militar do estado |
| Licença sanitária da conveniência | Vigilância Sanitária |
| Verificação/aferição das bombas | Inmetro / órgão metrológico estadual |
| Teste de estanqueidade dos tanques | Laudo técnico exigido pela licença ambiental |
| Laudos e programas de segurança (PGR, PCMSO, laudos de periculosidade) | Segurança e medicina do trabalho |
| Certidões negativas (federal, estadual, municipal, FGTS, trabalhista) | Diversos |
| Certificado digital da empresa | Autoridade certificadora |
| Contrato com a distribuidora / bandeira | Distribuidora |
| Seguros (patrimonial, responsabilidade civil, ambiental) | Seguradora |

| ID | Requisito | Prior. |
| --- | --- | --- |
| LIC-01 | Cadastro de documentos com todos os campos acima e repositório digital pesquisável. | Alta |
| LIC-02 | Alertas escalonados de vencimento (ex.: 90, 60, 30, 15 e 7 dias) por e-mail, app e painel. | Alta |
| LIC-03 | Fluxo de renovação com etapas (juntar documentos, protocolar, pagar taxa, aguardar emissão) e anexos por etapa. | Alta |
| LIC-04 | Painel de semáforo: em dia, a vencer, vencido, em renovação. | Alta |
| LIC-05 | Histórico de renovações e custos anuais com regularização. | Média |
| LIC-06 | Lançamento automático da taxa de renovação em contas a pagar. | Média |
| LIC-07 | Compartilhamento controlado de documentos com contador e fiscalização (link com validade). | Baixa |

### 5.6 Financeiro

| ID | Requisito | Prior. |
| --- | --- | --- |
| FIN-01 | Contas a pagar: lançamento manual ou por importação de XML de NF-e, parcelas, centro de custo, aprovação e baixa. | Alta |
| FIN-02 | Contas a receber: vendas a prazo/frotas, faturas de clientes, notas assinadas, cobrança e controle de inadimplência. | Alta |
| FIN-03 | Conciliação bancária: importação de extrato (OFX/CNAB ou API bancária) e casamento automático com lançamentos. | Alta |
| FIN-04 | Conciliação de cartões: importação das vendas (ERP) e dos recebíveis (adquirentes), conferência de taxas contratadas, prazos, chargebacks e antecipações. | Alta |
| FIN-05 | Conciliação de PIX e depósitos de caixa dos turnos. | Alta |
| FIN-06 | Fechamento de caixa diário consolidado (todos os turnos + loja) com envio ao cofre/banco. | Alta |
| FIN-07 | Fluxo de caixa realizado e projetado (diário, semanal, mensal). | Alta |
| FIN-08 | DRE gerencial por unidade de negócio (combustíveis, GNV, conveniência, serviços). | Média |
| FIN-09 | Plano de contas e centros de custo configuráveis. | Alta |
| FIN-10 | Controle de cheques, vales de frota e convênios. | Média |
| FIN-11 | Pacote mensal para a contabilidade: extratos, conciliações, notas de entrada/saída, LMC e relatórios de RH em um único envio. | Alta |
| FIN-12 | Indicadores de custo financeiro: taxa média de cartão, custo de antecipação, juros pagos. | Média |

### 5.7 Conveniência

| ID | Requisito | Prior. |
| --- | --- | --- |
| CONV-01 | Entrada de notas por importação de XML ou chave da NF-e, com conferência item a item (quantidade, validade, preço de custo). | Alta |
| CONV-02 | Divergências na entrada (falta, sobra, avaria, preço diferente) registradas e vinculadas ao fornecedor. | Alta |
| CONV-03 | Precificação: margem/markup por categoria, preço sugerido, alerta quando o custo subir e a margem cair abaixo da meta. | Alta |
| CONV-04 | Emissão de etiquetas de gôndola após alteração de preço. | Média |
| CONV-05 | Registro de avarias, vencidos e perdas com motivo, foto e valor, gerando nota/baixa de estoque. | Alta |
| CONV-06 | Controle de validade com alerta de produtos próximos ao vencimento. | Alta |
| CONV-07 | Relatórios de venda, margem, curva ABC, itens sem giro e ticket médio. | Média |
| CONV-08 | Promoções e combos (ex.: abasteceu, ganhou desconto no café). | Baixa |

### 5.8 Estoques

| ID | Requisito | Prior. |
| --- | --- | --- |
| EST-01 | Estoque multi-local: loja, depósito, lubrificantes/filtros da pista, uniformes/EPI, materiais de limpeza e escritório. | Alta |
| EST-02 | Movimentações rastreadas: entrada, venda, transferência, consumo interno, avaria, ajuste (com aprovação). | Alta |
| EST-03 | Inventário: contagem cíclica e geral pelo celular (leitor de código de barras), comparativo com o sistema e ajuste aprovado. | Alta |
| EST-04 | Estoque mínimo e máximo por item com alerta de ruptura. | Alta |
| EST-05 | Custo médio e valor total do estoque por local e categoria. | Alta |
| EST-06 | Relatório de acuracidade de inventário e perdas por período. | Média |

### 5.9 Pedidos e compras

| ID | Requisito | Prior. |
| --- | --- | --- |
| PED-01 | Sugestão automática de compra com base em giro médio, estoque atual, estoque mínimo e prazo de entrega do fornecedor. | Alta |
| PED-02 | Pedido de combustível: sugestão por tanque considerando cobertura, capacidade livre (ullage) e melhor janela de descarga. | Alta |
| PED-03 | Cotação entre fornecedores e registro do vencedor. | Média |
| PED-04 | Fluxo de aprovação de pedidos por valor. | Média |
| PED-05 | Acompanhamento do pedido (emitido, confirmado, faturado, entregue) e vínculo com a NF de entrada. | Alta |
| PED-06 | Compras de uniformes e EPI a partir das necessidades geradas pelo RH. | Média |
| PED-07 | Histórico de preços pagos por fornecedor e item. | Média |

### 5.10 Painel gerencial e alertas

| ID | Requisito | Prior. |
| --- | --- | --- |
| PNL-01 | Dashboard inicial: vendas do dia (litros e R$), margem, caixa, nível dos tanques, pendências e vencimentos. | Alta |
| PNL-02 | Central de alertas unificada com prioridade e responsável (tanque baixo, LMC fora da tolerância, documento a vencer, título vencendo, escala descoberta, EPI vencido). | Alta |
| PNL-03 | Notificações por app, e-mail e WhatsApp (configurável por perfil). | Média |
| PNL-04 | Relatórios exportáveis em PDF e Excel em todos os módulos. | Alta |
| PNL-05 | Comparativo de períodos (dia, semana, mês, ano anterior). | Média |

## 6. Integrações

| Sistema | Dados trocados | Fase |
| --- | --- | --- |
| Linx / Webposto (ERP/PDV) | Vendas por bico/produto/turno, encerrantes, cadastro de produtos, vendas da conveniência, notas emitidas. | 1 |
| Bancos (OFX/CNAB ou API) | Extratos, boletos, PIX recebidos. | 1 |
| Adquirentes de cartão | Vendas, recebíveis, taxas, chargebacks, antecipações. | 1 |
| SEFAZ / XML de NF-e | Importação de notas de entrada (combustível e mercadorias). | 1 |
| Relógio de ponto | Marcações de ponto (arquivo AFD ou API). | 1 |
| Contabilidade | Pacote mensal (exportação de arquivos ou portal). | 2 |
| Automação de pista / sondas de tanque | Encerrantes e níveis em tempo real. | 3 |
| WhatsApp / e-mail | Envio de alertas e comunicados. | 2 |

## 7. Requisitos não funcionais

| Categoria | Requisito |
| --- | --- |
| Plataforma | Web responsiva para escritório; app (ou PWA) para pista, loja e colaboradores; funcionamento offline para checklists e contagem, com sincronização. |
| Segurança | Login individual, senha forte e autenticação em dois fatores para perfis gerenciais; permissões por perfil; trilha de auditoria de todas as alterações. |
| LGPD | Dados pessoais e de saúde (atestados) com acesso restrito, base legal registrada, política de retenção e exclusão. |
| Desempenho | Telas principais carregam em até 3 segundos; importações diárias processadas em até 5 minutos. |
| Disponibilidade | 99,5% ao mês; backup diário com retenção mínima de 5 anos para documentos fiscais e LMC. |
| Usabilidade | Telas de pista com poucos campos e botões grandes; linguagem do dia a dia do posto; tudo em português. |
| Escalabilidade | Suporte a mais de uma unidade (multi-posto) sem retrabalho de cadastro. |
| Rastreabilidade | Nenhum registro financeiro, de estoque ou de LMC pode ser apagado, apenas estornado com justificativa. |

## 8. Indicadores de sucesso (KPIs)

| Área | Indicador |
| --- | --- |
| Pista | Litros vendidos/dia, venda por frentista, diferença de caixa por turno, % aditivados. |
| Combustíveis | Perdas/sobras (% do volume), margem bruta por litro, dias de cobertura, rupturas. |
| RH | Absenteísmo, horas extras, turnover, % escalas cobertas, EPIs em dia. |
| Licenças | % documentos em dia, renovações iniciadas no prazo. |
| Financeiro | Saldo de caixa, prazo médio de recebimento, taxa média de cartão, inadimplência, diferenças de conciliação. |
| Conveniência | Faturamento, margem, ticket médio, perdas por avaria/validade (% das vendas). |
| Estoques e compras | Acuracidade de inventário, giro, ruptura, economia em cotações. |

## 9. Roadmap de entregas

| Fase | Conteúdo | Prazo indicativo |
| --- | --- | --- |
| Fase 1 – MVP | Pista (turno e caixa), Combustíveis/LMC, Licenças e alvarás, Financeiro (pagar/receber e conciliações), Painel e alertas básicos, integração Linx/Webposto, bancos e cartões. | 3 a 4 meses |
| Fase 2 | RH completo (ponto, escalas, atestados, EPI, advertências), Conveniência, Estoques, Pedidos e compras, pacote para a contabilidade. | +3 meses |
| Fase 3 | Automação de pista e sondas, DRE gerencial avançado, multi-posto, metas e comissões, promoções, BI. | +3 a 6 meses |

**Critério de aceite geral de cada fase:** rotina executada por 30 dias no sistema, sem planilha paralela, com validação da gerência e do contador.

## 10. Riscos e premissas

| Risco | Mitigação |
| --- | --- |
| Integração com o Linx/Webposto limitada ou paga | Validar API/exportações disponíveis antes do desenvolvimento; plano B por importação de arquivos. |
| Resistência da equipe de pista ao novo processo | App simples, treinamento curto por turno, implantação gradual. |
| Exigências regulatórias variam por município/estado | Lista de licenças configurável e validada com contador e órgãos locais. |
| Dados de adquirentes em formatos diferentes | Camada de importação por adquirente; começar pelos de maior volume. |
| Dados sensíveis de colaboradores (LGPD) | Acesso restrito, criptografia e política de retenção definidas desde o MVP. |

**Premissas:** internet estável no posto; ERP atual continua responsável pela parte fiscal; colaboradores com celular para uso do app (ou tablet compartilhado na pista).

## 11. Glossário

| Termo | Significado |
| --- | --- |
| LMC | Livro de Movimentação de Combustíveis: registro diário obrigatório de estoque, entradas, vendas e perdas/sobras por produto. |
| Encerrante | Totalizador da bomba que acumula o volume vendido por bico. |
| Arqueação | Tabela que converte a medida da régua (cm) em volume (litros) de cada tanque. |
| Ullage | Espaço livre no tanque disponível para receber combustível. |
| GNV | Gás Natural Veicular. |
| EPI / CA | Equipamento de Proteção Individual / Certificado de Aprovação do EPI. |
| ASO | Atestado de Saúde Ocupacional. |
| Curva ABC | Classificação de produtos pela participação no faturamento. |
| Conciliação | Conferência entre o que o sistema registrou e o que efetivamente entrou ou saiu (banco, cartões). |
