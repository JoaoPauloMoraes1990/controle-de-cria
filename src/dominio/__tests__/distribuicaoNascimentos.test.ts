import { describe, expect, it } from 'vitest'
import { contarNascimentosPorAno, contarNascimentosPorMes } from '../distribuicaoNascimentos'

describe('contarNascimentosPorAno', () => {
  it('conta os nascimentos de cada ano pedido', () => {
    const datas = ['2023-01-01', '2023-06-01', '2024-03-01', '2025-01-01']
    const resultado = contarNascimentosPorAno(datas, [2022, 2023, 2024, 2025])
    expect(resultado).toEqual([
      { ano: 2022, total: 0 },
      { ano: 2023, total: 2 },
      { ano: 2024, total: 1 },
      { ano: 2025, total: 1 },
    ])
  })

  it('ignora datas ausentes', () => {
    const resultado = contarNascimentosPorAno([undefined, '2024-01-01'], [2024])
    expect(resultado).toEqual([{ ano: 2024, total: 1 }])
  })

  it('devolve zero, não "não disponível", quando não há nascimento no ano', () => {
    const resultado = contarNascimentosPorAno([], [2024])
    expect(resultado[0].total).toBe(0)
  })
})

describe('contarNascimentosPorMes', () => {
  it('agrupa por mês (0 = janeiro), somando todos os anos', () => {
    const datas = ['2023-01-15', '2024-01-20', '2023-12-01']
    const resultado = contarNascimentosPorMes(datas)
    expect(resultado).toHaveLength(12)
    expect(resultado[0]).toBe(2) // janeiro
    expect(resultado[11]).toBe(1) // dezembro
    expect(resultado[5]).toBe(0)
  })

  it('ignora datas ausentes', () => {
    const resultado = contarNascimentosPorMes([undefined, '2024-03-01'])
    expect(resultado[2]).toBe(1)
    expect(resultado.reduce((a, b) => a + b, 0)).toBe(1)
  })
})
