# PROJECT ARCHITECTURE: Cria Nelore — Fazenda São Lourenço

## 1. CONTEXT & PROBLEM

Fazendas de cria de gado Nelore — que mantêm as matrizes e vendem o bezerro —
não conseguem medir se a atividade dá lucro, porque o controle vive em
planilha e para de escalar exatamente quando o rebanho cresce.

O caso concreto que originou este projeto é uma fazenda em Minas Gerais que
hoje tem cerca de 107 matrizes e novilhas e mantém uma planilha com 118
animais e 150 crias registradas entre 2019 e 2026. O rebanho triplicou nesse
período: foram 3 crias em 2019, 26 em 2023 e 40 em 2025.

O ponto importante é que o produtor NÃO é desorganizado. Ele já calcula à mão,
dentro da planilha, o intervalo entre cada cria, a média por vaca e um ranking
de produtividade das matrizes. O problema é que essa planilha tem seis blocos
de cria por linha, uma aba por ano de nascimento, abas separadas de venda e
produtividade, e chegou ao limite. Manter aquilo atualizado à mão para mais de
cem animais consome tempo, e os erros já apareceram: um número de vaca
duplicado, datas gravadas como texto incompleto, situação registrada ora em
maiúscula ora em minúscula, notação do mesmo animal diferente entre abas.

O que se perde na prática:

- A previsão de venda é feita por tempo, não por peso. A planilha calcula a
  saída do bezerro somando sete meses à data de nascimento, de forma fixa para
  todos. Mas o bezerro não engorda no calendário: a fazenda vende quando ele
  atinge cento e oitenta quilos, e uma vaca que entrega esse peso em cento e
  noventa dias vale muito mais do que outra que leva duzentos e setenta. Hoje
  as duas parecem idênticas na planilha, porque ambas "desmamam aos sete
  meses". O mérito real de cada matriz está invisível.
- Não há pesagem registrada. A fazenda tem balança, mas nenhum peso está
  anotado, então não existe ganho de peso por dia, nem arrobas produzidas por
  matriz, nem comparação entre vacas.
- Os custos existem em planilha mensal por categoria, mas não são cruzados com
  a produção e a classificação impede o cálculo: trinta e um por cento do
  custo está lançado como "outros" e vinte e um por cento como "hora do
  trator", sem distinção entre roçada de rotina e reforma de pasto. Há ainda
  despesas que não pertencem à atividade pecuária lançadas junto. Com metade
  do custo indefinido, qualquer indicador econômico calculado sobre isso seria
  um chute.
- Como a fazenda retém todas as fêmeas para crescer o rebanho, boa parte do
  custo está formando patrimônio e não produzindo bezerro para venda. Sem
  separar as duas coisas, o custo por bezerro vendido aparenta ser muito pior
  do que é, e leva à conclusão errada de que a atividade dá prejuízo.
- A fazenda inicia agora a inseminação artificial em tempo fixo, com repasse
  de touro. É um investimento novo e não há como avaliar o retorno sem
  registro estruturado.

O agravante é quem opera. Quem lança os dados no dia a dia é um produtor de 60
anos, com pouca familiaridade com tecnologia, em uma fazenda sem sinal de
celular e sem internet. Qualquer solução que exija conexão, cadastro, senha ou
navegação complexa é abandonada em semanas e o registro volta para o papel.
Softwares comerciais de gestão de rebanho existem, mas são pagos por cabeça ou
por mensalidade e foram desenhados para técnicos.

O impacto é direto. Dez pontos percentuais a menos na taxa de natalidade
significam dez bezerros a menos por ano em um rebanho de cem matrizes, o que
equivale a sessenta arrobas que simplesmente não existiram. E uma matriz ruim
mantida por três anos a mais custa três anos de pasto, sal e mão de obra sem
contrapartida.

## 2. PROPOSED SOLUTION

O Controle de Cria é um aplicativo web instalável (PWA) que funciona
inteiramente sem internet, roda no celular Android, no tablet ou no
computador, e não tem nenhum custo de servidor, banco de dados, hospedagem ou
assinatura.

Ele não introduz um controle novo: automatiza o controle que o produtor já
mantém à mão e que deixou de caber em planilha.

PENSADO PARA QUEM VAI USAR

