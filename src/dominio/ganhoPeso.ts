import { differenceInCalendarDays, parseISO } from 'date-fns'

export interface RegistroPesagem {
  data?: string
  pesoKg?: number
}

/**
 * Ganho de peso médio por dia, a partir da primeira e da última pesagem
 * válidas (com data e peso). Retorna null quando não há pelo menos duas
 * pesagens válidas em datas diferentes — nunca zero, para não sugerir um
 * animal parado de peso por falta de dado.
 */
export function calcularGanhoPesoDiario(
  pesagens: RegistroPesagem[],
): number | null {
  const validas = pesagens
    .filter(
      (p): p is { data: string; pesoKg: number } =>
        !!p.data && typeof p.pesoKg === 'number',
    )
    .map((p) => ({ data: parseISO(p.data), pesoKg: p.pesoKg }))
    .sort((a, b) => a.data.getTime() - b.data.getTime())

  if (validas.length < 2) return null

  const primeira = validas[0]
  const ultima = validas[validas.length - 1]
  const dias = differenceInCalendarDays(ultima.data, primeira.data)

  if (dias <= 0) return null

  return (ultima.pesoKg - primeira.pesoKg) / dias
}
