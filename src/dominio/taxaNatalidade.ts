export interface PeriodoAtividade {
  entrada?: string
  saida?: string
}

function ano(data: string): number {
  return Number(data.slice(0, 4))
}

/**
 * Uma matriz conta para o ano quando ela já tinha entrado no rebanho e
 * ainda não tinha saído (morte ou venda) durante aquele ano. Sem data de
 * entrada ou saída, ela é considerada presente — melhor incluir uma matriz
 * antiga de data desconhecida do que excluí-la por engano.
 */
export function estavaAtivaNoAno(periodo: PeriodoAtividade, anoReferencia: number): boolean {
  if (periodo.entrada && ano(periodo.entrada) > anoReferencia) return false
  if (periodo.saida && ano(periodo.saida) < anoReferencia) return false
  return true
}

/**
 * Taxa de natalidade do ano, em percentual: crias nascidas naquele ano
 * dividido pelas matrizes que estavam no rebanho naquele ano. Retorna null
 * quando não há nenhuma matriz ativa no ano (não dá pra calcular), nunca
 * zero por falta de dado.
 */
export function calcularTaxaNatalidade(
  anoReferencia: number,
  matrizes: PeriodoAtividade[],
  datasNascimentoCrias: (string | undefined)[],
): number | null {
  const matrizesAtivas = matrizes.filter((m) => estavaAtivaNoAno(m, anoReferencia)).length
  if (matrizesAtivas === 0) return null

  const nascimentosNoAno = datasNascimentoCrias.filter(
    (d): d is string => !!d && ano(d) === anoReferencia,
  ).length

  return (nascimentosNoAno / matrizesAtivas) * 100
}