O usuário principal é um produtor de 60 anos com pouca intimidade com
tecnologia, operando no curral, com a mão suja e sem sinal. Isso é a restrição
central do projeto, acima de qualquer escolha técnica:

- Não existe login, senha, conta ou cadastro. Abriu, está pronto para usar.
- A tela inicial tem poucos botões, grandes, com nomes do dia a dia da
  fazenda: "Nasceu um bezerro", "Pesar", "Vendeu", "Virou novilha", "Morreu",
  "Ver os números".
- A linguagem é de curral, não de software. Não aparecem palavras como
  registro, entidade, sincronizar ou validação.
- Nenhum campo é obrigatório além da identificação do animal. Sempre é
  possível salvar o que se sabe agora e completar depois. O que ficou faltando
  aparece em uma lista de pendências, nunca como erro.
- Nada trava e nada dá mensagem de erro em vermelho.
- Registrar um evento comum leva no máximo três toques depois de achar o
  animal.

COMO OS ANIMAIS SÃO IDENTIFICADOS

A fazenda trabalha com três categorias: bezerro ou bezerra, novilha e vaca.

Ao nascer, o bezerro recebe na orelha a tatuagem com o número da mãe, que é o
que permite saber de qual vaca ele veio. O macho é vendido por volta dos sete
meses e mantém essa identificação até a venda. A fêmea permanece na fazenda e
aos oito meses passa a novilha, quando recebe um número próprio que a
acompanha pelo resto da vida. Depois disso ela vira vaca sem trocar de número.
São dois números ao todo, nunca três.

Para que a troca de identificação não quebre o histórico, cada animal recebe
internamente um código permanente, invisível para o usuário. Os números usados
na fazenda ficam guardados como identificações com data de início. Buscar pela
tatuagem antiga ou pelo número novo leva à mesma ficha, e o vínculo com a mãe,
as pesagens e o nascimento continuam intactos. Na ficha aparece de forma
simples: "Vaca 112, antes tatuagem 45, filha da matriz 45".

O QUE O APLICATIVO REGISTRA

- Animais, com número, categoria, sexo, situação e mãe. Situação com lista
  fixa e limpa: ativo, vendido, morto, descartado.
- Nascimentos, com data, mãe, sexo e observações.
- Mudança de categoria, pelo botão "Virou novilha", que pede o número novo. O
  aplicativo avisa quando há bezerras completando oito meses e permite fazer a
  mudança em lote.
- Pesagens, inclusive a pesagem de venda.
- Vendas, por cabeça ou por lote, em arrobas de trinta quilos de peso vivo,
  com preço e comprador. A fazenda vende o bezerro ao atingir cerca de cento e
  oitenta quilos, o equivalente a seis arrobas, e vende também vacas de
  descarte ocasionalmente.
- Mortes, com data e causa provável.
- Estação de monta, uma por ano, com a fase de inseminação artificial em tempo
  fixo e uma fase de repasse com touro, que é opcional porque a fazenda
  pretende chegar a cem por cento de inseminação nos próximos anos. Registra-se
  apenas a data da inseminação e o touro do repasse. Não haverá diagnóstico de
  gestação por enquanto.
- Despesas, classificadas em duas dimensões independentes.

VENDER POR PESO, NÃO POR CALENDÁRIO

Este é o principal ganho sobre o método atual. Em vez de somar sete meses à
data de nascimento, o aplicativo usa as pesagens para calcular o ganho de peso
por dia de cada bezerro e projetar em que data ele chega aos cento e oitenta
quilos. A lista de venda deixa de ser "quem completou sete meses" e passa a ser
"quem já está pronto".

O efeito colateral é o indicador que a fazenda mais precisa: o ranking de
matrizes por dias necessários para entregar um bezerro de cento e oitenta
quilos. É esse número que separa uma vaca boa de uma vaca ruim, e é ele que
alimenta a lista de descarte com fato em vez de percepção.

CADASTRO INICIAL

O rebanho será renumerado fisicamente e cadastrado do zero, usando a planilha
antiga apenas como referência ao lado da tela. Não haverá importação
automática de arquivo: como os números vão mudar, casar identificação antiga
com nova seria mais arriscado do que digitar.

