# Progresso

Registro do que foi construído em cada etapa. O Claude Code preenche este
arquivo ao final de cada etapa.

## Etapa A — Base do rebanho
- [x] Concluída em 2026-07-23

### O que foi feito
- Projeto Vite + React + TypeScript criado na raiz do repositório, com
  Tailwind (tipografia ampliada, corpo a partir de 18px) e componentes de
  interface próprios (sem biblioteca pronta).
- Banco local com Dexie (IndexedDB), versionado, com as tabelas: `animais`,
  `identificacoes` (histórico de tatuagem/número próprio), `pesagens`,
  `vendas`, `mortes`, `mudancasCategoria`, `ultimaAcao` e `configuracoes`.
- Módulo único de repositório (`src/repositorio`) — nenhuma tela acessa o
  banco diretamente.
- Módulo de validação único e configurável (`src/validacao/regras.ts`): só o
  número do animal é obrigatório; o resto vira "pendência" (aviso neutro),
  nunca erro.
- Módulo de domínio puro e testado (`src/dominio`), com 16 testes Vitest:
  conversão kg ↔ arroba, ganho de peso por dia, busca de animal por número
  (aceitando tatuagem antiga e número novo, mesmo repetida entre irmãs).
- Telas: tela inicial (busca + botões grandes), Nasceu um bezerro, Pesar (com
  modo em série — salva e já fica pronto para o próximo animal, sem voltar ao
  menu), Vendeu (individual ou em lote), Morreu, Virou novilha, Cadastrar
  animal avulso, Ficha do animal (histórico completo + edição de situação e
  observações), Backup.
- Desfazer último lançamento: aparece como link na tela inicial e também
  junto da confirmação de "salvo", logo após cada lançamento.
- Backup: exporta um arquivo único para restaurar tudo, exporta CSV separado
  por assunto (animais, pesagens, vendas, mortes) e importa um backup para
  restaurar. Aviso na tela inicial quando passam 15 dias sem backup.
- PWA (instalável, funciona sem internet): testado com o build de produção —
  o app carrega e navega normalmente mesmo em modo offline simulado.

### Como testar
1. Abrir um terminal na pasta do projeto e rodar `npm install` (só na
   primeira vez) e depois `npm run dev`. Abrir o endereço que aparecer
   (algo como `http://localhost:5173`) no navegador do computador.
2. Testar o fluxo: tela inicial → "Nasceu um bezerro" → preencher número e
   sexo → salvar. Confirmar que aparece a mensagem de salvo com a opção
   "Desfazer". Buscar esse número na caixa de busca da tela inicial e abrir
   a ficha do animal.
3. Testar "Pesar": buscar o mesmo animal, digitar um peso, salvar — a tela
   deve ficar pronta para pesar o próximo animal sem voltar ao menu.
4. Testar "Vendeu", "Morreu" e "Virou novilha" da mesma forma.
5. Testar o backup: ir em "Copiar dados / restaurar backup" na tela inicial,
   clicar em "Salvar cópia completa" (baixa um arquivo `.json`) e em
   "Exportar planilhas (CSV)" (baixa 4 arquivos `.csv`, abrem no Excel).
6. Rodar `npm run test` para conferir que os 16 testes automatizados dos
   cálculos passam.
7. Rodar `npm run build` para gerar os arquivos estáticos em `dist/`, depois
   `npm run preview` para servir esse build e conferir que abre igual.
8. Publicar o conteúdo de `dist/` em um site estático gratuito (GitHub Pages
   ou Cloudflare Pages) e, pelo celular Android, abrir o endereço no Chrome,
   usar o menu "Adicionar à tela inicial" e testar com o celular em modo
   avião.

### Pendente (fora do escopo desta etapa)
- Publicação real em um site estático (GitHub Pages/Cloudflare Pages) e
  instalação em um celular Android físico — feito só via simulação de modo
  offline no navegador do computador até aqui.
- Ícone do app é um placeholder simples ("CC" em fundo verde); pode ser
  trocado por uma logo da fazenda mais adiante.
- Etapas B, C e D, que ainda não foram iniciadas.

