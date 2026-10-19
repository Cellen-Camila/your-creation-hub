docs/sia/planos/2026-10-19-checklist-conveniencia.md

Início: 2026-10-19. Linha de base: `npx vitest run` → 3 arquivos, 8 testes passando; `npx tsc --noEmit` → sem erros.

Decisão: `.env` continua versionado no Git — ele só tem a URL e a chave publicável (pública por natureza) do Supabase do Lovable, e o Lovable depende dele — custo se estiver errado: nenhum segredo exposto hoje; se um dia entrar chave secreta, ela vai para o GitHub. Por isso nenhuma chave secreta entra nesse arquivo.

Decisão: a prova de lint roda só nos arquivos criados/mudados por parte (`npx eslint <arquivos>`) — `npx eslint src` já falhava antes (milhares de "Delete ␍" do prettier por quebra de linha CRLF do Windows com core.autocrlf=true, mais 7 erros antigos em src/components/ui e previewAuthStorage.ts) — custo se estiver errado: erro de lint em arquivo antigo não é pego.
Parte 1: pronta (npx vitest run → 4 arquivos, 13 testes passando; npx tsc --noEmit → limpo; npx eslint nos 3 arquivos novos → limpo; commit caa8201). Tela de entrada vista no tema escuro; /conveniencia e o menu lateral não vistos (exigem login).
Parte 2: pronta (npx vitest run → 5 arquivos, 33 testes passando; npx tsc --noEmit → limpo; eslint nos 2 arquivos → limpo; commit aae4211).
Parte 3 (passos 1–5): pronta (npx vitest run → 6 arquivos, 44 testes passando, incluindo src/test/sistema com 11 casos no PGlite 0.5.10; npx tsc --noEmit → limpo; commits 63a4ca6 e 89cc528). Passo 6 (enviar ao GitHub e o Lovable aplicar 0001 e 0002) aguarda o sim da pessoa no fim da lista.
Decisão: policies prendem enviado_por e resolvido_por ao login (auth.uid()) — o plano só pedia leitura/criação/baixa para a equipe; sem isso, quem chamasse o banco direto podia registrar a baixa em nome de outra pessoa — custo se estiver errado: nenhum para a tela, que sempre grava o próprio login.
Decisão: src/test/setup.ts protegido com `typeof window` para o teste do banco rodar em ambiente node — custo: nenhum nos testes de tela.
Decisão: bun.lock atualizado só com @electric-sql/pglite (bun 1.2.21; linha configVersion mantida à mão) — custo se estiver errado: o Lovable pode reinstalar o lock na próxima edição dele.
Parte 4: pronta (npx vitest run → 7 arquivos, 49 testes passando; npx tsc --noEmit → limpo; eslint nos arquivos da parte → limpo; commit 7529215). Formulário ainda não aberto no navegador logado.
Decisão: providência em <select> nativo e trava do envio por ref síncrona — o select nativo é melhor no celular, e a ref fecha o duplo clique que o estado sozinho deixava passar — custo: visual do select um pouco diferente dos outros campos.
Parte 5: pronta (npx vitest run → 8 arquivos, 52 testes passando; npx tsc --noEmit → limpo; eslint nos 4 arquivos → limpo; commit 1378218; @zxing/browser 0.2.1 e @zxing/library 0.23.0). Leitura real só dá para provar no celular pelo link https do Lovable.
Decisão: o estado do leitor mora no CodigosChecklist (props onLerCodigo/codigoLido do plano removidas) — caminho mais curto — custo: nenhum.
Parte 6: pronta (npx vitest run → 66 testes passando; npx tsc --noEmit → limpo; eslint nos arquivos da parte → limpo; commit 6a1e147).
Parte 7: pronta (npx vitest run → 66 testes passando; npx tsc --noEmit → limpo; eslint nos arquivos da parte → limpo; commit f946818). Sheet e fotos ainda não abertos no navegador logado.
Decisão: "quem resolveu" aparece como "por você" ou "por outra pessoa da equipe" — o banco só guarda o id do login e não há cadastro de nomes — custo: a gerente não vê o nome de quem deu a baixa até existir perfil de usuário.
Investigação: o teste "envia nove respostas, 2 fotos e 3 códigos" falhou 1 vez em 3 rodadas por tempo (5s padrão; leva ~4,3s sozinho em máquina de 2 núcleos). Causa: limite de tempo do teste, não o formulário. Correção: limite de 20s no grupo FormChecklist (commit seguinte a f946818); 3 rodadas seguidas → 66/66.
Revisão (revisor independente): 3 graves e 6 importantes, todos corrigidos com prova que falhou antes (commits 861a003 e 8976e9b).
Conferência em 2026-10-19: npx vitest run → 11 arquivos, 85 testes passando (16 do banco no PGlite); npx tsc --noEmit → limpo; eslint nos arquivos tocados → limpo.
Sem prova visual logada: /conveniencia, o menu lateral escuro e o envio real não foram abertos no navegador (exige login e a migração aplicada). Leitura de código real só no celular pelo link https.
Mapa de quem chama quem: continua pendente (graphify não instalado).
Adiado (miúdo): miniaturas podem piscar ao remover uma foto (URLs revogadas antes do novo estado).
Pendente: Parte 3, passo 6 — enviar ao GitHub e o Lovable aplicar 0001 e 0002 — espera o sim da pessoa.