Para isso existe uma área separada do aplicativo, em endereço próprio, que não
aparece na tela principal e pode ser encerrada quando o trabalho terminar.
Nela, cada matriz ocupa um bloco, com as crias que ela já teve listadas dentro
do bloco, exigindo apenas sexo e data de nascimento de cada uma. Ao final do
bloco, o aplicativo mostra na hora quantas crias foram lançadas e o intervalo
médio entre partos daquela vaca, o que permite conferir o que foi digitado e
ver o resultado surgindo enquanto se trabalha. São cerca de 107 matrizes e 150
crias anteriores.

O QUE O APLICATIVO CALCULA

- Taxa de natalidade por ano.
- Intervalo entre partos de cada vaca e média do rebanho.
- Quais vacas falharam em cada ano.
- Distribuição dos nascimentos ao longo do ano.
- Ganho de peso por dia de cada bezerro e data prevista para atingir cento e
  oitenta quilos.
- Ranking de matrizes por dias até entregar um bezerro pronto e por arrobas
  produzidas no ano.
- Custo por matriz, custo por bezerro vendido e custo por arroba vendida,
  comparado com o preço recebido.
- Estimativa de aproveitamento da inseminação: como não haverá diagnóstico de
  gestação, o aplicativo estima se o bezerro veio da inseminação ou do repasse
  contando aproximadamente duzentos e noventa dias para trás a partir da data
  de nascimento. Esse número aparece sempre marcado como estimativa.

Indicadores que dependem de dados que a fazenda não coleta, como taxa de
prenhez e idade ao primeiro parto, ficam previstos na estrutura mas aparecem
como não disponíveis, jamais como zero.

CONTROLE ECONÔMICO

Cada despesa recebe duas classificações. A primeira é a categoria: sanidade,
nutrição, reprodução, mão de obra, pasto, cercas e benfeitorias, máquinas,
administrativo e não pecuária. A segunda é o comportamento: custeio, estrutura
ou investimento.

A categoria "não pecuária" existe porque a planilha atual mistura despesas que
não pertencem à atividade, e elas precisam sair do custo do bezerro sem sumir
do controle geral da fazenda. A distinção de comportamento existe porque
formação de pasto, cerca nova e reforma de pasto duram anos e não podem entrar
integralmente no ano em que foram pagas, sob pena de o custo por bezerro
oscilar violentamente sem que nada tenha mudado na fazenda.

O aplicativo não tenta ratear custo entre vaca e bezerro, porque o bezerro
consome junto com a mãe e qualquer rateio seria arbitrário. Os indicadores são
obtidos por divisão sobre o total.

Como a fazenda retém todas as fêmeas, o aplicativo apresenta também um
resultado que considera o valor das novilhas incorporadas ao rebanho no ano.
Sem isso, uma fazenda em crescimento aparenta prejuízo mesmo estando
capitalizando.

LISTA DE DESCARTE

O aplicativo aponta as matrizes com maior intervalo entre partos, as que
falharam em anos seguidos e as que entregam bezerro mais devagar, sempre
mostrando o histórico que justifica a sugestão. A decisão é sempre do produtor.

SEGURANÇA DOS DADOS

Como não há internet na fazenda e nenhum servidor, todo dado fica gravado no
próprio aparelho. O aplicativo exporta um arquivo de backup completo e
planilhas em CSV, para salvar no computador, em pen drive ou no Google Drive
quando houver conexão, e importa esse arquivo de volta para restaurar ou mudar
de aparelho. Um aviso simples aparece quando passa muito tempo sem backup.

Custo total de operação: zero.

## 3. FUNCTIONAL REQUIREMENTS

- Dashboards
- Busca e Filtros
- Relatórios e Exportação
- Onboarding do Usuário
- Notificações
- Calendário

REGRAS GERAIS

Usuário único, sem login e sem senha. Nenhum dado sai do aparelho. Todas as
telas funcionam sem internet, que é a condição normal de operação: a fazenda
não tem sinal.

Todos os campos de todos os formulários são opcionais nesta versão, exceto a
identificação do animal. Sempre é possível salvar incompleto e completar
depois. As regras de obrigatoriedade serão endurecidas após o período de
teste, portanto todas as validações ficam concentradas em um único módulo.

O usuário principal tem 60 anos e pouca familiaridade com tecnologia. Toda
decisão de interface deve favorecer a simplicidade em detrimento de recursos.