## Etapa B — Cadastro inicial
- [x] Concluída e testada pelo produtor em 2026-07-24

### O que foi feito
- Área isolada em `/cadastro-inicial` (endereço próprio, sem link na tela
  principal), no formato planilha: um bloco por matriz, com as crias dela
  dentro do bloco.
- Bloco da matriz: número, categoria (vaca/novilha) e ano de nascimento
  aproximado. Cada campo salva sozinho ao sair dele (sem botão "salvar").
- Dentro do bloco, uma linha por cria: sexo (alterna com as teclas F e M),
  data de nascimento digitada corrida no formato ddmmaaaa (sem calendário) e,
  se for fêmea que ficou na fazenda, o número de novilha/vaca que ela
  recebeu. Enter em qualquer campo da linha salva e já abre a próxima linha,
  com o foco pronto para continuar digitando — sem precisar tocar no mouse.
- Contador em tempo real, por matriz e no topo da página: quantas crias
  foram lançadas e o intervalo médio entre partos daquela vaca (novo módulo
  de domínio `intervaloPartos.ts`, com testes).
- "Remover" em cada linha e "Remover matriz" no bloco inteiro, para corrigir
  erros de digitação sem precisar do desfazer global.
- Botão "Encerrar cadastro inicial" no rodapé — os dados continuam guardados
  e a área pode ser reaberta pelo mesmo endereço a qualquer momento.
- Matrizes e crias lançadas aqui usam as mesmas tabelas do resto do app, então
  já aparecem na busca e na ficha do animal da tela principal (confirmado em
  teste).

### Como testar
1. Com o app aberto (`npm run dev`), digite na barra de endereço, depois do
   endereço normal, `#/cadastro-inicial` — por exemplo
   `http://localhost:5173/#/cadastro-inicial`. Não tem botão para chegar lá
   pela tela inicial de propósito, para não confundir o dia a dia.
2. No bloco verde "Nova matriz", digite o número de uma vaca da planilha
   antiga e aperte Enter. O bloco dela aparece acima, pronto para lançar as
   crias.
3. Com o foco já na primeira linha de cria: aperte **F** ou **M**, depois
   **Tab**, digite a data corrida (ex.: `15032019`), depois **Enter** — a
   próxima linha já fica pronta para a cria seguinte, sem tocar em nada.
4. Repita para todas as crias daquela matriz e confira que o texto embaixo do
   bloco ("X crias lançadas · intervalo médio entre partos: Y dias") atualiza
   sozinho.
5. Feche a aba e abra de novo o mesmo endereço — os blocos já lançados devem
   continuar lá, prontos para continuar de onde parou.
6. Teste "Remover" numa linha de cria e "Remover matriz" num bloco inteiro,
   para conferir que dá para corrigir erro de digitação.
7. Teste "Encerrar cadastro inicial" no rodapé e depois "Reabrir cadastro
   inicial" — os dados não somem.
8. Volte para a tela inicial (`http://localhost:5173/#/`) e busque o número
   de uma das matrizes lançadas — ela deve aparecer normalmente, junto com o
   histórico de crias na ficha dela.
9. `npm run test` roda os agora 21 testes automatizados (5 a mais, do cálculo
   de intervalo entre partos).

### Pendente (fora do escopo desta etapa)
- Testado pelo produtor com poucos registros de exemplo (não com o volume
  real de ~107 matrizes e ~150 crias ainda).
- Etapas C e D, que ainda não foram iniciadas.

## Etapa C — Indicadores reprodutivos
- [x] Concluída em 2026-07-24

### O que foi feito
- Botão "Ver os números" de volta na tela inicial, agora levando ao painel
  de verdade (antes ficava escondido porque a etapa não existia ainda).
- Painel `/numeros` com: taxa de natalidade do ano e dos últimos 5 anos,
  intervalo médio entre partos do rebanho, lista de bezerros ativos com a
  projeção de quando cada um chega aos 180kg (marcada como "estimativa"
  quando calculada só pelo ganho médio do rebanho, por falta de pesagem
  própria suficiente), ranking das 5 matrizes mais rápidas para entregar um
  bezerro de 180kg e ranking das 5 que mais produziram arrobas no ano.
