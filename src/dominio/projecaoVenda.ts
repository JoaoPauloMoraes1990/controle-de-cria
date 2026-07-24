import { addDays, format, parseISO } from 'date-fns'
import { calcularGanhoPesoDiario, type RegistroPesagem } from './ganhoPeso'

export const PESO_ALVO_KG = 180

export interface ProjecaoPeso {
  dataPrevista: string
  estimativa: boolean
  jaAtingiu: boolean
}

/**
 * Projeta em que data o animal atinge o peso alvo (180kg por padrão), a
 * partir das pesagens dele. Com duas pesagens ou mais, usa o ganho de peso
 * do próprio animal. Com só uma pesagem, usa o ganho médio do rebanho e
 * marca o resultado como estimativa. Sem nenhuma pesagem, retorna null —
 * "não disponível", nunca uma data inventada.
 */
export function projetarDataPesoAlvo(
  pesagens: RegistroPesagem[],
  ganhoMedioRebanhoKgDia: number | null,
  pesoAlvoKg: number = PESO_ALVO_KG,
): ProjecaoPeso | null {
  const validas = pesagens
    .filter((p): p is { data: string; pesoKg: number } => !!p.data && typeof p.pesoKg === 'number')
    .sort((a, b) => a.data.localeCompare(b.data))

  if (validas.length === 0) return null

  const ultima = validas[validas.length - 1]

  if (ultima.pesoKg >= pesoAlvoKg) {
    return { dataPrevista: ultima.data, estimativa: false, jaAtingiu: true }
  }

  let ganhoDiario: number | null = null
  let estimativa = false

  if (validas.length >= 2) {
    ganhoDiario = calcularGanhoPesoDiario(validas)
  }

  if (ganhoDiario == null || ganhoDiario <= 0) {
    if (ganhoMedioRebanhoKgDia != null && ganhoMedioRebanhoKgDia > 0) {
      ganhoDiario = ganhoMedioRebanhoKgDia
      estimativa = true
    } else {
      return null
    }
  }

  const diasNecessarios = Math.ceil((pesoAlvoKg - ultima.pesoKg) / ganhoDiario)
  const dataPrevista = addDays(parseISO(ultima.data), diasNecessarios)

  return { dataPrevista: format(dataPrevista, 'yyyy-MM-dd'), estimativa, jaAtingiu: false }
}
