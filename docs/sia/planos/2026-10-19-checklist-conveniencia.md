# Plano: Checklist da Conveniência (com a cara nova)

**Objetivo:** a funcionária envia o checklist diário pelo celular e a gerente dá baixa, item por item, nas pendências que ele gera. Tudo já no tema escuro aprovado.

**Como se encaixa:** o item Conveniência do menu deixa de apontar para a página do plano e passa a abrir `/conveniencia`, com as abas Checklist, Pendências e Histórico. Os dados ficam em três tabelas novas e são gravados de uma vez por uma função do banco. As fotos vão para o bucket `documentos`, que já existe, na pasta `conveniencia/`, para não depender de criar um bucket novo. O tema escuro entra em `src/styles.css` pelas variáveis que os componentes já usam.

**Escolhas:** docs/sia/escolhas.md (TanStack Start + React + Tailwind/shadcn, Supabase do Lovable Cloud, Vitest, Zod). Ligação pendente: o Lovable precisa aplicar a mudança do banco (Parte 3).

**Combinado:** docs/sia/combinado.md

**Cara:** docs/sia/visual.md

**Ritmo:** até o fim

## Vale em todas as partes

- Cores, letras, cantos e estados só pelos tokens de `docs/sia/visual.md`. Nenhum HEX solto em componente.
- Nove perguntas de sim ou não, obrigatórias. Operacional: veio produto sem cadastro, mercadoria abastecida, notas de bonificação/trocas, transferências realizadas. Manutenção: loja limpa, lixo retirado, loja organizada, freezers organizados, material de uso e consumo abastecido.
- Código: só números, de 1 a 20 dígitos. Quantidade: inteiro ≥ 1, padrão 1. Providência: `transferir`, `devolucao` ou `ajuste`. Com `ajuste`, o texto do ajuste é obrigatório.
- Data: hoje por padrão, nunca futura. Nome da funcionária: obrigatório. O login que enviou é gravado pelo banco (`auth.uid()`).
- Fotos: de 0 a 10, só imagem, até 10 MB cada.
- Depois de enviadas, as respostas não mudam e nada é apagado. Só `resolvido_em` e `resolvido_por` podem mudar (nos códigos e no "o que precisa ser feito").
- Quem não está logado não lê nada.
- Botão que envia ou dá baixa fica travado até a ação terminar.
- As regras de validação moram em um lugar só: `src/lib/checklist.ts` (tela) e as CHECKs da migração (banco), com os mesmos valores.

## O que mais pode morder

1. A mudança do banco não ser aplicada, e a tela quebrar no Lovable. Prova: o teste do banco roda a migração inteira num Postgres em memória (Parte 3), e a aba mostra um erro claro se a tabela não existir (Parte 4).
2. Duplo toque em "Enviar" gravar dois checklists. Prova na Parte 4: o segundo clique, durante o envio, não chama a função.
3. Fotos subirem e a gravação falhar, deixando arquivo sem checklist. Aceito: arquivo órfão fica invisível e nada aparece pela metade. Prova na Parte 3: a falha da função não grava nenhuma linha.
4. Código lido pela câmera com espaço ou quebra de linha. Prova na Parte 2: `normalizarCodigo(" 7891234567890\n")` devolve `"7891234567890"`.
5. Fuso horário marcar como "futura" a data de hoje à noite. Prova na Parte 2: `hojeISO()` usa a data local, e 23:30 de 19/10 em Natal (UTC-3) continua sendo 19/10.

### Parte 1: Cara nova e a casa do módulo