--- V1 ---

1. TELA INICIAL
   Poucos botões grandes, com verbo do dia a dia: Nasceu um bezerro, Pesar,
   Vendeu, Virou novilha, Morreu, Ver os números. Sem menu escondido, sem
   ícone que precise ser aprendido, sem hierarquia de navegação.

2. ANIMAIS
   Cada animal tem um código interno permanente, invisível ao usuário, e uma
   lista de identificações com data de início, porque a fêmea troca de número
   ao virar novilha. Categorias: bezerro, bezerra, novilha, vaca e touro.
   Situação: ativo, vendido, morto, descartado. Vínculo com a mãe. Ficha
   individual com todo o histórico em ordem de data, mostrando as
   identificações anteriores.

3. NASCIMENTO
   Data, mãe, sexo, tatuagem com o número da mãe, observações. Deve ser
   possível registrar sem mãe vinculada e sem peso. A tatuagem repete entre
   irmãs do mesmo ventre, então o sistema distingue internamente pelo ano de
   nascimento e mostra isso quando houver ambiguidade na busca.

4. MUDANÇA DE CATEGORIA
   Botão "Virou novilha", que pede o número próprio e definitivo da fêmea,
   mantendo todo o histórico anterior. A passagem de novilha para vaca não
   troca número, apenas categoria. O aplicativo avisa quando há bezerras
   completando oito meses e permite fazer a mudança em lote. Aviso, sem
   bloqueio, se o número informado já existir.

5. PESAGEM
   Registro rápido de peso com data. Cálculo de ganho de peso por dia quando
   houver duas pesagens. Modo de pesagem em série para o dia de curral: acha o
   animal, digita o peso, salva e já vai para o próximo, sem voltar ao menu.

6. PROJEÇÃO DE VENDA POR PESO
   A partir das pesagens, o aplicativo projeta em que data cada bezerro atinge
   cento e oitenta quilos e monta a lista de bezerros prontos para venda.
   Substitui o método atual, que soma sete meses fixos à data de nascimento
   para todos os animais igualmente. Enquanto um bezerro tiver apenas uma
   pesagem, o aplicativo usa o ganho médio do rebanho e marca o resultado como
   estimativa.

7. VENDA
   Individual ou em lote. Data, peso, arrobas, preço por arroba e comprador. A
   arroba é de trinta quilos de peso vivo, com conversão automática nos dois
   sentidos. Inclui venda de vacas de descarte. Como a fazenda não separa o
   bezerro da vaca antes da venda, o desmame e a venda são o mesmo momento,
   mas ficam modelados como eventos distintos para o caso de a fazenda passar
   a desmamar antes no futuro.

8. MORTE
   Data, animal e causa provável, em lista de opções simples.

9. CADASTRO INICIAL DO REBANHO — ÁREA SEPARADA E TEMPORÁRIA
   Não haverá importação automática de planilha. O rebanho será renumerado
   fisicamente e cadastrado do zero, usando a planilha antiga apenas como
   referência visual ao lado da tela. Decisão deliberada: como os números vão
   mudar, reconciliar identificação antiga com nova seria mais arriscado do
   que digitar.
   O cadastro inicial não fica na tela principal. É uma área separada,
   alcançada por endereço próprio, para não poluir o uso diário. Depois de
   concluído, um botão encerra a área, que pode ser reaberta pelo mesmo
   endereço caso a fazenda compre um lote de animais.
   Formato: um bloco por matriz. No topo, número, categoria e ano de
   nascimento. Dentro do bloco, uma linha por cria que ela já teve, com sexo e
   data de nascimento apenas. Um botão acrescenta mais uma cria. Ao final do
   bloco, o aplicativo mostra em tempo real quantas crias foram lançadas e o
   intervalo médio entre partos daquela vaca, para conferência imediata.
   Requisitos de velocidade: navegação inteira por teclado, com Tab avançando
   campo e Enter criando a linha seguinte; campo de data aceitando digitação
   corrida no formato ddmmaaaa, sem seletor de calendário; campo de sexo
   alternando pelas teclas F e M; crias machos já vendidas sem exigência de
   número, com identificação interna automática; crias fêmeas que permaneceram
   podendo ser vinculadas ao número de novilha ou vaca que receberam;
   salvamento automático a cada bloco; nenhum campo obrigatório além do número
   da matriz.
   Volume esperado: cerca de 107 matrizes e novilhas e 150 crias anteriores.
   Precisa suportar esse volume sem lentidão e permitir sair e retomar de onde
   parou.

