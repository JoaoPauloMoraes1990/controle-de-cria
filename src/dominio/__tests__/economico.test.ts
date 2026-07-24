import { describe, expect, it } from 'vitest'
import {
  calcularCustoPorArroba,
  calcularCustoPorBezerroVendido,
  calcularCustoPorMatriz,
  calcularParticipacaoPorCategoria,
  calcularPrecoMedioRecebidoPorArroba,
} from '../economico'

describe('calcularCustoPorMatriz', () => {
  it('divide o total pela quantidade de matrizes', () => {
    expect(calcularCustoPorMatriz(10000, 20)).toBe(500)
  })

  it('retorna null sem matriz nenhuma, nunca zero ou infinito', () => {
    expect(calcularCustoPorMatriz(10000, 0)).toBeNull()
  })
})

describe('calcularCustoPorBezerroVendido', () => {
  it('divide o total pela quantidade de bezerros vendidos', () => {
    expect(calcularCustoPorBezerroVendido(9000, 30)).toBe(300)
  })

  it('retorna null sem venda nenhuma', () => {
    expect(calcularCustoPorBezerroVendido(9000, 0)).toBeNull()
  })
})

describe('calcularCustoPorArroba', () => {
  it('divide o total pelas arrobas vendidas', () => {
    expect(calcularCustoPorArroba(6000, 200)).toBe(30)
  })

  it('retorna null sem arroba vendida', () => {
    expect(calcularCustoPorArroba(6000, 0)).toBeNull()
  })
})

describe('calcularPrecoMedioRecebidoPorArroba', () => {
  it('divide o valor recebido pelas arrobas vendidas', () => {
    expect(calcularPrecoMedioRecebidoPorArroba(60000, 200)).toBe(300)
  })

  it('retorna null sem arroba vendida', () => {
    expect(calcularPrecoMedioRecebidoPorArroba(60000, 0)).toBeNull()
  })
})

describe('calcularParticipacaoPorCategoria', () => {
  it('calcula o percentual de cada categoria', () => {
    const resultado = calcularParticipacaoPorCategoria(
      { sanidade: 300, nutricao: 700 },
      1000,
    )
    expect(resultado).toEqual([
      { categoria: 'nutricao', valor: 700, percentual: 70 },
      { categoria: 'sanidade', valor: 300, percentual: 30 },
    ])
  })

  it('ignora categorias com valor zero', () => {
    const resultado = calcularParticipacaoPorCategoria({ sanidade: 0, nutricao: 100 }, 100)
    expect(resultado).toEqual([{ categoria: 'nutricao', valor: 100, percentual: 100 }])
  })

  it('retorna lista vazia quando o total é zero', () => {
    expect(calcularParticipacaoPorCategoria({}, 0)).toEqual([])
  })
})
