import { describe, expect, it } from 'vitest'
import { calcularIdadeEmMeses, formatarIdadeEmMeses } from '../idade'

describe('calcularIdadeEmMeses', () => {
  it('calcula a idade em meses completos', () => {
    const idade = calcularIdadeEmMeses('2026-01-01', new Date(2026, 7, 1))
    expect(idade).toBe(7)
  })

  it('retorna null sem data de nascimento', () => {
    expect(calcularIdadeEmMeses(undefined, new Date(2026, 7, 1))).toBeNull()
  })

  it('retorna null com data malformada em vez de virar NaN', () => {
    expect(calcularIdadeEmMeses('2026-13-40', new Date(2026, 7, 1))).toBeNull()
  })
})

describe('formatarIdadeEmMeses', () => {
  it('formata menos de um ano em meses', () => {
    expect(formatarIdadeEmMeses(0)).toBe('0 meses')
    expect(formatarIdadeEmMeses(1)).toBe('1 mês')
    expect(formatarIdadeEmMeses(7)).toBe('7 meses')
  })

  it('formata exatamente um ano', () => {
    expect(formatarIdadeEmMeses(12)).toBe('1 ano')
    expect(formatarIdadeEmMeses(24)).toBe('2 anos')
  })

  it('formata anos e meses', () => {
    expect(formatarIdadeEmMeses(14)).toBe('1 ano e 2 meses')
    expect(formatarIdadeEmMeses(25)).toBe('2 anos e 1 mês')
  })
})
