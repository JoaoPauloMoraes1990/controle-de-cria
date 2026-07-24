import { describe, expect, it } from 'vitest'
import { formatarMesesEDias } from '../datas'

describe('formatarMesesEDias', () => {
  it('formata meses e dias juntos', () => {
    expect(formatarMesesEDias(488)).toBe('16 meses (488 dias)')
  })

  it('usa singular quando dá exatamente 1 mês ou 1 dia', () => {
    expect(formatarMesesEDias(30)).toBe('1 mês (30 dias)')
    expect(formatarMesesEDias(1)).toBe('0 meses (1 dia)')
  })

  it('arredonda para o mês mais próximo', () => {
    expect(formatarMesesEDias(365)).toBe('12 meses (365 dias)')
  })
})