- Tela `/descarte` com a lista de descarte sugerida: matrizes ordenadas da
  pior para a melhor, considerando intervalo entre partos, anos seguidos sem
  parir e velocidade até o bezerro de 180kg — sempre com o histórico do lado
  e "sem dados suficientes" para quem ainda não tem base para avaliar. A
  decisão de descartar continua sempre do produtor.
- Módulos de domínio novos, todos com teste automatizado: taxa de
  natalidade, projeção de peso (180kg), intervalo entre partos (feito na
  Etapa B, reaproveitado aqui), lista de descarte e um ordenador genérico que
  sempre deixa "sem dados suficientes" por último, nunca misturado com zero.
- Corrigido um problema encontrado durante o teste: a pesagem feita na hora
  da venda não estava entrando no histórico de peso do animal, só ficava
  guardada dentro do registro da venda. Agora ela conta como uma pesagem
  normal — o que deixa a projeção dos 180kg mais precisa pra quem já foi
  vendido.
- Identidade visual da fazenda aplicada no aplicativo inteiro, a pedido do
  produtor: paleta de cores extraída da logo (fundo creme, botões no marrom
  da logo, verde-oliva para seleção), logo com fundo removido (recorte
  transparente, sem auréola), usada como ícone do app, favicon, splash de
  abertura (0,7s), logo pequena no cabeçalho de toda tela interna, e marca
  d'água central em todas as telas.
- Tela `/numeros/detalhado` — visão avançada opcional, com um único botão
  "Ver mais números" no painel simples (o produtor não precisa nem saber que
  ela existe): gráfico de nascimentos por ano, gráfico de taxa de natalidade
  por ano, gráfico de nascimentos por mês (padrão sazonal, somando todos os
  anos), ranking completo (não só top 5) de velocidade até 180kg e de
  arrobas produzidas, e lista de vacas que não pariram no ano corrente.
- Criada a skill `/run-controle-de-cria` (`.claude/skills/`), com um driver
  próprio em Playwright para dirigir o aplicativo num navegador de verdade
  (nesse ambiente não há `chromium-cli` pronto). Documentada para uso em
  sessões futuras, sem precisar remontar o teste do zero toda vez.

### Como testar
1. Com `npm run dev` rodando, abra a tela inicial e clique em "Ver os
   números".
2. Confira o cartão "Taxa de natalidade" e a lista dos últimos anos —
   compare com o que você sabe de cabeça sobre o rebanho.
3. Veja "Bezerros a caminho dos 180kg" — clique num deles para abrir a ficha
   e conferir o histórico de peso.
4. Veja os dois rankings de matrizes (mais rápidas e mais arrobas no ano) —
   clique num número para abrir a ficha dela.
5. Clique em "Ver lista de descarte sugerida" e confira se a ordem faz
   sentido com o que você conhece das vacas.
6. Clique em "Ver mais números" e confira os gráficos e as tabelas
   completas.
7. `npm run test` roda os agora 56 testes automatizados.

### Pendente (fora do escopo desta etapa)
- Estação de monta (IATF/repasse) e a estimativa de bezerros vindos da
  inseminação não entraram nesta etapa — o texto original da Etapa C não
  pedia essas telas, só os cinco números e a lista de descarte. Posso
  construir isso depois, como um complemento.
- O pacote de gráficos (Recharts) deixou o arquivo final do site maior
  (~800kB antes de comprimir). Não afeta o uso normal, só deixa a primeira
  instalação um pouco mais lenta.
- Etapa D, que ainda não foi iniciada.

## Etapa D — Econômico
- [x] Concluída em 2026-07-24

### O que foi feito
- Link "Despesas e custos" na tela inicial (rodapé, junto do backup — não é
  um dos seis botões grandes do dia a dia).
