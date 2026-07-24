import { describe, expect, it } from 'vitest'
import { ordenarComNulosPorUltimo } from '../ordenacao'

describe('ordenarComNulosPorUltimo', () => {
  it('ordena crescente por padrão', () => {
    const itens = [{ v: 3 }, { v: 1 }, { v: 2 }]
    expect(ordenarComNulosPorUltimo(itens, (i) => i.v).map((i) => i.v)).toEqual([1, 2, 3])
  })

  it('ordena decrescente quando pedido', () => {
    const itens = [{ v: 3 }, { v: 1 }, { v: 2 }]
    expect(ordenarComNulosPorUltimo(itens, (i) => i.v, false).map((i) => i.v)).toEqual([3, 2, 1])
  })

  it('deixa nulos sempre por último, independente da direção', () => {
    const itens = [{ v: 2 }, { v: null }, { v: 1 }]
    expect(ordenarComNulosPorUltimo(itens, (i) => i.v).map((i) => i.v)).toEqual([1, 2, null])
    expect(ordenarComNulosPorUltimo(itens, (i) => i.v, false).map((i) => i.v)).toEqual([2, 1, null])
  })

  it('não altera o array original', () => {
    const itens = [{ v: 3 }, { v: 1 }]
    const copia = [...itens]
    ordenarComNulosPorUltimo(itens, (i) => i.v)
    expect(itens).toEqual(copia)
  })
})
