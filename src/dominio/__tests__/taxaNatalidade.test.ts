import { describe, expect, it } from 'vitest'
import { calcularTaxaNatalidade, estavaAtivaNoAno } from '../taxaNatalidade'

describe('estavaAtivaNoAno', () => {
  it('considera ativa quando não há data de entrada nem de saída', () => {
    expect(estavaAtivaNoAno({}, 2024)).toBe(true)
  })

  it('exclui antes da entrada', () => {
    expect(estavaAtivaNoAno({ entrada: '2025-03-01' }, 2024)).toBe(false)
    expect(estavaAtivaNoAno({ entrada: '2024-03-01' }, 2024)).toBe(true)
  })

  it('exclui depois da saída', () => {
    expect(estavaAtivaNoAno({ saida: '2023-06-01' }, 2024)).toBe(false)
    expect(estavaAtivaNoAno({ saida: '2024-06-01' }, 2024)).toBe(true)
  })
})

describe('calcularTaxaNatalidade', () => {
  it('calcula o percentual de crias por matriz ativa no ano', () => {
    const matrizes = [{}, {}, {}, {}] // 4 matrizes sempre ativas
    const nascimentos = ['2024-01-01', '2024-05-01', '2023-01-01']
    // 2 nascimentos em 2024, 4 matrizes -> 50%
    expect(calcularTaxaNatalidade(2024, matrizes, nascimentos)).toBeCloseTo(50, 5)
  })

  it('retorna null quando não há matriz ativa no ano', () => {
    const matrizes = [{ entrada: '2025-01-01' }]
    expect(calcularTaxaNatalidade(2024, matrizes, ['2024-01-01'])).toBeNull()
  })

  it('conta zero nascimentos como 0%, não como não disponível', () => {
    const matrizes = [{}, {}]
    expect(calcularTaxaNatalidade(2024, matrizes, [])).toBe(0)
  })

  it('ignora crias sem data de nascimento', () => {
    const matrizes = [{}]
    expect(calcularTaxaNatalidade(2024, matrizes, [undefined, '2024-02-02'])).toBeCloseTo(100, 5)
  })
})
