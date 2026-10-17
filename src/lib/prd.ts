// Conteúdo do PRD (docs/PRD.md, v1.0 de 16/10/2026) usado nas telas de módulos.
// Ao construir um requisito, marque-o em REQUISITOS_FEITOS.

export type Prioridade = "Alta" | "Média" | "Baixa";
export type Situacao = "pronto" | "parcial" | "planejado";
export type Requisito = { id: string; texto: string; prioridade: Prioridade };
export type Modulo = {
  slug: string;
  nome: string;
  escopo: string;
  fase: 1 | 2 | 3 | null;
  rota?: "/painel";
  kpis: string[];
  requisitos: Requisito[];
};

const REQUISITOS_FEITOS: Record<string, { situacao: Situacao; nota?: string }> = {
  "LIC-01": { situacao: "pronto" },
  "LIC-02": { situacao: "parcial", nota: "Alertas no painel; envio por e-mail e app ainda não." },
  "LIC-03": { situacao: "pronto" },
  "LIC-04": { situacao: "pronto" },
  "LIC-05": { situacao: "pronto" },
};

export const situacaoDe = (id: string) => REQUISITOS_FEITOS[id] ?? { situacao: "planejado" as const };

export const SITUACAO_LABEL: Record<Situacao, string> = { pronto: "Pronto", parcial: "Parcial", planejado: "Planejado" };
export const SITUACAO_CLASS: Record<Situacao, string> = {
  pronto: "bg-ok-soft text-ok",
  parcial: "bg-warn-soft text-warn",
  planejado: "bg-muted text-muted-foreground",
};
export const PRIORIDADE_CLASS: Record<Prioridade, string> = {
  Alta: "text-late font-semibold",
  Média: "text-warn",
  Baixa: "text-muted-foreground",
};

/** Proporção de requisitos prontos (parcial conta meio). */
export function progresso(m: Modulo) {
  const pontos = m.requisitos.reduce((s, r) => {
    const st = situacaoDe(r.id).situacao;
    return s + (st === "pronto" ? 1 : st === "parcial" ? 0.5 : 0);
  }, 0);
  return m.requisitos.length ? pontos / m.requisitos.length : 0;
}

const r = (id: string, texto: string, prioridade: Prioridade): Requisito => ({ id, texto, prioridade });

