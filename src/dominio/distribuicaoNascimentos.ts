function ano(data: string): number {
  return Number(data.slice(0, 4))
}

function mes(data: string): number {
  return Number(data.slice(5, 7)) - 1
}

/**
 * Quantas crias nasceram em cada ano de uma lista de anos (normalmente os
 * últimos 5). Sempre devolve um total por ano, mesmo que seja zero — zero
 * aqui é uma contagem de verdade, não "não disponível".
 */
export function contarNascimentosPorAno(
  datas: (string | undefined)[],
  anos: number[],
): { ano: number; total: number }[] {
  return anos.map((a) => ({
    ano: a,
    total: datas.filter((d): d is string => !!d && ano(d) === a).length,
  }))
}

/**
 * Quantas crias nasceram em cada mês do ano (jan=0 ... dez=11), somando
 * todos os anos — mostra o padrão sazonal de nascimento do rebanho.
 */
export function contarNascimentosPorMes(datas: (string | undefined)[]): number[] {
  const contagem = new Array(12).fill(0) as number[]
  for (const d of datas) {
    if (!d) continue
    contagem[mes(d)]++
  }
  return contagem
}
