import { describe, expect, it } from 'vitest'
import { projetarDataPesoAlvo } from '../projecaoVenda'

describe('projetarDataPesoAlvo', () => {
  it('projeta a data usando o ganho de peso do próprio animal com duas pesagens', () => {
    const projecao = projetarDataPesoAlvo(
      [
        { data: '2026-01-01', pesoKg: 40 },
        { data: '2026-01-31', pesoKg: 70 }, // 1kg/dia
      ],
      null,
    )
    // faltam 110kg a 1kg/dia = 110 dias após 2026-01-31
    expect(projecao).toEqual({ dataPrevista: '2026-05-21', estimativa: false, jaAtingiu: false })
  })

  it('usa o ganho médio do rebanho como estimativa com uma pesagem só', () => {
    const projecao = projetarDataPesoAlvo([{ data: '2026-01-01', pesoKg: 100 }], 1)
    expect(projecao).toEqual({ dataPrevista: '2026-03-22', estimativa: true, jaAtingiu: false })
  })

  it('marca que já atingiu o peso quando a última pesagem já é suficiente', () => {
    const projecao = projetarDataPesoAlvo([{ data: '2026-01-01', pesoKg: 185 }], null)
    expect(projecao).toEqual({ dataPrevista: '2026-01-01', estimativa: false, jaAtingiu: true })
  })

  it('retorna null sem nenhuma pesagem', () => {
    expect(projetarDataPesoAlvo([], 1)).toBeNull()
  })

  it('retorna null com uma pesagem e sem ganho médio do rebanho disponível', () => {
    expect(projetarDataPesoAlvo([{ data: '2026-01-01', pesoKg: 100 }], null)).toBeNull()
  })

  it('retorna null quando o ganho de peso do animal é zero ou negativo e não há média do rebanho', () => {
    const projecao = projetarDataPesoAlvo(
      [
        { data: '2026-01-01', pesoKg: 100 },
        { data: '2026-01-11', pesoKg: 95 },
      ],
      null,
    )
    expect(projecao).toBeNull()
  })

  it('cai para o ganho médio do rebanho quando o próprio animal está perdendo peso', () => {
    const projecao = projetarDataPesoAlvo(
      [
        { data: '2026-01-01', pesoKg: 100 },
        { data: '2026-01-11', pesoKg: 95 },
      ],
      1,
    )
    expect(projecao?.estimativa).toBe(true)
    expect(projecao?.jaAtingiu).toBe(false)
  })

  it('aceita um peso alvo diferente do padrão', () => {
    const projecao = projetarDataPesoAlvo([{ data: '2026-01-01', pesoKg: 40 }], 2, 50)
    expect(projecao).toEqual({ dataPrevista: '2026-01-06', estimativa: true, jaAtingiu: false })
  })

  it('ignora pesagens com data malformada em vez de travar ou virar NaN', () => {
    const projecao = projetarDataPesoAlvo(
      [
        { data: '2026-01-01', pesoKg: 40 },
        { data: '2026-01-31', pesoKg: 70 }, // 1kg/dia
        { data: '2026-02-30', pesoKg: 999 }, // dia inexistente, deve ser ignorada
      ],
      null,
    )
    expect(projecao).toEqual({ dataPrevista: '2026-05-21', estimativa: false, jaAtingiu: false })
  })

  it('retorna null quando só existem pesagens com data malformada', () => {
    expect(projetarDataPesoAlvo([{ data: '2026-13-40', pesoKg: 40 }], 1)).toBeNull()
  })
})