export const MODULOS: Modulo[] = [
  {
    slug: "pista", nome: "Pista e operação de turno", fase: 1,
    escopo: "Turnos, frentistas, bicos/encerrantes, fechamento de caixa, GNV, serviços (troca de óleo, lavagem).",
    kpis: ["Litros vendidos/dia", "Venda por frentista", "Diferença de caixa por turno", "% aditivados"],
    requisitos: [
      r("PIS-01", "Cadastrar turnos (horários, dias) e vincular frentistas e chefe de pista a cada turno.", "Alta"),
      r("PIS-02", "Abertura de turno com registro dos encerrantes iniciais de cada bico (manual ou importado do ERP/automação).", "Alta"),
      r("PIS-03", "Fechamento de turno com encerrantes finais, cálculo automático de litros vendidos por bico, produto e frentista.", "Alta"),
      r("PIS-04", "Prestação de contas do frentista: dinheiro, cartões (por bandeira/adquirente), PIX, notas a prazo, vales e sangrias.", "Alta"),
      r("PIS-05", "Cálculo automático da diferença de caixa (sobra/falta) por frentista e turno, com campo de justificativa e aprovação.", "Alta"),
      r("PIS-06", "Histórico e ranking de diferenças de caixa por frentista, com opção de gerar desconto/advertência vinculada ao RH.", "Média"),
      r("PIS-07", "Controle específico do GNV: vendas por compressor/bico, leitura de medidor, escala dedicada e paradas de manutenção.", "Alta"),
      r("PIS-08", "Registro de serviços de pista (troca de óleo, filtros, aditivos, lavagem) com comissão por frentista.", "Média"),
      r("PIS-09", "Checklist de abertura/fechamento de pista (limpeza, extintores, iluminação, calibrador, área de descarga).", "Média"),
      r("PIS-10", "Registro de aferição volumétrica diária dos bicos (medida de 20 L) com alerta de desvio.", "Alta"),
      r("PIS-11", "Registro de ocorrências de pista (drive-off/evasão, acidentes, reclamações) com fotos.", "Média"),
      r("PIS-12", "Metas de vendas por frentista (litros, aditivados, lubrificantes, conveniência) e painel de acompanhamento.", "Baixa"),
    ],
  },
  {
    slug: "combustiveis", nome: "Combustíveis, tanques e LMC", fase: 1,
    escopo: "Medições, LMC, descargas, perdas/sobras, preços e pesquisa de concorrência.",
    kpis: ["Perdas/sobras (% do volume)", "Margem bruta por litro", "Dias de cobertura", "Rupturas"],
    requisitos: [
      r("CMB-01", "Cadastro de tanques (produto, capacidade, tabela de arqueação/conversão régua x litros) e bicos vinculados.", "Alta"),
      r("CMB-02", "Registro de medição diária por régua (e/ou sonda) com conversão automática para litros.", "Alta"),
      r("CMB-03", "Geração do LMC diário por produto: estoque de abertura, recebimentos, vendas, estoque escritural, estoque de fechamento e perdas/sobras.", "Alta"),
      r("CMB-04", "Alerta quando a perda ou sobra ultrapassar a tolerância regulatória, exigindo justificativa antes de fechar o dia.", "Alta"),
      r("CMB-05", "Registro de descarga: NF do distribuidor, volume faturado x medido antes/depois, temperatura/densidade, teste de qualidade, motorista e placa.", "Alta"),
      r("CMB-06", "Cálculo de cobertura de estoque (dias restantes) com base na média de vendas e alerta de nível mínimo.", "Alta"),
      r("CMB-07", "Histórico de custo médio por litro e de preço de bomba por produto.", "Alta"),
      r("CMB-08", "Simulador de preço: margem bruta por litro, impacto de reajuste e preço sugerido.", "Média"),
      r("CMB-09", "Pesquisa de preços da concorrência: cadastro de postos concorrentes, registro periódico de preços e comparativo.", "Média"),
      r("CMB-10", "Registro de alterações de preço com data/hora, responsável e motivo.", "Alta"),
      r("CMB-11", "Impressão/exportação do LMC no formato exigido para fiscalização e arquivo.", "Alta"),
    ],
  },
  {
    slug: "rh", nome: "Recursos Humanos / DP", fase: 2,
    escopo: "Cadastro, ponto, atestados, escalas, férias, uniformes e EPI, advertências, comunicados, envio à contabilidade.",
    kpis: ["Absenteísmo", "Horas extras", "Turnover", "% escalas cobertas", "EPIs em dia"],
    requisitos: [
      r("RH-01", "Cadastro completo de colaboradores: dados pessoais, cargo, admissão, salário base, documentos digitalizados, tamanhos de uniforme e calçado.", "Alta"),
      r("RH-02", "Controle de ponto: importação do relógio de ponto ou registro via app com geolocalização; espelho de ponto; banco de horas.", "Alta"),
      r("RH-03", "Tratamento de ocorrências de ponto: atrasos, faltas, horas extras, abonos (com aprovação do gerente).", "Alta"),
      r("RH-04", "Registro de atestados médicos (data, dias, CID opcional, anexo) com reflexo automático no ponto e na escala.", "Alta"),
      r("RH-05", "Escala de folgas mensal com regras (folga semanal, domingos alternados, limites de horas), detecção de conflitos e publicação no app.", "Alta"),
      r("RH-06", "Escala do GNV separada, com cobertura mínima por turno e alerta de buraco na escala.", "Alta"),
      r("RH-07", "Programação e controle de férias (período aquisitivo, vencimento, aviso).", "Média"),
      r("RH-08", "Uniformes e EPI: estoque por item e tamanho, ficha de entrega com assinatura digital, periodicidade de troca e CA do EPI com validade.", "Alta"),
      r("RH-09", "Alerta de EPI/uniforme com troca vencida por colaborador e sugestão de compra.", "Média"),
      r("RH-10", "Advertências e suspensões: modelo de documento, registro, assinatura e histórico por colaborador.", "Alta"),
      r("RH-11", "Comunicados internos com confirmação de leitura pelo app.", "Média"),
      r("RH-12", "Controle de ASO (admissional, periódico, demissional) e treinamentos obrigatórios com validade.", "Alta"),
      r("RH-13", "Fechamento mensal do RH: relatório de ponto, faltas, atestados, horas extras e descontos para a contabilidade.", "Alta"),
      r("RH-14", "Admissão e desligamento com checklist de documentos e devolução de uniformes/EPI.", "Média"),
    ],
  },
  {
    slug: "administrativo", nome: "Administrativo", fase: null,
    escopo: "Tarefas, checklists, manutenção, fornecedores, contratos, ocorrências.",
    kpis: [],
    requisitos: [
      r("ADM-01", "Gestão de tarefas e rotinas recorrentes (diárias, semanais, mensais) com responsável, prazo e status.", "Alta"),
      r("ADM-02", "Checklists configuráveis (abertura de loja, limpeza de banheiros, inspeção de extintores, etc.) preenchidos pelo celular com foto.", "Média"),
      r("ADM-03", "Manutenção de equipamentos: cadastro (bombas, compressor GNV, gerador, câmaras frias), manutenções preventivas e corretivas, custos.", "Média"),
      r("ADM-04", "Cadastro de fornecedores e prestadores com contatos, condições comerciais e avaliação.", "Alta"),
      r("ADM-05", "Gestão de contratos (bandeira/distribuidora, aluguel, prestadores, adquirentes) com vigência, reajuste e alertas.", "Média"),
      r("ADM-06", "Livro de ocorrências administrativas e registro de visitas de fiscalização.", "Média"),
      r("ADM-07", "Agenda do gerente integrada a vencimentos de todos os módulos.", "Baixa"),
    ],
  },
  {
    slug: "licencas", nome: "Licenças, alvarás e documentos", fase: 1, rota: "/painel",
    escopo: "Cadastro de documentos, vencimentos, alertas, repositório digital, histórico de renovações.",
    kpis: ["% documentos em dia", "Renovações iniciadas no prazo"],
    requisitos: [
      r("LIC-01", "Cadastro de documentos com todos os campos e repositório digital pesquisável.", "Alta"),
      r("LIC-02", "Alertas escalonados de vencimento (ex.: 90, 60, 30, 15 e 7 dias) por e-mail, app e painel.", "Alta"),
      r("LIC-03", "Fluxo de renovação com etapas (juntar documentos, protocolar, pagar taxa, aguardar emissão) e anexos por etapa.", "Alta"),
      r("LIC-04", "Painel de semáforo: em dia, a vencer, vencido, em renovação.", "Alta"),
      r("LIC-05", "Histórico de renovações e custos anuais com regularização.", "Média"),
      r("LIC-06", "Lançamento automático da taxa de renovação em contas a pagar.", "Média"),
      r("LIC-07", "Compartilhamento controlado de documentos com contador e fiscalização (link com validade).", "Baixa"),
    ],
  },
  {
    slug: "financeiro", nome: "Financeiro", fase: 1,
    escopo: "Contas a pagar/receber, conciliação bancária e de cartões, fluxo de caixa, DRE gerencial.",
    kpis: ["Saldo de caixa", "Prazo médio de recebimento", "Taxa média de cartão", "Inadimplência", "Diferenças de conciliação"],
    requisitos: [
      r("FIN-01", "Contas a pagar: lançamento manual ou por importação de XML de NF-e, parcelas, centro de custo, aprovação e baixa.", "Alta"),
      r("FIN-02", "Contas a receber: vendas a prazo/frotas, faturas de clientes, notas assinadas, cobrança e controle de inadimplência.", "Alta"),
      r("FIN-03", "Conciliação bancária: importação de extrato (OFX/CNAB ou API bancária) e casamento automático com lançamentos.", "Alta"),
      r("FIN-04", "Conciliação de cartões: importação das vendas (ERP) e dos recebíveis (adquirentes), conferência de taxas contratadas, prazos, chargebacks e antecipações.", "Alta"),
      r("FIN-05", "Conciliação de PIX e depósitos de caixa dos turnos.", "Alta"),
      r("FIN-06", "Fechamento de caixa diário consolidado (todos os turnos + loja) com envio ao cofre/banco.", "Alta"),
      r("FIN-07", "Fluxo de caixa realizado e projetado (diário, semanal, mensal).", "Alta"),
      r("FIN-08", "DRE gerencial por unidade de negócio (combustíveis, GNV, conveniência, serviços).", "Média"),
      r("FIN-09", "Plano de contas e centros de custo configuráveis.", "Alta"),
      r("FIN-10", "Controle de cheques, vales de frota e convênios.", "Média"),
      r("FIN-11", "Pacote mensal para a contabilidade: extratos, conciliações, notas de entrada/saída, LMC e relatórios de RH em um único envio.", "Alta"),
      r("FIN-12", "Indicadores de custo financeiro: taxa média de cartão, custo de antecipação, juros pagos.", "Média"),
    ],
  },
  {
    slug: "conveniencia", nome: "Conveniência", fase: 2,
    escopo: "Entrada de notas, precificação, margem, avarias e perdas, curva ABC.",
    kpis: ["Faturamento", "Margem", "Ticket médio", "Perdas por avaria/validade (% das vendas)"],
    requisitos: [
      r("CONV-01", "Entrada de notas por importação de XML ou chave da NF-e, com conferência item a item (quantidade, validade, preço de custo).", "Alta"),
      r("CONV-02", "Divergências na entrada (falta, sobra, avaria, preço diferente) registradas e vinculadas ao fornecedor.", "Alta"),
      r("CONV-03", "Precificação: margem/markup por categoria, preço sugerido, alerta quando o custo subir e a margem cair abaixo da meta.", "Alta"),
      r("CONV-04", "Emissão de etiquetas de gôndola após alteração de preço.", "Média"),
      r("CONV-05", "Registro de avarias, vencidos e perdas com motivo, foto e valor, gerando nota/baixa de estoque.", "Alta"),
      r("CONV-06", "Controle de validade com alerta de produtos próximos ao vencimento.", "Alta"),
      r("CONV-07", "Relatórios de venda, margem, curva ABC, itens sem giro e ticket médio.", "Média"),
      r("CONV-08", "Promoções e combos (ex.: abasteceu, ganhou desconto no café).", "Baixa"),
    ],
  },
  {
    slug: "estoques", nome: "Estoques", fase: 2,
    escopo: "Estoque da loja, lubrificantes, filtros, insumos, uniformes/EPI; inventários e ajustes.",
    kpis: ["Acuracidade de inventário", "Giro", "Ruptura"],
    requisitos: [
      r("EST-01", "Estoque multi-local: loja, depósito, lubrificantes/filtros da pista, uniformes/EPI, materiais de limpeza e escritório.", "Alta"),
      r("EST-02", "Movimentações rastreadas: entrada, venda, transferência, consumo interno, avaria, ajuste (com aprovação).", "Alta"),
      r("EST-03", "Inventário: contagem cíclica e geral pelo celular (leitor de código de barras), comparativo com o sistema e ajuste aprovado.", "Alta"),
      r("EST-04", "Estoque mínimo e máximo por item com alerta de ruptura.", "Alta"),
      r("EST-05", "Custo médio e valor total do estoque por local e categoria.", "Alta"),
      r("EST-06", "Relatório de acuracidade de inventário e perdas por período.", "Média"),
    ],
  },
  {
    slug: "pedidos", nome: "Pedidos e compras", fase: 2,
    escopo: "Sugestão de compra, pedidos de combustível e mercadoria, cotação, recebimento.",
    kpis: ["Economia em cotações", "Ruptura"],
    requisitos: [
      r("PED-01", "Sugestão automática de compra com base em giro médio, estoque atual, estoque mínimo e prazo de entrega do fornecedor.", "Alta"),
      r("PED-02", "Pedido de combustível: sugestão por tanque considerando cobertura, capacidade livre (ullage) e melhor janela de descarga.", "Alta"),
      r("PED-03", "Cotação entre fornecedores e registro do vencedor.", "Média"),
      r("PED-04", "Fluxo de aprovação de pedidos por valor.", "Média"),
      r("PED-05", "Acompanhamento do pedido (emitido, confirmado, faturado, entregue) e vínculo com a NF de entrada.", "Alta"),
      r("PED-06", "Compras de uniformes e EPI a partir das necessidades geradas pelo RH.", "Média"),
      r("PED-07", "Histórico de preços pagos por fornecedor e item.", "Média"),
    ],
  },
  {
    slug: "painel-gerencial", nome: "Painel gerencial e alertas", fase: 1,
    escopo: "Dashboard gerencial, notificações, relatórios.",
    kpis: [],
    requisitos: [
      r("PNL-01", "Dashboard inicial: vendas do dia (litros e R$), margem, caixa, nível dos tanques, pendências e vencimentos.", "Alta"),
      r("PNL-02", "Central de alertas unificada com prioridade e responsável (tanque baixo, LMC fora da tolerância, documento a vencer, título vencendo, escala descoberta, EPI vencido).", "Alta"),
      r("PNL-03", "Notificações por app, e-mail e WhatsApp (configurável por perfil).", "Média"),
      r("PNL-04", "Relatórios exportáveis em PDF e Excel em todos os módulos.", "Alta"),
      r("PNL-05", "Comparativo de períodos (dia, semana, mês, ano anterior).", "Média"),
    ],
  },
];

