/**
 * Divisões simples, mas sempre guardando "não disponível" (null) em vez de
 * zero ou infinito quando não há base pra dividir — uma fazenda sem matriz
 * ativa no ano, por exemplo, não tem "custo por matriz zero".
 */
function dividir(total: number, quantidade: number): number | null {
  if (quantidade <= 0) return null
  return total / quantidade
}

export function calcularCustoPorMatriz(
  despesaPecuariaTotal: number,
  totalMatrizesAtivas: number,
): number | null {
  return dividir(despesaPecuariaTotal, totalMatrizesAtivas)
}

export function calcularCustoPorBezerroVendido(
  despesaPecuariaTotal: number,
  totalBezerrosVendidos: number,
): number | null {
  return dividir(despesaPecuariaTotal, totalBezerrosVendidos)
}

export function calcularCustoPorArroba(
  despesaPecuariaTotal: number,
  totalArrobasVendidas: number,
): number | null {
  return dividir(despesaPecuariaTotal, totalArrobasVendidas)
}

export function calcularPrecoMedioRecebidoPorArroba(
  valorTotalRecebido: number,
  totalArrobasVendidas: number,
): number | null {
  return dividir(valorTotalRecebido, totalArrobasVendidas)
}

export interface ParticipacaoCategoria {
  categoria: string
  valor: number
  percentual: number
}

/**
 * Participação percentual de cada categoria no total de despesas. Devolve
 * lista vazia quando o total é zero, em vez de dividir por zero.
 */
export function calcularParticipacaoPorCategoria(
  valoresPorCategoria: Record<string, number>,
  total: number,
): ParticipacaoCategoria[] {
  if (total <= 0) return []
  return Object.entries(valoresPorCategoria)
    .filter(([, valor]) => valor > 0)
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: (valor / total) * 100,
    }))
    .sort((a, b) => b.valor - a.valor)
}