10. ESTAÇÃO DE MONTA
    Uma por ano. Contém a fase de inseminação artificial em tempo fixo, com a
    data da inseminação de cada matriz, e uma fase de repasse com touro, que é
    opcional porque a fazenda pretende chegar a cem por cento de inseminação.
    Registra-se o touro usado no repasse. O modelo de dados prevê os campos de
    protocolo hormonal, mas eles não aparecem na interface nesta versão. Não
    haverá diagnóstico de gestação, portanto não existe registro de prenhez
    confirmada. Deve ser possível cadastrar uma estação sem a lista completa
    de matrizes inseminadas. Na primeira estação, algumas vacas já estarão
    prenhes de monta natural anterior, sem que se saiba quais; os bezerros
    dessas vacas são registrados como nascimento avulso, sem estação
    vinculada, e essas matrizes não entram no denominador daquela estação.

11. CONTROLE ECONÔMICO
    Lançamento de despesas por mês. Cada despesa recebe duas classificações
    independentes.
    Categoria: sanidade, nutrição, reprodução, mão de obra, pasto, cercas e
    benfeitorias, máquinas, administrativo e não pecuária.
    Comportamento: custeio, estrutura ou investimento. Despesas de
    investimento, como formação de pasto, cercas novas e reforma de pasto com
    trator, não entram integralmente no ano em que foram pagas; o usuário
    informa o prazo de diluição, com cinco anos como padrão, e o aplicativo
    distribui o valor pelos anos seguintes.
    A classificação de cada item é feita uma vez, em tabela editável, e
    reaplicada automaticamente nos lançamentos seguintes.
    O aplicativo não deve ratear custo entre vaca e bezerro. Os indicadores
    são: custo por matriz por ano, custo de custeio por matriz, custo por
    bezerro vendido, custo por arroba vendida comparado ao preço recebido, e
    participação percentual de cada categoria.
    Como a fazenda retém todas as fêmeas, o aplicativo apresenta também um
    resultado que soma o valor das novilhas incorporadas ao rebanho no ano,
    usando valor de referência por cabeça informado pelo usuário. Sem isso uma
    fazenda em crescimento aparenta prejuízo mesmo capitalizando.
    O painel econômico exibe o percentual do custo classificado como "outros"
    e avisa quando ultrapassar dez por cento, indicando que os indicadores
    perderam confiabilidade.

12. PAINEL DE NÚMEROS
    Linguagem simples, um número grande por cartão, com explicação curta em
    português comum embaixo. Indicadores: taxa de natalidade por ano;
    intervalo entre partos de cada vaca e média do rebanho; vacas que não
    pariram em cada ano; distribuição dos nascimentos ao longo do ano; ganho
    de peso por dia; dias até o bezerro atingir cento e oitenta quilos por
    matriz; arrobas produzidas por matriz; custo por matriz, por bezerro e por
    arroba; estimativa de bezerros vindos da inseminação, calculada por
    aproximação de duzentos e noventa dias de gestação a partir da data de
    nascimento, sempre rotulada como estimativa; comparação entre anos.

13. LISTA DE DESCARTE SUGERIDA
    Matrizes ordenadas por pior desempenho, considerando intervalo entre
    partos, falhas em anos consecutivos e dias necessários para entregar um
    bezerro de cento e oitenta quilos, com o histórico ao lado de cada
    sugestão. Quem tem pouco histórico aparece como "sem dados suficientes". A
    decisão é sempre do usuário.

14. BUSCA
    Busca por número em qualquer tela, aceitando tanto a tatuagem antiga
    quanto o número atual. Filtros por categoria e situação. Dimensionado para
    até quinhentos animais, com listas roláveis e seleção em lote.

15. AVISOS
    Notificações locais do próprio aparelho, sem serviço externo: bezerras
    completando oito meses, bezerros chegando ao peso de venda, backup
    atrasado.