export const ROADMAP = [
  { fase: 1, nome: "Fase 1 – MVP", prazo: "3 a 4 meses", conteudo: "Pista (turno e caixa), Combustíveis/LMC, Licenças e alvarás, Financeiro (pagar/receber e conciliações), Painel e alertas básicos, integração Linx/Webposto, bancos e cartões." },
  { fase: 2, nome: "Fase 2", prazo: "+3 meses", conteudo: "RH completo (ponto, escalas, atestados, EPI, advertências), Conveniência, Estoques, Pedidos e compras, pacote para a contabilidade." },
  { fase: 3, nome: "Fase 3", prazo: "+3 a 6 meses", conteudo: "Automação de pista e sondas, DRE gerencial avançado, multi-posto, metas e comissões, promoções, BI." },
];

export const OBJETIVOS = [
  { objetivo: "Reduzir tempo de rotinas financeiras diárias", meta: "-50% no tempo gasto em conciliações" },
  { objetivo: "Zerar vencimentos não planejados de licenças", meta: "0 documentos vencidos sem alerta prévio" },
  { objetivo: "Controlar perdas de combustível", meta: "Variação do LMC dentro da tolerância em 100% dos dias, com justificativa" },
  { objetivo: "Evitar ruptura de combustível", meta: "0 bicos parados por falta de produto" },
  { objetivo: "Reduzir diferenças de caixa", meta: "-30% no valor total de quebras de caixa" },
  { objetivo: "Agilizar fechamento mensal com a contabilidade", meta: "Pacote enviado até o 3º dia útil" },
];

