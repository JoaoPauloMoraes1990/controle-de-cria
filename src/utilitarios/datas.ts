import { parseISO } from 'date-fns'

const DIAS_POR_MES = 30.44

/**
 * Converte uma data ISO (yyyy-mm-dd) para Date, devolvendo null quando a
 * data não existe de verdade (ex.: dia 32, mês 13 — coisa que passa
 * despercebida no campo de digitação corrida do cadastro inicial). Usado
 * pelos módulos de domínio que fazem conta com datas, para uma data
 * malformada nunca virar "NaN" na tela — ela só é ignorada no cálculo.
 */
export function parseDataSegura(dataIso: string): Date | null {
  const data = parseISO(dataIso)
  return Number.isNaN(data.getTime()) ? null : data
}

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