16. BACKUP
    Exportação completa em um arquivo para restaurar e em CSV por assunto para
    abrir em planilha. Importação para restaurar ou mudar de aparelho. Aviso
    na tela inicial quando passar de quinze dias sem backup. Como não há
    sincronização em nuvem, esta é a única proteção contra perda de dados e
    precisa ser óbvia.

--- V2 ---

17. SANIDADE
    Calendário de vacinação e vermifugação, aplicação em lote e histórico
    sanitário por animal.

18. PASTO
    Área e lotação por piquete em unidades animais por hectare.

19. DIAGNÓSTICO DE GESTAÇÃO
    Quando a fazenda passar a fazer o exame, entram a taxa de prenhez e a
    separação real entre inseminação e repasse. A estrutura já prevê os campos.

--- REQUISITOS NÃO FUNCIONAIS ---

- Funciona integralmente sem internet, inclusive na primeira abertura após a
  instalação. Precisa de conexão apenas para instalar e atualizar, o que
  acontecerá esporadicamente, fora da fazenda.
- Instalável na tela inicial de celular Android como aplicativo.
- Interface para uso com uma mão, ao sol, com a mão suja: fontes grandes,
  áreas de toque grandes, teclado numérico nos campos de número, alto
  contraste.
- Nenhuma tela depende de serviço pago, chave de API ou cadastro externo.
- Camada de acesso a dados isolada em módulo próprio, para permitir
  sincronização em nuvem no futuro sem reescrever a aplicação.
- Validações concentradas em módulo único e configurável.
- Dimensionado para até quinhentos animais e cerca de dez anos de histórico.

## 4. USER PERSONAS

O sistema é de usuário único, sem login e sem separação de contas. Ainda
assim, existem dois perfis de uso muito diferentes dentro do mesmo aplicativo,
e o desenho precisa atender aos dois sem criar telas de permissão.

PERFIL PRINCIPAL — O PRODUTOR NO CURRAL, cerca de noventa por cento do uso

Homem de 60 anos, proprietário e operador da fazenda, com pouquíssima
familiaridade com tecnologia. Usa celular Android para telefone e WhatsApp e
praticamente nada além disso. É ele quem lança todos os dados: nascimentos,
pesagens, vendas, mortes e mudanças de categoria. Também será ele quem fará o
cadastro inicial das cerca de cento e sete matrizes e das cento e cinquenta
crias anteriores.

Contexto de uso: em pé no curral ou no pasto, segurando o celular com uma mão,
com a mão suja, sob sol forte, sem sinal de celular e sem internet, com gado se
movendo e barulho ao redor. Muitas vezes precisa lançar vários animais em
sequência, num único dia de manejo.

O que ele precisa:
- Abrir o aplicativo e já ver o que fazer, sem senha e sem menu.
- Botões grandes, poucos por tela, com nomes que ele usa.
- Uma pergunta por tela, como em caixa eletrônico ou maquininha de cartão.
- Poder salvar sem preencher tudo e nunca ver mensagem de erro em vermelho.
- Poder desfazer o último lançamento com facilidade, porque vai errar.
- Confirmação clara e visual de que o dado foi salvo, já que não há nuvem para
  ele conferir depois.
- No cadastro inicial, ver o resultado aparecendo enquanto digita, como o
  intervalo médio de cada vaca, para entender para que serve o trabalho.

O que quebra o uso para ele: telas com muitos campos, exigência de conexão,
erro que interrompe o fluxo, termo de informática. Se ele travar duas ou três
vezes, volta para o papel e o projeto morre. Esta é a maior ameaça ao sucesso
do produto, acima de qualquer questão técnica.

PERFIL SECUNDÁRIO — O FILHO, QUE ANALISA, cerca de dez por cento do uso

Filho do produtor, trabalha com finanças e investimentos, tem alta
familiaridade com tecnologia e planilhas. Não está na fazenda todos os dias.
Vai acompanhar de perto no começo, para entender a dinâmica junto com o pai, e
depois usa o aplicativo principalmente para olhar os números, avaliar quais
matrizes descartar, acompanhar custo por bezerro e por arroba, e decidir sobre
a continuidade da inseminação.

O que ele precisa:
- Painel de indicadores com comparação entre anos.
- Ranking de matrizes e lista de descarte com o histórico que justifica.
- Painel econômico com as classificações de custo e a qualidade dos dados.
- Exportação em CSV para análise própria em planilha.
- Acesso à área de correção de dados e ao cadastro inicial.

