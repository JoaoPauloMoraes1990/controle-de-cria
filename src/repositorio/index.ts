import { db } from '../db'
import type {
  Animal,
  Categoria,
  Identificacao,
  Situacao,
  Sexo,
} from '../db'
import { kgParaArroba } from '../dominio/arroba'
import {
  buscarAnimaisPorNumero,
  type AnimalComId,
  type ResultadoBusca,
} from '../dominio/identificacao'

/**
 * Único módulo de acesso a dados do aplicativo. Nenhuma tela deve importar
 * `db` diretamente — tudo passa por aqui, inclusive o controle do "desfazer
 * último lançamento".
 */

function agora(): number {
  return Date.now()
}

function novoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${agora()}-${Math.random().toString(36).slice(2)}`
}

async function registrarUltimaAcao(
  tipo: string,
  payload: unknown,
  descricao: string,
) {
  await db.ultimaAcao.put({
    id: 1,
    tipo,
    payload: JSON.stringify(payload),
    descricao,
    timestamp: agora(),
  })
}

// ---------------------------------------------------------------------------
// Consulta
// ---------------------------------------------------------------------------

export async function listarAnimais(): Promise<AnimalComId[]> {
  const todos = await db.animais.toArray()
  return todos as AnimalComId[]
}

export async function obterAnimal(id: number): Promise<AnimalComId | undefined> {
  return (await db.animais.get(id)) as AnimalComId | undefined
}

export async function listarIdentificacoes(animalId: number): Promise<Identificacao[]> {
  const lista = await db.identificacoes.where('animalId').equals(animalId).toArray()
  return lista.sort((a, b) => (a.dataInicio ?? '').localeCompare(b.dataInicio ?? ''))
}

export async function identificacaoAtiva(animalId: number): Promise<Identificacao | undefined> {
  const lista = await listarIdentificacoes(animalId)
  return [...lista].reverse().find((i) => i.ativa) ?? lista[lista.length - 1]
}

export async function buscarPorNumero(termo: string): Promise<ResultadoBusca[]> {
  const [animais, identificacoes] = await Promise.all([
    listarAnimais(),
    db.identificacoes.toArray(),
  ])
  return buscarAnimaisPorNumero(termo, animais, identificacoes)
}

export async function listarPesagens(animalId: number) {
  const lista = await db.pesagens.where('animalId').equals(animalId).toArray()
  return lista.sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''))
}

export async function listarVendas(animalId: number) {
  return db.vendas.where('animalId').equals(animalId).toArray()
}

export async function listarMortes(animalId: number) {
  return db.mortes.where('animalId').equals(animalId).toArray()
}

export async function listarTodasPesagens() {
  return db.pesagens.toArray()
}

export async function listarTodasVendas() {
  return db.vendas.toArray()
}

export async function listarTodasMortes() {
  return db.mortes.toArray()
}

export async function listarMudancasCategoria(animalId: number) {
  return db.mudancasCategoria.where('animalId').equals(animalId).toArray()
}

export async function obterUltimaAcao() {
  return db.ultimaAcao.get(1)
}

export async function obterConfiguracoes() {
  return (await db.configuracoes.get(1)) ?? { id: 1 }
}

export async function salvarConfiguracoes(dados: Partial<{
  ultimoBackupEm: number
  valorReferenciaNovilhaPorCabeca: number
  prazoDiluicaoPadraoAnos: number
}>) {
  const atual = await obterConfiguracoes()
  await db.configuracoes.put({ ...atual, ...dados, id: 1 })
}

// ---------------------------------------------------------------------------
// Cadastro de animal avulso
// ---------------------------------------------------------------------------

export interface DadosCadastroAnimal {
  numero: string
  categoria?: Categoria
  sexo?: Sexo
  situacao?: Situacao
  dataNascimento?: string
  maeId?: number
  observacoes?: string
}

export async function cadastrarAnimal(dados: DadosCadastroAnimal): Promise<number> {
  return db.transaction('rw', db.animais, db.identificacoes, db.ultimaAcao, async () => {
    const timestamp = agora()
    const animalId = await db.animais.add({
      categoria: dados.categoria,
      sexo: dados.sexo,
      situacao: dados.situacao ?? 'ativo',
      dataNascimento: dados.dataNascimento,
      maeId: dados.maeId,
      observacoes: dados.observacoes,
      origem: 'lancamento',
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    })

    const tipoIdentificacao =
      dados.categoria === 'novilha' || dados.categoria === 'vaca' || dados.categoria === 'touro'
        ? 'numero_proprio'
        : 'tatuagem'

    const identificacaoId = await db.identificacoes.add({
      animalId,
      numero: dados.numero.trim(),
      tipo: tipoIdentificacao,
      dataInicio: dados.dataNascimento,
      ativa: true,
      criadoEm: timestamp,
    })

    await registrarUltimaAcao(
      'cadastro_animal',
      { animalId, identificacaoId },
      `Cadastro do animal ${dados.numero.trim()}`,
    )

    return animalId
  })
}

// ---------------------------------------------------------------------------
// Nascimento
// ---------------------------------------------------------------------------

export interface DadosNascimento {
  numero: string
  maeId?: number
  sexo?: Sexo
  data?: string
  observacoes?: string
}

export async function registrarNascimento(dados: DadosNascimento): Promise<number> {
  return db.transaction('rw', db.animais, db.identificacoes, db.ultimaAcao, async () => {
    const timestamp = agora()
    const categoria: Categoria | undefined =
      dados.sexo === 'M' ? 'bezerro' : dados.sexo === 'F' ? 'bezerra' : undefined

    const animalId = await db.animais.add({
      categoria,
      sexo: dados.sexo,
      situacao: 'ativo',
      dataNascimento: dados.data,
      maeId: dados.maeId,
      observacoes: dados.observacoes,
      origem: 'lancamento',
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    })

    const identificacaoId = await db.identificacoes.add({
      animalId,
      numero: dados.numero.trim(),
      tipo: 'tatuagem',
      dataInicio: dados.data,
      ativa: true,
      criadoEm: timestamp,
    })

    await registrarUltimaAcao(
      'nascimento',
      { animalId, identificacaoId },
      `Nascimento do bezerro ${dados.numero.trim()}`,
    )

    return animalId
  })
}

// ---------------------------------------------------------------------------
// Pesagem
// ---------------------------------------------------------------------------

export interface DadosPesagem {
  animalId: number
  data?: string
  pesoKg?: number
  observacoes?: string
}

export async function registrarPesagem(dados: DadosPesagem): Promise<number> {
  return db.transaction('rw', db.pesagens, db.ultimaAcao, async () => {
    const timestamp = agora()
    const pesagemId = await db.pesagens.add({
      animalId: dados.animalId,
      data: dados.data,
      pesoKg: dados.pesoKg,
      observacoes: dados.observacoes,
      criadoEm: timestamp,
    })

    await registrarUltimaAcao(
      'pesagem',
      { pesagemId },
      dados.pesoKg != null ? `Pesagem de ${dados.pesoKg} kg` : 'Pesagem',
    )

    return pesagemId
  })
}

// ---------------------------------------------------------------------------
// Venda
// ---------------------------------------------------------------------------

export interface ItemVenda {
  animalId: number
  pesoKg?: number
  arrobas?: number
  valorTotal?: number
}

export interface DadosVenda {
  data?: string
  comprador?: string
  precoPorArroba?: number
  observacoes?: string
  itens: ItemVenda[]
}

export async function registrarVenda(dados: DadosVenda): Promise<number[]> {
  return db.transaction('rw', db.vendas, db.animais, db.pesagens, db.ultimaAcao, async () => {
    const timestamp = agora()
    const loteId = dados.itens.length > 1 ? novoId() : undefined
    const vendaIds: number[] = []
    const pesagemIds: number[] = []
    const animaisAnteriores: { id: number; situacaoAnterior: Situacao }[] = []

    for (const item of dados.itens) {
      const animal = await db.animais.get(item.animalId)
      if (!animal) continue

      const arrobas = item.arrobas ?? (item.pesoKg != null ? kgParaArroba(item.pesoKg) : undefined)
      const valorTotal =
        item.valorTotal ??
        (arrobas != null && dados.precoPorArroba != null ? arrobas * dados.precoPorArroba : undefined)

      const vendaId = await db.vendas.add({
        loteId,
        animalId: item.animalId,
        data: dados.data,
        pesoKg: item.pesoKg,
        arrobas,
        precoPorArroba: dados.precoPorArroba,
        valorTotal,
        comprador: dados.comprador,
        observacoes: dados.observacoes,
        criadoEm: timestamp,
      })
      vendaIds.push(vendaId)

      // A pesagem de venda entra no histórico de peso do animal como
      // qualquer outra pesagem — é o que alimenta o ganho de peso e a
      // projeção dos 180kg.
      if (item.pesoKg != null) {
        const pesagemId = await db.pesagens.add({
          animalId: item.animalId,
          data: dados.data,
          pesoKg: item.pesoKg,
          observacoes: 'Pesagem de venda',
          criadoEm: timestamp,
        })
        pesagemIds.push(pesagemId)
      }

      animaisAnteriores.push({ id: item.animalId, situacaoAnterior: animal.situacao })
      await db.animais.update(item.animalId, { situacao: 'vendido', atualizadoEm: timestamp })
    }

    await registrarUltimaAcao(
      'venda',
      { vendaIds, pesagemIds, animaisAnteriores },
      vendaIds.length > 1 ? `Venda de ${vendaIds.length} animais` : 'Venda de 1 animal',
    )

    return vendaIds
  })
}

// ---------------------------------------------------------------------------
// Morte
// ---------------------------------------------------------------------------

export interface DadosMorte {
  animalId: number
  data?: string
  causaProvavel?: string
  observacoes?: string
}

export async function registrarMorte(dados: DadosMorte): Promise<number> {
  return db.transaction('rw', db.mortes, db.animais, db.ultimaAcao, async () => {
    const timestamp = agora()
    const animal = await db.animais.get(dados.animalId)
    const situacaoAnterior: Situacao = animal?.situacao ?? 'ativo'

    const morteId = await db.mortes.add({
      animalId: dados.animalId,
      data: dados.data,
      causaProvavel: dados.causaProvavel,
      observacoes: dados.observacoes,
      criadoEm: timestamp,
    })

    await db.animais.update(dados.animalId, { situacao: 'morto', atualizadoEm: timestamp })

    await registrarUltimaAcao(
      'morte',
      { morteId, animalId: dados.animalId, situacaoAnterior },
      'Morte registrada',
    )

    return morteId
  })
}

// ---------------------------------------------------------------------------
// Virou novilha
// ---------------------------------------------------------------------------

export interface DadosVirouNovilha {
  animalId: number
  numeroNovo: string
  data?: string
}

export async function registrarVirouNovilha(dados: DadosVirouNovilha): Promise<void> {
  return db.transaction(
    'rw',
    db.animais,
    db.identificacoes,
    db.mudancasCategoria,
    db.ultimaAcao,
    async () => {
      const timestamp = agora()
      const animal = await db.animais.get(dados.animalId)
      const categoriaAnterior = animal?.categoria

      const identificacaoAnterior = await identificacaoAtiva(dados.animalId)
      if (identificacaoAnterior?.id != null) {
        await db.identificacoes.update(identificacaoAnterior.id, { ativa: false })
      }

      const identificacaoNovaId = await db.identificacoes.add({
        animalId: dados.animalId,
        numero: dados.numeroNovo.trim(),
        tipo: 'numero_proprio',
        dataInicio: dados.data,
        ativa: true,
        criadoEm: timestamp,
      })

      const mudancaCategoriaId = await db.mudancasCategoria.add({
        animalId: dados.animalId,
        categoriaAnterior,
        categoriaNova: 'novilha',
        data: dados.data,
        criadoEm: timestamp,
      })

      await db.animais.update(dados.animalId, { categoria: 'novilha', atualizadoEm: timestamp })

      await registrarUltimaAcao(
        'virou_novilha',
        {
          animalId: dados.animalId,
          identificacaoNovaId,
          identificacaoAnteriorId: identificacaoAnterior?.id,
          categoriaAnterior,
          mudancaCategoriaId,
        },
        `Virou novilha: número ${dados.numeroNovo.trim()}`,
      )
    },
  )
}

// ---------------------------------------------------------------------------
// Edição livre da ficha do animal (correção, não passa pelo desfazer)
// ---------------------------------------------------------------------------

export async function atualizarAnimal(id: number, alteracoes: Partial<Animal>): Promise<void> {
  await db.animais.update(id, { ...alteracoes, atualizadoEm: agora() })
}

// ---------------------------------------------------------------------------
// Desfazer último lançamento
// ---------------------------------------------------------------------------

export async function desfazerUltimoLancamento(): Promise<boolean> {
  const ultima = await db.ultimaAcao.get(1)
  if (!ultima) return false

  const payload = JSON.parse(ultima.payload) as Record<string, unknown>

  await db.transaction(
    'rw',
    [db.animais, db.identificacoes, db.pesagens, db.vendas, db.mortes, db.mudancasCategoria, db.ultimaAcao],
    async () => {
      switch (ultima.tipo) {
        case 'cadastro_animal':
        case 'nascimento': {
          const { animalId, identificacaoId } = payload as {
            animalId: number
            identificacaoId: number
          }
          await db.identificacoes.delete(identificacaoId)
          await db.animais.delete(animalId)
          break
        }
        case 'pesagem': {
          const { pesagemId } = payload as { pesagemId: number }
          await db.pesagens.delete(pesagemId)
          break
        }
        case 'venda': {
          const { vendaIds, pesagemIds, animaisAnteriores } = payload as {
            vendaIds: number[]
            pesagemIds?: number[]
            animaisAnteriores: { id: number; situacaoAnterior: Situacao }[]
          }
          await db.vendas.bulkDelete(vendaIds)
          if (pesagemIds?.length) await db.pesagens.bulkDelete(pesagemIds)
          for (const { id, situacaoAnterior } of animaisAnteriores) {
            await db.animais.update(id, { situacao: situacaoAnterior, atualizadoEm: agora() })
          }
          break
        }
        case 'morte': {
          const { morteId, animalId, situacaoAnterior } = payload as {
            morteId: number
            animalId: number
            situacaoAnterior: Situacao
          }
          await db.mortes.delete(morteId)
          await db.animais.update(animalId, { situacao: situacaoAnterior, atualizadoEm: agora() })
          break
        }
        case 'virou_novilha': {
          const {
            animalId,
            identificacaoNovaId,
            identificacaoAnteriorId,
            categoriaAnterior,
            mudancaCategoriaId,
          } = payload as {
            animalId: number
            identificacaoNovaId: number
            identificacaoAnteriorId?: number
            categoriaAnterior?: Categoria
            mudancaCategoriaId: number
          }
          await db.identificacoes.delete(identificacaoNovaId)
          if (identificacaoAnteriorId != null) {
            await db.identificacoes.update(identificacaoAnteriorId, { ativa: true })
          }
          await db.mudancasCategoria.delete(mudancaCategoriaId)
          await db.animais.update(animalId, { categoria: categoriaAnterior, atualizadoEm: agora() })
          break
        }
      }

      await db.ultimaAcao.delete(1)
    },
  )

  return true
}
