import { differenceInCalendarDays } from 'date-fns'
import { parseDataSegura } from '../utilitarios/datas'

/**
 * Intervalo médio, em dias, entre os partos de uma vaca — a partir das datas
 * de nascimento das crias que ela já teve. Retorna null quando há menos de
 * duas datas válidas, nunca zero. Datas malformadas (ex.: dia ou mês que não
 * existe) são ignoradas, não derrubam a conta inteira em NaN.
 */
export function calcularIntervaloMedioEntrePartos(
  datasNascimento: (string | undefined)[],
): number | null {
  const datasValidas = datasNascimento
    .filter((d): d is string => !!d)
    .map(parseDataSegura)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())

  if (datasValidas.length < 2) return null

  const intervalos: number[] = []
  for (let i = 1; i < datasValidas.length; i++) {
    intervalos.push(differenceInCalendarDays(datasValidas[i], datasValidas[i - 1]))
  }

  return intervalos.reduce((soma, dias) => soma + dias, 0) / intervalos.length
}
