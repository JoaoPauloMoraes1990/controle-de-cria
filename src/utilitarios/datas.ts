const DIAS_POR_MES = 30.44

/**
 * Formata uma quantidade de dias como "16 meses (488 dias)" — pensado para
 * o intervalo entre partos, que o produtor pensa em meses mas o cálculo é
 * feito em dias.
 */
export function formatarMesesEDias(dias: number): string {
  const meses = Math.round(dias / DIAS_POR_MES)
  const rotuloMeses = meses === 1 ? '1 mês' : `${meses} meses`
  const rotuloDias = Math.round(dias) === 1 ? '1 dia' : `${Math.round(dias)} dias`
  return `${rotuloMeses} (${rotuloDias})`
}
