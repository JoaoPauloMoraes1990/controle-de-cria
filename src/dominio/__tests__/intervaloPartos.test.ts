import { describe, expect, it } from 'vitest'
import { calcularIntervaloMedioEntrePartos } from '../intervaloPartos'

describe('calcularIntervaloMedioEntrePartos', () => {
  it('calcula a média dos intervalos entre partos consecutivos', () => {
    const media = calcularIntervaloMedioEntrePartos(['2021-01-01', '2022-01-01', '2023-01-01'])
    // 365 dias + 365 dias, média 365
    expect(media).toBeCloseTo(365, 0)
  })

  it('ignora a ordem em que as datas são passadas', () => {
    const media = calcularIntervaloMedioEntrePartos(['2023-01-01', '2021-01-01', '2022-01-01'])
    expect(media).toBeCloseTo(365, 0)
  })

  it('ignora datas ausentes', () => {
    const media = calcularIntervaloMedioEntrePartos([
      '2021-01-01',
      undefined,
      '2022-01-01',
    ])
    expect(media).toBeCloseTo(365, 0)
  })

  it('retorna null com menos de duas datas', () => {
    expect(calcularIntervaloMedioEntrePartos([])).toBeNull()
    expect(calcularIntervaloMedioEntrePartos(['2021-01-01'])).toBeNull()
    expect(calcularIntervaloMedioEntrePartos([undefined, '2021-01-01'])).toBeNull()
  })

  it('lida com um único intervalo', () => {
    const media = calcularIntervaloMedioEntrePartos(['2021-01-01', '2021-07-01'])
    expect(media).toBe(181)
  })
})
