import { differenceInCalendarDays } from 'date-fns'
import { parseDataSegura } from '../utilitarios/datas'

export interface RegistroPesagem {
  data?: string
  pesoKg?: number
}

/**
 * Ganho de peso médio por dia, a partir da primeira e da última pesagem
 * válidas (com data e peso). Retorna null quando não há pelo menos duas
 * pesagens válidas em datas diferentes — nunca zero, para não sugerir um
 * animal parado de peso por falta de dado. Pesagens com data malformada são
 * ignoradas, não derrubam a conta em NaN.
 */
export function calcularGanhoPesoDiario(
  pesagens: RegistroPesagem[],
): number | null {
  const validas = pesagens
    .filter(
      (p): p is { data: string; pesoKg: number } =>
        !!p.data && typeof p.pesoKg === 'number',
    )
    .map((p) => ({ data: parseDataSegura(p.data), pesoKg: p.pesoKg }))
    .filter((p): p is { data: Date; pesoKg: number } => p.data !== null)
    .sort((a, b) => a.data.getTime() - b.data.getTime())

  if (validas.length < 2) return null

  const primeira = validas[0]
  const ultima = validas[validas.length - 1]
  const dias = differenceInCalendarDays(ultima.data, primeira.data)

  if (dias <= 0) return null

  return (ultima.pesoKg - primeira.pesoKg) / dias
}

/**
 * A pesagem mais recente (com data e peso válidos) de um animal, ou null
 * quando ele ainda não tem nenhuma pesagem registrada — usado para mostrar
 * "sem peso ainda" em vez de esconder o animal da lista.
 */
export function obterUltimaPesagemValida(
  pesagens: RegistroPesagem[],
): { data: string; pesoKg: number } | null {
  const validas = pesagens
    .filter(
      (p): p is { data: string; pesoKg: number } =>
        !!p.data && typeof p.pesoKg === 'number',
    )
    .map((p) => ({ dataIso: p.data, dataObj: parseDataSegura(p.data), pesoKg: p.pesoKg }))
    .filter((p): p is { dataIso: string; dataObj: Date; pesoKg: number } => p.dataObj !== null)
    .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())

  if (validas.length === 0) return null

  const ultima = validas[validas.length - 1]
  return { data: ultima.dataIso, pesoKg: ultima.pesoKg }
}
