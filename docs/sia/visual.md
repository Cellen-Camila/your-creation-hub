# A cara do sistema: Posto Natal

Status: aprovada em 19/10/2026 (inclui manter o tema claro como alternativa, com troca no menu do usuário)
Origem: pedido da pessoa (dark mode premium, estilo SaaS moderno). O buscador de estilos não rodou (Python não está instalado); paleta definida a partir da marca (azul-marinho + chama laranja do logo).
Prévia visual: `docs/sia/cara-previa.html`

## Conceito

**"Central de operação noturna."** Um painel de controle calmo e preciso: fundo azul-marinho profundo (a marca, escurecida), superfícies em camadas que sobem de tom conforme a importância, e um único destaque quente — o laranja da chama do logo — reservado para o que é ação principal ou item ativo. O ciano entra como cor de dado e informação. Brilho (glow) só onde a pessoa deve agir: botão principal, foco do teclado e item ativo do menu. O resto é silêncio visual, para que alertas de vencimento e pendências saltem aos olhos.

## Cores (HEX)

### Fundo e superfícies (do mais fundo ao mais alto)

| Token | HEX | Uso |
| --- | --- | --- |
| `bg-base` | `#070B14` | Fundo da página (nunca `#000000`) |
| `surface-1` | `#0D1422` | Menu lateral, cards, tabelas |
| `surface-2` | `#131C2E` | Card em hover, popover, linha selecionada, input |
| `surface-3` | `#1A2539` | Modal, item ativo do menu, dropdown aberto |
| `glass` | `rgba(19, 28, 46, 0.72)` + `backdrop-blur: 12px` | Barra superior fixa, modais, sheets. Nunca em tabela ou card de dado |

### Bordas

| Token | Valor | Uso |
| --- | --- | --- |
| `border-subtle` | `rgba(148, 163, 184, 0.08)` | Divisórias internas, linhas de tabela, grade de gráfico |
| `border-default` | `rgba(148, 163, 184, 0.14)` | Contorno de card, input, menu |
| `border-strong` | `rgba(148, 163, 184, 0.24)` | Hover de card e input |
| `highlight-top` | `inset 0 1px 0 rgba(255, 255, 255, 0.04)` | Brilho de 1px no topo dos cards (dá volume) |

### Texto

| Token | HEX | Contraste sobre `surface-1` | Uso |
| --- | --- | --- | --- |
| `text-primary` | `#F1F5F9` | 16,8:1 | Títulos, valores, texto principal |
| `text-secondary` | `#A3B1C6` | 8,5:1 | Corpo secundário, rótulos |
| `text-muted` | `#8391A7` | 5,8:1 (4,8:1 sobre `surface-3`) | Datas, metadados, legendas (mínimo aceito para texto) |
| `text-disabled` | `#4B5A70` | — | Só em elemento desabilitado, nunca em informação |

### Marca e destaque

| Token | HEX | Uso |
| --- | --- | --- |
| `brand` | `#FF8A1F` | Botão principal, item ativo do menu, foco, links de ação |
| `brand-hover` | `#FFA04A` | Hover do botão principal |
| `brand-pressed` | `#E6760F` | Clique (active) |
| `brand-ink` | `#1A0F03` | Texto sobre o laranja (contraste 8:1) |
| `brand-soft` | `rgba(255, 138, 31, 0.12)` | Fundo de item ativo, chip selecionado |
| `brand-glow` | `0 0 0 1px rgba(255,138,31,.45), 0 8px 24px -6px rgba(255,138,31,.45)` | Sombra colorida do botão principal |
| `data` | `#22D3EE` | Cor de dado: linha principal de gráfico, sparkline, link de informação |
| `navy` | `#1E3A8A` | Azul da marca, só em logo e detalhes institucionais |

### Status (sempre com ícone + texto, nunca só a cor)

| Status | Cor | Fundo suave | Uso no sistema |
| --- | --- | --- | --- |
| Sucesso / em dia | `#34D399` | `rgba(52, 211, 153, 0.12)` | Documento em dia, rotina feita, resolvido |
| Aviso / vence em breve | `#FACC15` | `rgba(250, 204, 21, 0.12)` | Vencimento próximo, temperatura no limite |
| Erro / vencido / atrasado | `#F87171` | `rgba(248, 113, 113, 0.12)` | Vencido, rotina atrasada, lacre rompido |
| Informação / em andamento | `#38BDF8` | `rgba(56, 189, 248, 0.12)` | Em renovação, em análise |

O aviso é amarelo (`#FACC15`) e não laranja, para nunca ser confundido com o botão principal.

### Gráficos (ordem das séries)

`#22D3EE` ciano · `#FF8A1F` laranja · `#A78BFA` violeta · `#34D399` verde · `#F472B6` rosa · `#94A3B8` cinza (outros).
Grade: `border-subtle`. Eixos e legendas: `text-muted`, 12px. Tooltip: `surface-3` com `border-default`, valores em números tabulares.

## Letras

