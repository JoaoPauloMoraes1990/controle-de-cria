# Controle de Cria — Fazenda São Lourenço

Aplicativo de controle de rebanho de cria (Nelore) para uso offline no curral.

O planejamento completo está em `PRD.md`. A ordem de construção e o modo de
trabalho estão em `PROMPT-INICIAL.md`. Leia o PRD antes de tomar qualquer
decisão de arquitetura.

---

## Regras invioláveis

Estas regras valem para todas as etapas do projeto e não podem ser
flexibilizadas sem eu pedir explicitamente.

### Arquitetura

- **Sem servidor, sem backend, sem banco na nuvem, sem login, sem serviço pago.**
- Tudo roda local, no navegador, offline. O build gera arquivos estáticos.
- Nenhuma biblioteca pode buscar recurso na internet em tempo de execução.
  Fontes, ícones e bibliotecas ficam empacotados no build. Nada de CDN.
- Custo de operação: zero, para sempre.

### Usuário

- O usuário principal é um produtor de 60 anos, com pouca familiaridade com
  tecnologia, no curral, com a mão suja, sob sol, sem sinal de celular.
- Simplicidade sempre acima de recursos. Na dúvida entre duas opções, escolha
  a mais simples de usar, mesmo que faça menos.
- Linguagem de fazenda na interface. Nunca palavras como registro, entidade,
  sincronizar, validação, importar, sincronização.
- Botões grandes com rótulo escrito por extenso. Ícone sozinho nunca substitui
  a palavra.
- Fontes grandes (corpo a partir de 18px), alto contraste, área de toque
  mínima de 48x48px, teclado numérico nos campos de número.
- Máximo de três toques para registrar um evento comum, depois de achar o
  animal.
- Modo claro apenas. Sem menu escondido, sem gaveta lateral, sem gesto que
  precise ser descoberto.

### Tela de computador (além do celular)

O celular continua sendo o uso principal no curral, mas parte dos
lançamentos e a consulta dos números também acontece num computador. A tela
inicial (`TelaInicial.tsx`) fica exatamente como é no celular — não usa o
container responsivo. Todo o resto (`PaginaBase`) alarga em telas grandes
(`lg:`), sem mudar nada no celular.

Nas telas de números (painel simples e "mais números"), em tela larga os
cartões viram uma grade de 2 colunas em vez de empilhados — e essa grade
**tem que agrupar números que se relacionam**, lado a lado ou em sequência:
o número agregado do rebanho (ex.: intervalo médio entre partos) perto do
detalhamento dele (ex.: as 20 melhores e 20 piores vacas nesse mesmo
número), não espalhados em cartões soltos sem relação visual. Ao adicionar
um novo número, pensar em qual outro número existente ele se relaciona e
posicionar perto dele — isso vale tanto para os cartões atuais quanto para
qualquer indicador novo que entrar depois.

### Comportamento do sistema

- **Todos os campos são opcionais, exceto o número do animal.** Sempre é
  possível salvar incompleto e completar depois.
- **Nada trava e nada mostra erro em vermelho.** O que estiver faltando aparece
  como pendência, nunca como erro.
- Sempre confirmar visualmente que o dado foi salvo.
- Sempre permitir desfazer o último lançamento.
- Indicador sem dado de origem mostra "não disponível", **nunca zero**.

### Código

- Todo acesso a dados passa por um único módulo de repositório. Nenhum
  componente de tela fala direto com o banco local.
- Todo cálculo de indicador fica em módulo de domínio puro, sem dependência de
  interface, coberto por teste automatizado.
- Todas as validações ficam concentradas em um módulo único e configurável.
- Migrações do banco local precisam ser versionadas.
- A área de cadastro inicial fica em rota separada e isolada, para poder ser
  desativada sem afetar o resto.

---

## Stack

- Vite (saída estática) — **não usar Next.js**
- React + TypeScript
- Tailwind CSS, com escala tipográfica ampliada
- Componentes próprios — **não usar biblioteca de componentes pronta**
- Dexie.js sobre IndexedDB
- Vite PWA Plugin
- Recharts ou Chart.js
- Papa Parse (CSV de backup)
- date-fns
- Vitest

Preferir poucas dependências. Cada biblioteca a mais é risco de o aplicativo
parar de funcionar offline.

---

## Domínio (glossário)

| Termo | Significado |
|---|---|
| Matriz | Vaca em reprodução |
| Novilha | Fêmea a partir dos 8 meses, antes da primeira cria |
| Cria / bezerro | Filhote, até a venda |
| Arroba | **30 kg de peso vivo** (não é carcaça) |
| IATF | Inseminação artificial em tempo fixo |
| Repasse | Touro solto após a IATF, para as vacas que não pegaram |
| Estação de monta | Uma por ano: fase de IA + fase de repasse (opcional) |

### Regras de negócio que o código precisa respeitar

- O bezerro é vendido ao atingir **cerca de 180 kg (6 arrobas)**, não por
  idade fixa. A projeção de venda é por peso, calculada pelo ganho de peso por
  dia. Isso substitui o método antigo de somar 7 meses à data de nascimento.
- A fêmea (bezerra) recebe **um número definitivo já ao nascer** — a tatuagem
  é o número dela para sempre, não muda quando ela vira novilha.
- O macho (bezerro) fica com o número da mãe, porque é vendido logo após o
  desmame, antes dos 8 meses.
- A transição de categoria de bezerra para novilha, aos 8 meses, é
  **automática** (calculada pela data de nascimento, sem lançamento manual).
- Cada animal tem um **código interno permanente e invisível**. Os números da
  fazenda são identificações com data de início. Buscar pelo número antigo ou
  pelo novo leva à mesma ficha.
- Desmame e venda são o mesmo momento hoje, mas ficam modelados como eventos
  separados.
- **Não ratear custo entre vaca e bezerro.** Os indicadores econômicos são
  obtidos por divisão sobre o total.
- Não há diagnóstico de gestação. A taxa de prenhez fica prevista na estrutura
  mas aparece como não disponível.

---

## Como trabalhar comigo

- Construa **uma etapa por vez** e **pare ao final de cada uma** para eu
  testar. Não avance sem eu pedir.
- Antes de programar algo grande, me mostre o plano e espere aprovação.
- Ao final de cada etapa, me diga **como testar** o que você construiu.
- Se algo no PRD estiver ambíguo, pergunte em vez de decidir sozinho.
- Escreva os commits e as mensagens em português.
