<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Documents are shared by the whole signed-in team (RLS: any authenticated user); renewal date and status are computed client-side in src/lib/docs.ts — keeps a single source of truth from vencimento + antecedência.
- Product scope lives in docs/PRD.md (Plataforma de Gestão Integrada do Posto, v1.0). Requirement IDs (PIS-01, LIC-02, FIN-03…) and the phase roadmap there are the reference for new modules; today only part of module 5.5 (Licenças) is built.

<!-- SIA:inicio -->
# Para o agente

O que o sistema faz está em docs/sia/combinado.md. Este arquivo não repete isso.

## Prova

- Regra: `npx vitest run`
- Quem usa: sem ferramenta de fluxo no browser (Playwright não instalado); a tela é aberta à mão em `npm run dev` (porta 5173)
- Sistema: `npx vitest run src/test/sistema` (banco em memória com PGlite)
- Lint: `npx eslint <arquivos da parte>` (`npx eslint src` falha por CRLF pré-existente)
- Tipos: `npx tsc --noEmit`

## Pronto

Pronto só com esses comandos rodados nesta conversa, saída lida, e cada parte do plano com `Parte N: pronta (<comando> → <resultado>)` em docs/sia/andamento.md.

## Banco e segredo

Segredo não entra no browser nem no log. O `.env` deste projeto é versionado porque só tem a chave publicável do Supabase do Lovable; chave secreta nunca entra nele. A mudança do banco é um arquivo novo em drizzle/migrations; enviar ao GitHub não aplica — o Lovable aplica quando pedido no chat dele (ver docs/sia/escolhas.md). Não cole SQL no painel.
<!-- SIA:fim -->