IMPLICAÇÃO PARA O PROJETO

Não se trata de multiusuário nem de permissões. Trata-se de uma única
instalação onde as telas de lançamento seguem o padrão mais simples possível,
e as telas de análise, correção e cadastro inicial ficam agrupadas em área
separada, alcançada por um caminho a mais. O produtor não precisa nem saber
que essa área existe para usar o aplicativo por completo.

Não existe perfil de veterinário, técnico ou funcionário nesta versão. A
fazenda não tem empregado lançando dados.

## 5. TECHNICAL STACK

- React
- TypeScript
- Tailwind CSS
- Claude Code

RESTRIÇÃO ARQUITETURAL ACIMA DE QUALQUER ESCOLHA TÉCNICA

A aplicação não pode ter servidor, backend, banco de dados remoto,
autenticação, chave de API ou qualquer serviço contratado. O resultado do build
precisa ser um conjunto de arquivos estáticos que funciona aberto no navegador,
sem processo rodando do outro lado. A fazenda não tem internet nem sinal de
celular, e o custo de operação precisa ser exatamente zero, para sempre.

STACK PROPOSTA

- Vite como empacotador, gerando saída estática. Escolhido no lugar de Next.js
  justamente por não pressupor servidor.
- React com TypeScript.
- Tailwind CSS, com escala tipográfica e de espaçamento propositalmente
  ampliada em relação ao padrão, por causa do perfil do usuário.
- Componentes de interface próprios, escritos para este projeto. Não usar
  biblioteca de componentes com tamanhos padrão de desktop.
- Dexie.js como camada sobre o IndexedDB do navegador, que é onde todos os
  dados ficam gravados no aparelho. Alternativa aceitável: IndexedDB puro.
- Vite PWA Plugin, gerando manifest e service worker, para instalação na tela
  inicial do Android e abertura sem rede.
- Recharts ou Chart.js para os gráficos, empacotados junto com a aplicação,
  sem chamada externa.
- Papa Parse para gerar os arquivos CSV de backup e exportação.
- date-fns para as contas de datas, que são o coração dos indicadores:
  intervalo entre partos, idade em meses, projeção de peso, estimativa de
  concepção.
- Vitest para testes automatizados dos cálculos de indicadores.

REGRAS PARA AS DEPENDÊNCIAS

- Nenhuma biblioteca pode buscar recurso na internet em tempo de execução.
  Fontes, ícones e bibliotecas ficam empacotados no próprio build. Nada de CDN.
- Preferir poucas dependências. Cada biblioteca a mais é risco de o aplicativo
  parar de funcionar offline.

ORGANIZAÇÃO DO CÓDIGO

- Toda leitura e gravação de dados passa por um único módulo de repositório,
  isolado do resto da aplicação. Nenhum componente de tela conversa diretamente
  com o banco local. Isso permite acrescentar sincronização em nuvem no futuro
  sem reescrever a aplicação.
- Todo cálculo de indicador fica em módulo de domínio, puro, sem dependência de
  interface, e coberto por testes automatizados. Os indicadores são a parte do
  sistema em que um erro silencioso causa decisão errada de descarte, então
  precisam ser testados com dados de exemplo. Isso vale especialmente para o
  cálculo de intervalo entre partos, para a projeção de data em que o bezerro
  atinge cento e oitenta quilos e para a diluição de investimentos ao longo dos
  anos.
- Todas as regras de validação e obrigatoriedade ficam em módulo único e
  configurável, porque nesta versão quase tudo é opcional e as regras serão
  endurecidas depois do período de teste.
- Toda migração de estrutura do banco local precisa ser versionada, já que a
  atualização do aplicativo acontecerá raramente e sobre dados reais que não
  têm cópia em nuvem.
- A área de cadastro inicial deve ficar em rota separada e isolada, para poder
  ser desativada sem afetar o restante da aplicação.

HOSPEDAGEM E DISTRIBUIÇÃO

- Publicação gratuita como site estático, por exemplo GitHub Pages ou
  Cloudflare Pages, usando o subdomínio gratuito. Sem domínio pago.
