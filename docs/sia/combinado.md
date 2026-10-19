# Combinado: Checklist da Conveniência

Status: aprovado em 19/10/2026

## 1. Quem usa e o que precisa fazer

- **Funcionária da conveniência.** Ao fim do turno, preenche no sistema o mesmo checklist da folha de papel, anexa fotos do que fez, escreve o que precisa ser feito e registra os códigos de barras que precisam de providência. O código é lido pela câmera do celular. Se a leitura falhar, ela digita.
- **Gerente.** Vê num lugar só tudo que está pendente: códigos para transferir, códigos para emitir nota de devolução, códigos que precisam de ajuste e o "o que precisa ser feito" de cada checklist. Resolve no Linx/Webposto e dá baixa item por item no sistema.

## 2. Deu certo quando

A gerente abre a lista de pendências, vê cada código com a providência pedida, dá baixa em cada um depois de resolver, e nenhum pedido da funcionária some, como acontece hoje com a folha de papel.

## 3. Não vamos fazer agora

- **Perfis separados de funcionária e gerente.** Todo mundo que entra no sistema consegue preencher e também dar baixa. A gerente vai notar que outra pessoa logada também consegue marcar um item como resolvido, mas o sistema sempre mostra quem deu a baixa.
- **Nome do produto ao lado do código.** O sistema não consulta o Linx/Webposto, então a lista mostra só o número do código.
- **Emitir a nota de devolução, a transferência ou o ajuste pelo sistema.** A gerente faz isso no Linx/Webposto e aqui só marca como resolvido.
- **Rascunho salvo.** Se a funcionária fechar a página antes de enviar, o que já tinha preenchido se perde.
- **Corrigir ou apagar um checklist já enviado.** Depois de enviado, o checklist não muda nem pode ser apagado pela tela.
- **Foto do código de barras.** A câmera só lê o número, e nenhuma foto do código fica guardada.
- **Relatórios por período e avisos por WhatsApp ou e-mail.**

## 4. O que o sistema faz

O item **Conveniência** do menu passa a abrir a tela do módulo, com três abas: **Checklist**, **Pendências** e **Histórico**. O plano do módulo continua disponível na página Plano do produto.

### Aba Checklist (funcionária)

Um formulário com as partes da folha, nesta ordem:

1. **Cabeçalho:** data (vem com a data de hoje, pode ser trocada por uma data passada, nunca futura) e nome da funcionária (obrigatório). O sistema também guarda qual login enviou.
2. **Operacional:**
   - Pedidos realizados ao fornecedor (texto).
   - Mercadoria recebida do fornecedor (texto).
   - Quatro perguntas de sim ou não, cada uma com um campo de observação: veio produto sem cadastro, mercadoria abastecida, notas de bonificação/trocas, transferências realizadas.
   - Códigos de produtos avariados/vencidos (texto).
   - Mercadorias trocadas (texto).
3. **Manutenção da loja:** cinco perguntas de sim ou não, cada uma com observação: loja limpa, lixo retirado, loja organizada, freezers organizados, material de uso e consumo abastecido.
4. **Contagens** (texto) e **Outras informações** (texto).
5. **Fotos do que foi feito:** de 0 a 10 fotos, só imagem, até 10 MB cada. Pode tirar na hora pela câmera ou escolher da galeria. Cada foto aparece em miniatura, com um botão para tirar antes de enviar.
6. **O que precisa ser feito:** texto livre para a gerente.
7. **Códigos para a gerente:** um botão "Ler código" abre a câmera e, ao ler, preenche o número. Ao lado fica um campo para digitar. Para cada código, ela escolhe a providência:
   - **Transferir**;
   - **Nota de devolução**;
   - **Ajuste**, e nesse caso é obrigatório escrever qual ajuste.

   Cada código também tem uma quantidade, que começa em 1. Os códigos adicionados aparecem numa lista agrupada pelas três providências, cada um com um botão de remover antes do envio.

As nove perguntas de sim ou não são obrigatórias. Os campos de texto são opcionais. Um código só aceita números, de 1 a 20 dígitos. A quantidade é um número inteiro a partir de 1.

O botão **Enviar checklist** grava tudo de uma vez: checklist, fotos e códigos. Se algo falhar, nada fica pela metade e a funcionária vê o erro sem perder o que preencheu. Se der certo, ela vê a confirmação e o formulário volta limpo.

### Aba Pendências (gerente)