**Arquivos:**
- Mudar: `src/styles.css`: tokens do tema escuro como padrão (`.dark` e `:root` conforme o tema escolhido), tema claro atual mantido, fontes Inter, Plus Jakarta Sans e JetBrains Mono nas variáveis `--font-sans`, `--font-display` e `--font-mono`, utilitário `tabular-nums` nas métricas.
- Mudar: `src/routes/__root.tsx`: link do Google Fonts com as três fontes no lugar de DM Sans/Space Grotesk, e script que aplica o tema antes de pintar a página.
- Criar: `src/lib/tema.ts`: `temaInicial(salvo: "claro" | "escuro" | null, sistemaEscuro: boolean) -> "claro" | "escuro"` e `aplicarTema(t)`.
- Mudar: `src/components/layout/AppShell.tsx`: item "Tema escuro / claro" no menu do usuário.
- Mudar: `src/components/layout/nav.ts`: Conveniência com `destino: { to: "/conveniencia" }` e o tipo de `to` ampliado.
- Mudar: `src/lib/prd.ts`: módulo conveniência com `rota: "/conveniencia"` (o tipo `rota` aceita a nova rota).
- Criar: `src/routes/_authenticated/conveniencia.tsx`: `PageHeader` e `Tabs` (peça `src/components/ui/tabs.tsx`) com Checklist, Pendências e Histórico, cada uma mostrando por enquanto o estado vazio da cara.
- Prova: `src/test/tema.test.ts` (regra) e `src/test/app-routing.test.tsx` (regra: a rota existe).

**Encaixa:**
- Entrega: rota `/conveniencia` com as abas `checklist`, `pendencias` e `historico` (aba na URL: `?aba=`). Tokens prontos para todas as telas.

- [x] **Passo 1: Escrever a prova que falha.** `temaInicial(null, true) === "escuro"`, `temaInicial(null, false) === "claro"`, `temaInicial("claro", true) === "claro"`. Em app-routing, `router.matchRoutes("/conveniencia")` termina em `/_authenticated/conveniencia`. Em nav: `tituloDaRota("/conveniencia") === "Conveniência"`.
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/tema.test.ts src/test/app-routing.test.tsx`. Esperado: FAIL, porque `src/lib/tema.ts` e a rota não existem.
- [x] **Passo 3: Implementar.** Tokens do visual.md mapeados nas variáveis shadcn existentes (`--background` = bg-base, `--card` = surface-1, `--popover` = surface-3, `--primary` = brand, `--primary-foreground` = brand-ink, `--muted-foreground` = text-muted, `--border` = border-default, `--ring` = brand, `--ok`/`--warn`/`--late` + `-soft` = status; novo `--info`/`--info-soft`; `--sidebar*` = surface-1/brand). Tema salvo em `localStorage` (com try/catch).
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit && npx eslint src`. Esperado: PASS. Depois, abrir `http://localhost:5173/conveniencia` e conferir as três abas no tema escuro em 375, 768 e 1280px.
- [x] **Passo 5: Commit.** `Conveniência: tema escuro e casa do módulo`.

### Parte 2: A regra do checklist

**Arquivos:**
- Criar: `src/lib/checklist.ts`: `PERGUNTAS` (as nove, com `chave`, `rotulo` da folha, `grupo: "operacional" | "manutencao"`), `PROVIDENCIAS`, `checklistSchema` (Zod), `codigoSchema`, `normalizarCodigo(s) -> string`, `hojeISO(agora?: Date) -> string`, `paraPayload(form) -> PayloadEnvio` (formato da função do banco), `agruparPendencias(codigos, checklists) -> { transferir, devolucao, ajuste, aFazer }`.
- Prova: `src/test/checklist.test.ts` (regra).

**Encaixa:**
- Usa: nada.
- Entrega: `checklistSchema`, `paraPayload`, `agruparPendencias` e `PERGUNTAS`, usados nas Partes 4 a 6.

