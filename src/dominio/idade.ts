import { differenceInMonths } from 'date-fns'
import { parseDataSegura } from '../utilitarios/datas'

export const IDADE_TRANSICAO_NOVILHA_MESES = 8

/**
 * Idade em meses completos, a partir da data de nascimento. Retorna null
 * quando a data de nascimento não existe ou é malformada — "idade não
 * disponível", nunca um número inventado.
 */
export function calcularIdadeEmMeses(
  dataNascimento: string | undefined,
  hoje: Date = new Date(),
): number | null {
  if (!dataNascimento) return null
  const nascimento = parseDataSegura(dataNascimento)
  if (!nascimento) return null
  return differenceInMonths(hoje, nascimento)
}

/**
 * Formata uma idade em meses como "5 meses", "1 ano" ou "1 ano e 3 meses" —
 * do jeito que o produtor pensa a idade de um animal novo.
 */
export function formatarIdadeEmMeses(meses: number): string {
  if (meses < 12) return meses === 1 ? '1 mês' : `${meses} meses`

  const anos = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  const rotuloAnos = anos === 1 ? '1 ano' : `${anos} anos`
  if (mesesRestantes === 0) return rotuloAnos

  const rotuloMeses = mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`
  return `${rotuloAnos} e ${rotuloMeses}`
}
