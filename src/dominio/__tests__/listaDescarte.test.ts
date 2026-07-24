import { describe, expect, it } from 'vitest'
import {
  calcularPontuacaoDescarte,
  contarAnosConsecutivosSemParir,
  ordenarListaDescarte,
  type CandidatoDescarte,
} from '../listaDescarte'

describe('contarAnosConsecutivosSemParir', () => {
  it('conta os anos seguidos sem parto até o ano de referência', () => {
    expect(contarAnosConsecutivosSemParir([2020, 2021], 2024)).toBe(3) // 2022, 2023, 2024
  })

  it('retorna 0 quando pariu no próprio ano de referência', () => {
    expect(contarAnosConsecutivosSemParir([2020, 2024], 2024)).toBe(0)
  })

  it('retorna 0 sem nenhum parto registrado', () => {
    expect(contarAnosConsecutivosSemParir([], 2024)).toBe(0)
  })

  it('para de contar no primeiro ano em que já pariu', () => {
    expect(contarAnosConsecutivosSemParir([2022], 2024)).toBe(2) // 2023, 2024
  })
})

describe('calcularPontuacaoDescarte', () => {
  it('retorna null sem dados suficientes', () => {
    const candidato: CandidatoDescarte = {
      matrizId: 1,
      intervaloMedioEntrePartos: null,
      anosConsecutivosSemParir: 0,
      diasMediosAte180kg: null,
      temDadosSuficientes: false,
    }
    expect(calcularPontuacaoDescarte(candidato)).toBeNull()
  })

  it('soma intervalo, dias até 180kg e uma penalidade forte por falha', () => {
    const candidato: CandidatoDescarte = {
      matrizId: 1,
      intervaloMedioEntrePartos: 400,
      anosConsecutivosSemParir: 1,
      diasMediosAte180kg: 200,
      temDadosSuficientes: true,
    }
    expect(calcularPontuacaoDescarte(candidato)).toBe(400 + 200 + 200)
  })
})

describe('ordenarListaDescarte', () => {
  it('coloca a pior matriz primeiro', () => {
    const boa: CandidatoDescarte = {
      matrizId: 1,
      intervaloMedioEntrePartos: 365,
      anosConsecutivosSemParir: 0,
      diasMediosAte180kg: 180,
      temDadosSuficientes: true,
    }
    const ruim: CandidatoDescarte = {
      matrizId: 2,
      intervaloMedioEntrePartos: 600,
      anosConsecutivosSemParir: 2,
      diasMediosAte180kg: 220,
      temDadosSuficientes: true,
    }
    const ordenada = ordenarListaDescarte([boa, ruim])
    expect(ordenada.map((c) => c.matrizId)).toEqual([2, 1])
  })

  it('joga quem não tem dados suficientes para o final', () => {
    const semDados: CandidatoDescarte = {
      matrizId: 1,
      intervaloMedioEntrePartos: null,
      anosConsecutivosSemParir: 0,
      diasMediosAte180kg: null,
      temDadosSuficientes: false,
    }
    const comDados: CandidatoDescarte = {
      matrizId: 2,
      intervaloMedioEntrePartos: 365,
      anosConsecutivosSemParir: 0,
      diasMediosAte180kg: 180,
      temDadosSuficientes: true,
    }
    const ordenada = ordenarListaDescarte([semDados, comDados])
    expect(ordenada.map((c) => c.matrizId)).toEqual([2, 1])
  })
})