- [x] **Passo 1: Escrever a prova que falha.** Combinado, provas 2 a 5: sem `loja_limpa`, o erro é "Responda se a loja está limpa". `ajuste` sem texto dá "Escreva qual ajuste precisa ser feito". `"78A9"` dá "Código só pode ter números". 13 dígitos passam, 21 não. Data de amanhã é recusada. Também as linhas 4 e 5 de "o que mais pode morder", e `agruparPendencias` separando por providência e ignorando os resolvidos (a menos que `mostrarResolvidos`).
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/checklist.test.ts`. Esperado: FAIL, módulo inexistente.
- [x] **Passo 3: Implementar** com Zod e mensagens em português, uma por campo.
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit`. Esperado: PASS.
- [x] **Passo 5: Commit.** `Conveniência: regras do checklist`.

### Parte 3: O banco

**Arquivos:**
- Criar: `drizzle/migrations/0002_checklist_conveniencia.sql`:
  - `checklists`: id, data (CHECK data ≤ current_date), funcionaria (texto não vazio), as nove respostas `boolean NOT NULL` + observação de cada uma, os campos de texto da folha, `a_fazer`, `a_fazer_resolvido_em`, `a_fazer_resolvido_por`, `enviado_por uuid DEFAULT auth.uid()` e `created_at`.
  - `checklist_fotos`: id, checklist_id, path, nome.
  - `checklist_codigos`: id, checklist_id, codigo (CHECK `^[0-9]{1,20}$`), providencia (CHECK in transferir/devolucao/ajuste), quantidade (CHECK ≥ 1), ajuste (CHECK obrigatório quando providencia = ajuste), resolvido_em, resolvido_por.
  - Função `enviar_checklist(p jsonb) RETURNS uuid`, SECURITY INVOKER, que grava as três tabelas numa transação só.
  - RLS: leitura para `authenticated`. INSERT só para `authenticated`. UPDATE concedido só nas colunas de baixa (`GRANT UPDATE (resolvido_em, resolvido_por)` e `(a_fazer_resolvido_em, a_fazer_resolvido_por)`). Nenhum DELETE. Nada para `anon`.
- Mudar: `drizzle/migrations/meta/_journal.json` (entrada idx 2).
- Mudar: `src/integrations/supabase/types.ts`: tipos das três tabelas e da função, escritos à mão no formato que já está lá.
- Criar: `src/test/sistema/checklist-banco.test.ts`: roda a migração num Postgres em memória (`@electric-sql/pglite`, devDependency) com `auth.uid()` simulado e papéis `authenticated`/`anon` criados no teste.
- Prova: sistema (banco), combinado, provas 8, 9, 11 e as CHECKs das provas 3 a 5.

**Encaixa:**
- Usa: o formato de `paraPayload` (Parte 2).
- Entrega: tabelas `checklists`, `checklist_fotos`, `checklist_codigos` e a função `enviar_checklist`.

- [x] **Passo 1: Escrever a prova que falha.**
  - Como `authenticated`, `enviar_checklist` com 3 códigos grava 1 checklist e 3 códigos.
  - Um payload com um código inválido no fim não grava nada (prova 11).
  - UPDATE em `checklists.loja_limpa` é negado, DELETE em qualquer tabela é negado (prova 8), e UPDATE de `resolvido_em` funciona.
  - Como `anon`, SELECT é negado nas três tabelas (prova 9).
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/sistema`. Esperado: FAIL, migração inexistente.
- [x] **Passo 3: Implementar a migração** no estilo de `0001_renovacoes.sql` (comentário com o requisito, `SET search_path = public`).
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit`. Esperado: PASS.
- [x] **Passo 5: Commit.** `Conveniência: banco do checklist`.
- [ ] **Passo 6: Aplicar no banco do Lovable.** Com o sim da pessoa: enviar ao GitHub (`git push`) e a pessoa pede no chat do Lovable para aplicar as migrações pendentes de `drizzle/migrations` (0001 e 0002). Conferir pela API que `checklists` e `renovacoes` passaram a existir.

### Parte 4: Aba Checklist (funcionária)