- **Títulos:** Plus Jakarta Sans (600–700), geométrica, moderna, com personalidade.
- **Interface e corpo:** Inter (400–600), a mais legível em tela pequena e densa. Números sempre com `font-variant-numeric: tabular-nums` (colunas alinhadas).
- **Códigos (barras, NF, protocolo, IDs):** JetBrains Mono (500).

Todas do Google Fonts. Substituem DM Sans e Space Grotesk.

| Nível | Tamanho / entrelinha | Peso | Espaçamento | Uso |
| --- | --- | --- | --- | --- |
| Métrica destaque | 32 / 36 px | 600 Inter, tabular | -0.02em | Valor principal de card de métrica |
| Título da página (h1) | 28 / 34 px | 700 Jakarta | -0.02em | Topo de cada tela |
| Seção (h2) | 20 / 28 px | 600 Jakarta | -0.01em | Blocos dentro da página |
| Subtítulo (h3) | 16 / 24 px | 600 Inter | 0 | Título de card, modal |
| Corpo | 14 / 22 px | 400 Inter | 0 | Texto padrão no computador |
| Corpo celular / campos | 16 / 24 px | 400 Inter | 0 | Formulários no celular (16px evita zoom do iPhone) |
| Pequeno | 13 / 18 px | 500 Inter | 0 | Badges, metadados, células de tabela densa |
| Rótulo superior | 11 / 16 px | 600 Inter, MAIÚSCULAS | 0.08em | Rótulo de card de métrica, grupo do menu |
| Código | 13 / 20 px | 500 JetBrains Mono | 0 | Código de barras, protocolo |

## Forma e espaço

- **Cantos:** 6px (badge, checkbox), 10px (botão, campo), 14px (card), 20px (modal, sheet).
- **Espaço:** grade de 4px. Padding de card 20px (16px no celular). Espaço entre cards 16px.
- **Sombra de card:** `highlight-top` + `0 8px 24px -12px rgba(0, 0, 0, 0.6)`.
- **Telas:** 375px (celular, menu vira gaveta), 768px (tablet, menu recolhido em ícones), 1280px+ (menu aberto, 260px).

## Estados de interação

| Estado | Como aparece |
| --- | --- |
| Hover | Superfície sobe um nível (`surface-1` → `surface-2`), borda vai para `border-strong`, transição de 150ms |
| Foco (teclado) | Anel de 2px `brand` com 2px de afastamento sobre `bg-base`. Sempre visível com teclado |
| Clique (active) | `scale(0.98)` e cor `brand-pressed` no botão principal |
| Desabilitado | Opacidade 50%, cursor bloqueado, sem glow |
| Carregando (dados) | Esqueleto: blocos `surface-2` com brilho passando para `surface-3` (1,5s). Mesmo formato do conteúdo que vai chegar |
| Carregando (ação) | Botão troca o ícone por um spinner, o texto vira "Salvando…" / "Enviando…" e o botão fica desabilitado até terminar (o segundo clique não dispara de novo) |
| Movimento reduzido | Com `prefers-reduced-motion`, sem brilho animado, sem `scale`, transições cortadas para 0 |

## Estados de tela

- **Vazio:** ícone em `text-muted` dentro de um círculo `surface-2`, uma frase em `text-secondary` ("Nenhuma pendência aberta") e, quando fizer sentido, um botão secundário com a próxima ação.
- **Carregando:** esqueleto com o formato do conteúdo.
- **Erro:** faixa com fundo de erro suave, ícone, frase em português dizendo o que aconteceu e o que fazer, e botão "Tentar de novo".
- **Sem permissão:** quem não está logado vai para a tela de entrar.
- **Deu certo:** aviso (toast) no canto, em `surface-3`, com ícone de sucesso, por 4s.

## Evitar

- Preto chapado `#000000` e branco puro em blocos grandes.
- Glow em mais de um elemento por área da tela.
- Glassmorphism em tabelas, cards de dado ou texto longo (prejudica a leitura).
- Status só por cor.
- Texto `text-disabled` em informação que importa.
- Neon saturado em fundos grandes.

## Atenção: uso na pista

Tela escura sob sol forte fica difícil de ler. Os formulários de pista (aferição, drenagem, encerrantes) são usados ao ar livre. Recomendação: manter também um tema claro (o atual) com troca no menu do usuário, e o sistema segue o tema do aparelho por padrão.

## Peças

- `src/components/layout/AppShell.tsx` — moldura da página: menu lateral, barra superior e menu do usuário.
- `src/components/layout/PageHeader.tsx` — cabeçalho de página (rótulo, título, descrição, ações).
- `src/components/ui/button.tsx` — botão (principal, secundário, fantasma, destrutivo).
- `src/components/ui/card.tsx` — card.
- `src/components/ui/badge.tsx` — selo de status.
- `src/components/conveniencia/SeloStatus.tsx` — selo de status da Conveniência (ok, atenção, atrasado, informação), sempre com ícone e texto, sobre `badge.tsx`; use no lugar de selos soltos.
- `src/components/ui/skeleton.tsx` — esqueleto de carregamento.
- `src/components/ui/table.tsx` — tabela.
- `src/components/ui/chart.tsx` — gráficos (Recharts).
- `src/components/ui/sidebar.tsx` — menu lateral base.
