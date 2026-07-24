# Como iniciar o projeto no Claude Code

## Antes de rodar

1. Abra o terminal na pasta do projeto:
   `C:\Users\João Paulo\Projetos\Fazenda São Lourenço`
2. Confirme que os três arquivos estão lá: `CLAUDE.md`, `PRD.md` e este.
3. Rode `claude` no terminal.

---

## Prompt para colar na primeira sessão

Copie tudo abaixo da linha e cole no Claude Code.

---

Leia os arquivos `CLAUDE.md` e `PRD.md` desta pasta. Eles contêm as regras
permanentes e o planejamento completo deste projeto.

Antes de escrever qualquer código, me apresente um plano contendo:

- a estrutura de pastas do projeto
- o modelo de dados completo, com todas as tabelas e todos os campos
- quais telas fazem parte de cada etapa
- quais decisões você precisa que eu confirme antes de começar

Aguarde minha aprovação do plano antes de programar.

A construção é dividida em quatro etapas. Faça **uma etapa por vez** e
**pare ao final de cada uma** para eu testar e aprovar. Não avance para a
etapa seguinte sem eu pedir.

**ETAPA A — Base do rebanho**
Cadastro de animais, nascimento, pesagem e venda. Tela inicial com os botões
grandes. Busca por número. Backup e restauração. Ao final desta etapa o
aplicativo já precisa instalar no celular Android e funcionar sem internet.

**ETAPA B — Cadastro inicial**
Área separada, em rota própria, para lançar as matrizes e as crias que elas já
tiveram, com navegação inteira por teclado. Cerca de 107 matrizes e 150 crias.

**ETAPA C — Indicadores reprodutivos**
Painel de números, intervalo entre partos, taxa de natalidade, projeção da
data em que o bezerro atinge 180 kg, ranking de matrizes e lista de descarte.

**ETAPA D — Econômico**
Lançamento e classificação de despesas nas duas dimensões, custo por matriz,
por bezerro e por arroba.

Ao final de cada etapa, escreva no arquivo `PROGRESSO.md` o que foi feito, o
que ficou pendente e como testar.

---

## Depois de cada etapa

Roteiro de teste sugerido, na ordem:

1. Rodar `npm run dev` e abrir no navegador do computador
2. Rodar `npm run build` e conferir que gera arquivos estáticos
3. Publicar e abrir no celular Android, instalar na tela inicial
4. **Colocar o celular em modo avião e usar o aplicativo inteiro**
5. Sentar com o produtor e pedir que ele registre um nascimento sem nenhuma
   instrução. O que ele travar é o que precisa mudar.

O passo 5 é o teste mais importante do projeto. Adoção é o maior risco, não
código.

---

## Se o Claude Code emendar as etapas

Às vezes ele ignora o pedido de parar e continua para a etapa seguinte. Se
isso acontecer, interrompa e escreva:

> Pare aqui. Volte para o final da Etapa A e não avance. Quero testar antes.

Vale ficar atento principalmente na virada da Etapa A para a B.

---

## Pendências conhecidas (fora do código)

- Reclassificar os custos de 2024 e 2025. Hoje 31% está em "Outros" e 21% em
  "Hora do trator" sem distinção entre roçada e reforma de pasto. Enquanto
  isso não for resolvido, o custo por arroba sai com essa margem de erro, por
  melhor que o aplicativo esteja construído.
- Separar, dentro de "Hora do trator" e "Semente", o que é custeio e o que é
  investimento.
- Retirar do custo da pecuária as despesas não pecuárias.
- Definir o valor de referência por cabeça de novilha, para o cálculo de
  formação de patrimônio.
