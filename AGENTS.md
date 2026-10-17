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