- Três blocos: **Transferir**, **Nota de devolução** e **Ajuste**. Cada um mostra quantos itens estão abertos.
- Cada linha mostra o código, a quantidade, o ajuste pedido (só no bloco de ajuste), a data do checklist, o nome da funcionária e um botão **Resolvido**.
- Um quarto bloco, **O que precisa ser feito**, mostra o texto de cada checklist que tem esse campo preenchido e ainda não foi resolvido, também com o botão **Resolvido**.
- Ao clicar em Resolvido, o item sai da lista de abertos. O sistema guarda quem resolveu e quando.
- Um filtro "Mostrar resolvidos" exibe também os itens já resolvidos, com quem resolveu e quando, e um botão **Reabrir** para desfazer a baixa feita por engano.

### Aba Histórico

- A lista de checklists enviados, do mais recente para o mais antigo, com data, funcionária e quantos códigos ainda estão abertos.
- Ao abrir um checklist, aparece tudo que foi preenchido, as fotos (clicar abre a foto grande) e os códigos com a situação de cada um.

## 5. O que fica guardado, e quem vê

| Informação | Quem cria | Quem lê | Quem muda | Quem apaga |
| --- | --- | --- | --- | --- |
| Checklist (todas as respostas da folha, o que precisa ser feito, nome da funcionária, login que enviou, data e hora do envio) | Qualquer pessoa logada, ao enviar | Toda a equipe logada | Ninguém muda as respostas. Só a baixa do "o que precisa ser feito" (resolvido, quem, quando) pode ser marcada ou desfeita por qualquer pessoa logada | Ninguém, pela tela |
| Fotos do checklist | Quem enviou, junto com o checklist | Toda a equipe logada, por link que expira | Ninguém | Ninguém, pela tela |
| Códigos (número, providência, quantidade, ajuste pedido) | Quem enviou, junto com o checklist | Toda a equipe logada | Ninguém muda o código. Só a baixa (resolvido, quem, quando) pode ser marcada ou desfeita por qualquer pessoa logada | Ninguém, pela tela |

Quem não está logado não vê nada: nem checklist, nem fotos, nem códigos. As fotos ficam numa pasta fechada do banco, que só abre por link temporário para quem está logado. Essas regras são do banco, não só da tela.

## 6. Estados

- **Carregando:** as abas mostram um esqueleto enquanto buscam os dados; o botão Enviar mostra "Enviando…" e fica travado para não enviar duas vezes.
- **Deu certo:** "Checklist enviado" e formulário limpo; na baixa, o item sai da lista de abertos na hora.
- **Erro:** mensagem em português dizendo o que faltou (ex.: "Responda se a loja está limpa", "Escreva qual ajuste precisa ser feito", "Código só pode ter números"). Falha de rede ou do banco: "Não foi possível enviar. Nada foi gravado. Tente de novo." e o formulário continua preenchido.
- **Câmera:** se o celular não deixar usar a câmera ou não ler o código, aparece "Não consegui ler. Digite o código." e o campo de digitar fica em foco.
- **Vazio:** Pendências sem nada aberto mostra "Nenhuma pendência aberta"; Histórico vazio mostra "Nenhum checklist enviado ainda".
- **Sem permissão:** quem não está logado é levado para a tela de entrar, como no resto do sistema.

## 7. Provas

1. Um checklist com as nove perguntas respondidas, duas fotos e três códigos (um de cada providência) é gravado inteiro, e os três códigos aparecem em Pendências, cada um no seu bloco.
2. Sem responder "Loja limpa", o envio é recusado com a mensagem certa e nada é gravado.
3. Um código com providência Ajuste e sem o texto do ajuste é recusado.
4. Um código com letra ("78A9") é recusado; um código de 13 dígitos é aceito.
5. Data futura é recusada.
6. Ao marcar um código como resolvido, ele sai dos abertos e aparece em "Mostrar resolvidos" com quem resolveu e quando; ao reabrir, volta para os abertos.
7. O "o que precisa ser feito" de um checklist aparece em Pendências e sai ao ser marcado como resolvido.
8. As respostas de um checklist enviado não podem ser alteradas nem apagadas, nem chamando o banco direto.
9. Quem não está logado não lê checklist, código nem foto, nem chamando o banco direto.
10. Quando a câmera não lê, a funcionária consegue digitar o código e seguir.
11. Se a gravação falhar no meio, nenhum pedaço do checklist fica salvo.

## 8. De onde veio

- `docs/contexto/checklist-conveniencia-papel.jpg`: a folha "Checklist Conveniência" do Posto Natal, de onde saíram as seções, as nove perguntas de sim ou não e os campos de texto.
- `docs/PRD.md`, módulo Conveniência: este checklist ainda não é um dos requisitos CONV-01 a CONV-08. Ele se aproxima do CONV-05 (avarias e vencidos), mas não o completa.

## 9. Escolhas

Ver `docs/sia/escolhas.md`.