- Tela `/financeiro`: lançar despesa por nome, com autocompletar dos itens
  já classificados antes (digitou "Sal" → sugere "Sal mineral · Nutrição ·
  Custeio"). Categoria (10 opções, incluindo "Outros") e comportamento
  (custeio/estrutura/investimento) sempre editáveis na hora, mesmo vindo de
  sugestão. Se o nome ainda não existe, o item é criado sozinho com a
  classificação escolhida — não precisa cadastrar antes.
- Tela `/financeiro/itens`: lista de itens já classificados, com botões pra
  corrigir categoria/comportamento e remover — vale só pros lançamentos
  futuros, não reescreve o que já foi salvo.
- Tela `/financeiro/numeros`: gasto pecuário do ano (separado do não
  pecuário, que fica de fora dos cálculos, como o PRD pede), custo por
  matriz, custo por bezerro vendido, custo por arroba vendida comparado ao
  preço médio recebido, participação percentual de cada categoria, e aviso
  quando "Outros" passar de 10% do gasto. Tudo com "não disponível" (nunca
  zero nem erro) quando falta base pra calcular.
- Módulo de domínio `economico.ts` novo, com teste automatizado, cobrindo as
  divisões (custo por matriz/bezerro/arroba, participação por categoria) e
  os casos de divisão por zero.
- Duas decisões que você confirmou antes de eu construir: (1) a diluição de
  despesas de investimento ao longo dos anos ainda **não** é calculada — o
  prazo fica só guardado no lançamento, pronto pra ligar o cálculo depois;
  (2) o segundo resultado considerando o valor das novilhas retidas
  (formação de patrimônio) ficou de fora por enquanto, já que hoje não há
  custo de compra de matriz.

### Como testar
1. Na tela inicial, clique em "Despesas e custos" no rodapé.
2. Clique em "Lançar despesa", preencha um nome (ex.: "Sal mineral"),
   escolha categoria e comportamento, data e valor, e salve.
3. Lance uma segunda despesa com comportamento "Investimento" (ex.: "Reforma
   de pasto") e confira que aparece o campo de prazo de diluição.
4. Lance uma terceira despesa começando a digitar "Sal" de novo — confira
   que a sugestão aparece e preenche a categoria/comportamento sozinha.
5. Volte para "Ver classificação de despesas" e confira os itens salvos; mude
   a categoria de um deles e veja se muda ali.
6. Volte para "Números do dinheiro" e confira o gasto total e a participação
   por categoria.
7. `npm run test` roda os agora 67 testes automatizados.

### Pendente (fora do escopo desta etapa)
- Diluição de despesas de investimento ao longo dos anos — hoje só guarda o
  prazo, não aplica no cálculo de custo por ano.
- Resultado considerando a formação de patrimônio das novilhas retidas
  (valor de referência por cabeça) — fica pra quando fizer falta.

### Complemento — Ajuda e importação de despesas (2026-07-24)
- Botão "Custeio, estrutura ou investimento? O que escolher" nas telas de
  lançar e classificar despesa: abre/fecha uma explicação com exemplos, sem
  sair da tela nem perder o que já foi digitado.
- Tela `/financeiro/importar`: importa várias despesas de uma vez a partir
  de um CSV (colunas nome, categoria, comportamento, data, valor). Reaproveita
  item já existente pelo nome; cria item novo quando o nome ainda não existia.
- Importados os custos reais da planilha da fazenda (2023 a julho de 2026):
  743 lançamentos, R$ 402.666,56, em 20 itens — já testado de ponta a ponta e
  os totais por ano batem exatamente com o que a planilha original mostrava.
  O arquivo pronto para importar ficou em `files/despesas-para-importar.csv`.
  Duas decisões do produtor aplicadas nessa importação: "Hora do trator" e
  "Semente" foram classificados como categoria Pasto/comportamento Estrutura
  (a planilha antiga misturava roçada de rotina com reforma de pasto, sem
  distinguir); "Ração Cachorro" como Não pecuária.
- **Esse teste rodou num navegador descartável usado só para validar a
  funcionalidade — os dados ainda não estão no aparelho do produtor.** Falta
  o usuário abrir o app de verdade e importar esse arquivo lá.

### Isso encerra as quatro etapas do plano original
Pendências gerais: publicar o site de verdade (GitHub Pages/Cloudflare Pages)
para instalar no celular do produtor, e testar com o volume real de animais.