export const PERFIS = [
  { perfil: "Proprietário / Diretor", necessidade: "Visão consolidada de resultado, margem, caixa e riscos; leitura de tudo." },
  { perfil: "Gerente", necessidade: "Operar e aprovar todas as rotinas; dashboards; alertas; envio à contabilidade." },
  { perfil: "Administrativo / Financeiro", necessidade: "Contas a pagar/receber, conciliações, LMC, documentos." },
  { perfil: "Chefe de pista / Supervisor", necessidade: "Abertura e fechamento de turno, encerrantes, medições, escalas do turno." },
  { perfil: "Frentista", necessidade: "App simples: ponto, escala, prestação de contas do caixa, pedido de EPI." },
  { perfil: "Operador de conveniência", necessidade: "Entrada de mercadoria, contagem, registro de avaria." },
  { perfil: "Contador (externo)", necessidade: "Acesso restrito ao pacote mensal e documentos compartilhados." },
];

export const INTEGRACOES = [
  { sistema: "Linx / Webposto (ERP/PDV)", dados: "Vendas por bico/produto/turno, encerrantes, produtos, vendas da conveniência, notas emitidas.", fase: 1 },
  { sistema: "Bancos (OFX/CNAB ou API)", dados: "Extratos, boletos, PIX recebidos.", fase: 1 },
  { sistema: "Adquirentes de cartão", dados: "Vendas, recebíveis, taxas, chargebacks, antecipações.", fase: 1 },
  { sistema: "SEFAZ / XML de NF-e", dados: "Notas de entrada (combustível e mercadorias).", fase: 1 },
  { sistema: "Relógio de ponto", dados: "Marcações de ponto (arquivo AFD ou API).", fase: 1 },
  { sistema: "Contabilidade", dados: "Pacote mensal (exportação de arquivos ou portal).", fase: 2 },
  { sistema: "WhatsApp / e-mail", dados: "Envio de alertas e comunicados.", fase: 2 },
  { sistema: "Automação de pista / sondas de tanque", dados: "Encerrantes e níveis em tempo real.", fase: 3 },
];
