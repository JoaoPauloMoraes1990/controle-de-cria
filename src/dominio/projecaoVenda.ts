import { addDays, format } from 'date-fns'
import { calcularGanhoPesoDiario, type RegistroPesagem } from './ganhoPeso'
import { parseDataSegura } from '../utilitarios/datas'

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
 * "não disponível", nunca uma data inventada. Pesagens com data malformada
 * são ignoradas.
 */
export function projetarDataPesoAlvo(
  pesagens: RegistroPesagem[],
  ganhoMedioRebanhoKgDia: number | null,
  pesoAlvoKg: number = PESO_ALVO_KG,
): ProjecaoPeso | null {
  const validas = pesagens
    .filter((p): p is { data: string; pesoKg: number } => !!p.data && typeof p.pesoKg === 'number')
    .map((p) => ({ ...p, dataObj: parseDataSegura(p.data) }))
    .filter((p): p is { data: string; pesoKg: number; dataObj: Date } => p.dataObj !== null)
    .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())

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
  const dataPrevista = addDays(ultima.dataObj, diasNecessarios)

  return { dataPrevista: format(dataPrevista, 'yyyy-MM-dd'), estimativa, jaAtingiu: false }
}
