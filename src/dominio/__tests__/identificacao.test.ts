import { describe, expect, it } from 'vitest'
import type { Identificacao } from '../../db'
import { buscarAnimaisPorNumero, type AnimalComId } from '../identificacao'

const animais: AnimalComId[] = [
  {
    id: 1,
    categoria: 'vaca',
    situacao: 'ativo',
    dataNascimento: '2018-03-01',
    criadoEm: 1,
    atualizadoEm: 1,
  },
  {
    id: 2,
    categoria: 'bezerra',
    situacao: 'ativo',
    maeId: 1,
    dataNascimento: '2023-05-10',
    criadoEm: 2,
    atualizadoEm: 2,
  },
  {
    id: 3,
    categoria: 'bezerra',
    situacao: 'ativo',
    maeId: 1,
    dataNascimento: '2024-06-01',
    criadoEm: 3,
    atualizadoEm: 3,
  },
]

const identificacoes: Identificacao[] = [
  { id: 1, animalId: 1, numero: '45', tipo: 'numero_proprio', dataInicio: '2019-01-01', ativa: true, criadoEm: 1 },
  // duas irmãs nascidas em anos diferentes, mesma tatuagem (número da mãe)
  { id: 2, animalId: 2, numero: '45', tipo: 'tatuagem', dataInicio: '2023-05-10', ativa: true, criadoEm: 2 },
  { id: 3, animalId: 3, numero: '45', tipo: 'tatuagem', dataInicio: '2024-06-01', ativa: true, criadoEm: 3 },
  // animal 2 depois vira novilha com número próprio
  { id: 4, animalId: 2, numero: '112', tipo: 'numero_proprio', dataInicio: '2024-01-10', ativa: true, criadoEm: 4 },
]

describe('buscarAnimaisPorNumero', () => {
  it('encontra pelo número próprio atual', () => {
    const resultado = buscarAnimaisPorNumero('112', animais, identificacoes)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].animal.id).toBe(2)
  })

  it('encontra pela tatuagem antiga mesmo depois de o animal trocar de número', () => {
    const resultado = buscarAnimaisPorNumero('45', animais, identificacoes)
    // duas irmãs compartilham a tatuagem 45 e a mãe também usa 45 como número próprio
    expect(resultado.map((r) => r.animal.id).sort()).toEqual([1, 2, 3])
  })

  it('cada resultado carrega o histórico completo de identificações do animal', () => {
    const resultado = buscarAnimaisPorNumero('45', animais, identificacoes)
    const daFilha = resultado.find((r) => r.animal.id === 2)!
    expect(daFilha.identificacoes.map((i) => i.numero)).toEqual(['45', '112'])
  })

  it('retorna lista vazia para número não cadastrado', () => {
    expect(buscarAnimaisPorNumero('999', animais, identificacoes)).toEqual([])
  })

  it('retorna lista vazia para termo vazio', () => {
    expect(buscarAnimaisPorNumero('   ', animais, identificacoes)).toEqual([])
  })

  it('ignora espaços ao redor do número buscado', () => {
    const resultado = buscarAnimaisPorNumero('  112  ', animais, identificacoes)
    expect(resultado).toHaveLength(1)
  })
})