**Arquivos:**
- Criar: `src/components/conveniencia/FormChecklist.tsx`: o formulário na ordem do combinado, com as peças `Input`, `Textarea`, `RadioGroup` (sim/não), `Button` e `Label`.
- Criar: `src/components/conveniencia/FotosChecklist.tsx`: escolher ou tirar fotos (`<input type="file" accept="image/*" capture="environment" multiple>`), miniaturas e remover.
- Criar: `src/components/conveniencia/CodigosChecklist.tsx`: campo de código, providência, quantidade e ajuste, mais a lista agrupada com remover. O botão "Ler código" fica como ponto de encaixe da Parte 5.
- Criar: `src/lib/conveniencia.ts`: `enviarChecklist(form, fotos) -> Promise<string>` (sobe as fotos em `documentos/conveniencia/<uuid>/` com `nomeSeguro`, depois chama `rpc("enviar_checklist")`), e os hooks `useChecklists()` e `useCodigos()` no padrão de `src/lib/queries.ts`.
- Mudar: `src/routes/_authenticated/conveniencia.tsx` (aba Checklist usa `FormChecklist`).
- Prova: `src/test/conveniencia/form-checklist.test.tsx` (regra na tela, com Testing Library e o supabase simulado).

**Encaixa:**
- Usa: `checklistSchema`, `paraPayload` e `PERGUNTAS` (Parte 2); `enviar_checklist` (Parte 3).
- Entrega: `CodigosChecklist` com a prop `onCodigoLido(codigo)` para a Parte 5; `useChecklists` e `useCodigos` para as Partes 6 e 7.

- [x] **Passo 1: Escrever a prova que falha.**
  - Preencher as nove respostas, 2 fotos e 3 códigos e enviar: o `rpc` é chamado uma vez, com 3 códigos e 2 caminhos de foto (prova 1).
  - Um segundo clique durante o envio não chama de novo.
  - Uma falha do `rpc` mostra "Não foi possível enviar. Nada foi gravado. Tente de novo." e o formulário continua preenchido.
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/conveniencia`. Esperado: FAIL, componente inexistente.
- [x] **Passo 3: Implementar.** Campos com 16px no celular, botão principal com o glow do token `brand-glow`, "Enviando…" e travado durante o envio. Se a tabela não existir (erro PGRST205), a aba mostra "O banco ainda não foi atualizado. Avise a gerência."
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit && npx eslint src`. Esperado: PASS. No navegador, enviar um checklist de teste depois que a Parte 3 estiver aplicada.
- [x] **Passo 5: Commit.** `Conveniência: aba Checklist`.

### Parte 5: Ler o código pela câmera

**Arquivos:**
- Criar: `src/components/conveniencia/LeitorCodigo.tsx`: abre a câmera traseira num `Dialog`, lê EAN-13, EAN-8, UPC-A, UPC-E e Code 128 com `@zxing/browser` (dependência nova, versão fixa), entrega o número por `onLido(codigo)` e fecha. Se a câmera for negada ou houver falha, mostra "Não consegui ler. Digite o código." e devolve o foco ao campo.
- Mudar: `src/components/conveniencia/CodigosChecklist.tsx` (o botão "Ler código" abre o `LeitorCodigo`).
- Prova: `src/test/conveniencia/leitor-codigo.test.tsx` (regra na tela, com `getUserMedia` simulado).

**Encaixa:**
- Usa: `onCodigoLido` (Parte 4) e `normalizarCodigo` (Parte 2).

- [x] **Passo 1: Escrever a prova que falha.** Com `getUserMedia` rejeitado: aparece "Não consegui ler. Digite o código." e o campo de código fica em foco (prova 10). Com o leitor simulado devolvendo `"7891234567890\n"`, `onLido` recebe `"7891234567890"`.
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/conveniencia/leitor-codigo.test.tsx`. Esperado: FAIL.
- [x] **Passo 3: Implementar.** Liberar a câmera ao fechar o diálogo.
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit`. Esperado: PASS. No celular, pelo link do Lovable (a câmera exige https), ler um código de verdade.
- [x] **Passo 5: Commit.** `Conveniência: leitura de código pela câmera`.

