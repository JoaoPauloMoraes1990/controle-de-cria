import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * Intervalo médio, em dias, entre os partos de uma vaca — a partir das datas
 * de nascimento das crias que ela já teve. Retorna null quando há menos de
 * duas datas válidas, nunca zero.
 */
export function calcularIntervaloMedioEntrePartos(
  datasNascimento: (string | undefined)[],
): number | null {
  const datasValidas = datasNascimento
    .filter((d): d is string => !!d)
    .map((d) => parseISO(d))
    .sort((a, b) => a.getTime() - b.getTime())

  if (datasValidas.length < 2) return null

  const intervalos: number[] = []
  for (let i = 1; i < datasValidas.length; i++) {
    intervalos.push(differenceInCalendarDays(datasValidas[i], datasValidas[i - 1]))
  }

  return intervalos.reduce((soma, dias) => soma + dias, 0) / intervalos.length
}
