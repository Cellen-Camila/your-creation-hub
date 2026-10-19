# Escolhas

Encontrado no repositório (não foi trocado nada).

- Sistema: TanStack Start (React, TypeScript), Tailwind, shadcn/ui e ESLint, criado pelo Lovable
- Dados: Supabase (arquivos no Storage do Supabase; mudanças do banco guardadas em drizzle/migrations)
- Prova: Vitest na regra e na tela (jsdom). Playwright não está instalado.
- Entrada e registro: Zod
- Onde roda: Lovable (o projeto está ligado ao Lovable)
- Projeto Supabase: Lovable Cloud deste projeto (o id está em supabase/config.toml)
- Ligação: pendente. A mudança do banco é um arquivo em drizzle/migrations (registrado em meta/_journal.json). Enviar ao GitHub NÃO aplica: em 19/10/2026 a 0001_renovacoes estava no GitHub desde 16/10 e as tabelas renovacoes e renovacao_anexos não existiam no banco. Quem aplica é o próprio Lovable (pedido no chat do Lovable para aplicar as migrações pendentes de drizzle/migrations). Esse banco não aparece na conta Supabase da pessoa. Nunca colar SQL no painel.
- Uso: novo (a equipe ainda não usa de verdade, confirmado em 2026-10-17)