### Parte 6: Aba Pendências (gerente)

**Arquivos:**
- Criar: `src/components/conveniencia/Pendencias.tsx`: quatro blocos (Transferir, Nota de devolução, Ajuste, O que precisa ser feito) com a contagem, a linha de cada item, botão **Resolvido** e o filtro "Mostrar resolvidos" com **Reabrir**. Usa as peças `Card`, `Badge`, `Button` e `Skeleton`.
- Mudar: `src/lib/conveniencia.ts`: `marcarResolvido(tabela, id, resolvido: boolean)`.
- Mudar: `src/routes/_authenticated/conveniencia.tsx` (aba Pendências).
- Prova: `src/test/conveniencia/pendencias.test.tsx` (regra na tela).

**Encaixa:**
- Usa: `useCodigos`, `useChecklists` (Parte 4) e `agruparPendencias` (Parte 2).

- [x] **Passo 1: Escrever a prova que falha.** Clicar em Resolvido chama `update` com `resolvido_em` preenchido, e o item sai dos abertos. Com "Mostrar resolvidos", aparecem quem resolveu e quando, e Reabrir zera os dois campos (prova 6). O "o que precisa ser feito" aparece e sai do mesmo jeito (prova 7). Sem itens, aparece "Nenhuma pendência aberta".
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/conveniencia/pendencias.test.tsx`. Esperado: FAIL.
- [x] **Passo 3: Implementar.** Status com ícone + texto, nas cores de status do visual.md.
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit && npx eslint src`. Esperado: PASS.
- [x] **Passo 5: Commit.** `Conveniência: pendências da gerente`.

### Parte 7: Aba Histórico

**Arquivos:**
- Criar: `src/components/conveniencia/Historico.tsx`: a lista do mais recente para o mais antigo, com a data, a funcionária e quantos códigos estão abertos. Abrir um checklist mostra tudo num `Sheet` (peça existente), com as fotos por link temporário (`createSignedUrl`, 120s, como em `src/lib/arquivos.ts`).
- Mudar: `src/routes/_authenticated/conveniencia.tsx` (aba Histórico).
- Prova: `src/test/conveniencia/historico.test.tsx` (regra na tela).

**Encaixa:**
- Usa: `useChecklists`, `useCodigos` (Parte 4).

- [x] **Passo 1: Escrever a prova que falha.** A ordem é do mais recente para o mais antigo. A contagem de abertos está certa. Sem checklists, aparece "Nenhum checklist enviado ainda".
- [x] **Passo 2: Rodar e ver falhar.** Rodar: `npx vitest run src/test/conveniencia/historico.test.tsx`. Esperado: FAIL.
- [x] **Passo 3: Implementar.**
- [x] **Passo 4: Rodar e ver passar.** Rodar: `npx vitest run && npx tsc --noEmit && npx eslint src`. Esperado: PASS. No navegador, abrir o checklist de teste e ver as fotos.
- [x] **Passo 5: Commit.** `Conveniência: histórico de checklists`.

## Cobertura das provas do combinado

| Prova | Parte |
| --- | --- |
| 1. Checklist completo gravado e códigos em Pendências | 3 (banco) e 4 (tela) |
| 2. Sem "Loja limpa", recusa | 2 |
| 3. Ajuste sem texto, recusa | 2 e 3 |
| 4. Código com letra recusado, 13 dígitos aceito | 2 e 3 |
| 5. Data futura recusada | 2 e 3 |
| 6. Resolver e reabrir código | 3 (permissão) e 6 |
| 7. "O que precisa ser feito" resolvido | 3 (permissão) e 6 |
| 8. Respostas imutáveis, nada apagado | 3 |
| 9. Sem login não lê | 3 (tabelas). Fotos: depende da regra atual do bucket `documentos`, conferida na Parte 3, passo 6 |
| 10. Câmera falha, digita | 5 |
| 11. Falha no meio não grava nada | 3 |