- A instalação no celular acontece uma única vez, com internet, fora da
  fazenda. Depois disso o aplicativo precisa abrir e funcionar indefinidamente
  sem rede, inclusive após reinicialização do aparelho.
- Uma versão desatualizada nunca pode parar de funcionar nem exigir atualização
  para abrir.

DIMENSIONAMENTO

Até quinhentos animais e cerca de dez anos de histórico. O volume é pequeno,
portanto simplicidade e confiabilidade têm prioridade absoluta sobre otimização
de desempenho.

## 6. DESIGN LANGUAGE

A referência principal não vem de aplicativos de produtividade nem de painéis
corporativos. Vem de interfaces feitas para serem usadas por qualquer pessoa,
em pé, com pressa e sem treinamento.

CAIXA ELETRÔNICO E MAQUININHA DE CARTÃO
A melhor referência de fluxo para este projeto. Uma pergunta por tela, texto
grande, poucas opções visíveis, confirmação explícita ao final e possibilidade
de voltar. O usuário de 60 anos já sabe operar esses aparelhos, e reproduzir
essa lógica elimina a curva de aprendizado. Cada lançamento no aplicativo deve
parecer uma sequência curta de perguntas, não um formulário.

WHATSAPP
Não pela estética, mas por ser o único aplicativo que o usuário domina de
verdade. Vale imitar os padrões de interação que ele já conhece: lista vertical
simples, item que se toca para abrir, botão de ação principal flutuante e
destacado, confirmação visual imediata de que algo foi salvo. Quanto mais
familiar o gesto, menor a chance de travar.

APLICATIVOS BANCÁRIOS BRASILEIROS DE INTERFACE LIMPA, COMO O DO NUBANK
Referência de organização e hierarquia: um número grande e legível por vez,
muito espaço em branco, cartões bem separados, cores usadas com parcimônia e
com significado. Serve especialmente para o painel de indicadores, que deve
mostrar um número em destaque com uma frase curta de explicação embaixo, e não
uma tabela densa.

PLANILHA, PARA A TELA DE CADASTRO INICIAL
Esta é a única tela do sistema que pode e deve parecer uma planilha, porque o
usuário estará digitando mais de cem registros com a planilha antiga aberta ao
lado. Linhas compactas, navegação por teclado, foco automático no campo
seguinte, sem diálogos intermediários. O resto do aplicativo segue o oposto
disso.

DIRETRIZES DE ACESSIBILIDADE DO MATERIAL DESIGN
Referência técnica para os mínimos: área de toque de pelo menos quarenta e oito
por quarenta e oito pixels, contraste de texto adequado para leitura sob sol
forte, tipografia com tamanho base maior que o padrão. Referência:
https://m3.material.io/foundations/accessible-design/overview

DIREÇÃO VISUAL PRETENDIDA

- Tipografia grande. O corpo de texto deve começar em torno de dezoito pixels,
  e os números do painel bem maiores. Fonte sem serifa, de leitura fácil.
- Botões grandes, com rótulo escrito por extenso. Ícone sozinho nunca
  substitui a palavra.
- Alto contraste, pensado para tela de celular sob sol direto. Evitar cinza
  claro sobre branco.
- Paleta sóbria e discreta, com verde e marrom de campo, sem visual
  infantilizado. O usuário é um produtor experiente, não uma criança.
- Cor com função, não como decoração: verde para o que está bem, vermelho ou
  laranja apenas para o que exige atenção, como uma vaca com intervalo entre
  partos muito longo ou um custo classificado como indefinido.
- Nenhuma animação de transição que atrase a resposta. O aplicativo deve
  parecer instantâneo.
- Modo claro apenas. Modo escuro é complexidade sem benefício para este uso.
- Nada de menu escondido, gaveta lateral ou gesto que precise ser descoberto.
  Tudo que importa fica visível na tela inicial.

O QUE EVITAR EXPLICITAMENTE

Painéis com muitos gráficos simultâneos, tabelas densas, ícones sem rótulo,
telas com mais de seis elementos tocáveis, formulários longos com rolagem e
qualquer termo de informática na interface.

## 7. PROCESS

- Break app build into logical milestones (steps)
- Each milestone should be a deliverable increment
- Prioritize core functionality first, then iterate
- Test each milestone before moving to the next

---
> Generated by NoCodeStartup Framework — optimized for Claude Code
