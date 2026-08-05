import { describe, expect, it } from 'vitest'
import { calcularGanhoPesoDiario, obterUltimaPesagemValida } from '../ganhoPeso'

describe('calcularGanhoPesoDiario', () => {
  it('calcula o ganho médio por dia entre a primeira e a última pesagem', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 40 },
      { data: '2026-01-31', pesoKg: 70 },
    ])
    expect(ganho).toBeCloseTo(1, 5)
  })

  it('ignora a ordem em que as pesagens são passadas', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-31', pesoKg: 70 },
      { data: '2026-01-01', pesoKg: 40 },
    ])
    expect(ganho).toBeCloseTo(1, 5)
  })

  it('usa a primeira e a última quando há mais de duas pesagens', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 40 },
      { data: '2026-01-15', pesoKg: 200 },
      { data: '2026-01-31', pesoKg: 70 },
    ])
    expect(ganho).toBeCloseTo(1, 5)
  })

  it('retorna null com menos de duas pesagens válidas', () => {
    expect(calcularGanhoPesoDiario([])).toBeNull()
    expect(calcularGanhoPesoDiario([{ data: '2026-01-01', pesoKg: 40 }])).toBeNull()
  })

  it('ignora pesagens sem data ou sem peso', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 40 },
      { data: undefined, pesoKg: 999 },
      { data: '2026-01-11', pesoKg: undefined },
      { data: '2026-01-11', pesoKg: 50 },
    ])
    expect(ganho).toBeCloseTo(1, 5)
  })

  it('retorna null quando as duas pesagens válidas são no mesmo dia', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 40 },
      { data: '2026-01-01', pesoKg: 45 },
    ])
    expect(ganho).toBeNull()
  })

  it('aceita perda de peso (resultado negativo)', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 400 },
      { data: '2026-01-11', pesoKg: 390 },
    ])
    expect(ganho).toBeCloseTo(-1, 5)
  })

  it('ignora pesagens com data malformada em vez de virar NaN', () => {
    const ganho = calcularGanhoPesoDiario([
      { data: '2026-01-01', pesoKg: 40 },
      { data: '2026-02-30', pesoKg: 999 },
      { data: '2026-01-31', pesoKg: 70 },
    ])
    expect(ganho).toBeCloseTo(1, 5)
    expect(Number.isNaN(ganho)).toBe(false)
  })
})

describe('obterUltimaPesagemValida', () => {
  it('retorna a pesagem mais recente por data, não pela ordem da lista', () => {
    const ultima = obterUltimaPesagemValida([
      { data: '2026-01-31', pesoKg: 70 },
      { data: '2026-01-01', pesoKg: 40 },
    ])
    expect(ultima).toEqual({ data: '2026-01-31', pesoKg: 70 })
  })

  it('retorna null sem nenhuma pesagem válida', () => {
    expect(obterUltimaPesagemValida([])).toBeNull()
    expect(obterUltimaPesagemValida([{ data: undefined, pesoKg: 40 }])).toBeNull()
  })

  it('ignora pesagens com data malformada', () => {
    const ultima = obterUltimaPesagemValida([
      { data: '2026-01-01', pesoKg: 40 },
      { data: '2026-02-30', pesoKg: 999 },
    ])
    expect(ultima).toEqual({ data: '2026-01-01', pesoKg: 40 })
  })
})
