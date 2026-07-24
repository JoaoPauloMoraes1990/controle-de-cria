import { db } from '../db'
import type { Animal, Categoria, Sexo } from '../db'
import type { AnimalComId } from '../dominio/identificacao'

/**
 * Repositório dedicado à área de cadastro inicial (Etapa B). Continua sendo
 * acesso a dados isolado do resto do app — nenhuma tela fala com `db`
 * diretamente — só que separado do repositório principal porque a área de
 * cadastro inicial é isolada e pode ser desligada sem afetar o resto.
 */

function agora(): number {
  return Date.now()
}

// ---------------------------------------------------------------------------
// Matriz
// ---------------------------------------------------------------------------

export interface DadosMatrizInicial {
  numero: string
  categoria: 'vaca' | 'novilha'
  anoNascimentoAproximado?: number
}

export async function criarMatrizInicial(dados: DadosMatrizInicial): Promise<number> {
  return db.transaction('rw', [db.animais, db.identificacoes], async () => {
    const timestamp = agora()
    const animalId = await db.animais.add({
      categoria: dados.categoria,
      situacao: 'ativo',
      anoNascimentoAproximado: dados.anoNascimentoAproximado,
      origem: 'cadastro_inicial',
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    })

    await db.identificacoes.add({
      animalId,
      numero: dados.numero.trim(),
      tipo: 'numero_proprio',
      ativa: true,
      criadoEm: timestamp,
    })

    return animalId
  })
}

export async function atualizarMatrizInicial(
  animalId: number,
  dados: Partial<DadosMatrizInicial>,
): Promise<void> {
  const alteracoes: Partial<Animal> = { atualizadoEm: agora() }
  if (dados.categoria !== undefined) alteracoes.categoria = dados.categoria
  if (dados.anoNascimentoAproximado !== undefined) {
    alteracoes.anoNascimentoAproximado = dados.anoNascimentoAproximado
  }
  await db.animais.update(animalId, alteracoes)

  if (dados.numero !== undefined) {
    const identificacoes = await db.identificacoes.where('animalId').equals(animalId).toArray()
    const ativa = identificacoes.find((i) => i.ativa) ?? identificacoes[0]
    if (ativa?.id != null) {
      await db.identificacoes.update(ativa.id, { numero: dados.numero.trim() })
    }
  }
}

export async function removerMatrizInicial(animalId: number): Promise<void> {
  await db.transaction('rw', [db.animais, db.identificacoes], async () => {
    const crias = await db.animais.where('maeId').equals(animalId).toArray()
    for (const cria of crias) {
      if (cria.id != null) {
        await db.identificacoes.where('animalId').equals(cria.id).delete()
        await db.animais.delete(cria.id)
      }
    }
    await db.identificacoes.where('animalId').equals(animalId).delete()
    await db.animais.delete(animalId)
  })
}

export async function listarMatrizesIniciais(): Promise<AnimalComId[]> {
  const todas = await db.animais.where('origem').equals('cadastro_inicial').toArray()
  const matrizes = todas.filter((a) => a.categoria === 'vaca' || a.categoria === 'novilha')
  matrizes.sort((a, b) => a.criadoEm - b.criadoEm)
  return matrizes as AnimalComId[]
}

// ---------------------------------------------------------------------------
// Crias
// ---------------------------------------------------------------------------

export interface DadosCriaInicial {
  maeId: number
  sexo?: Sexo
  data?: string
  numero?: string
}

export async function criarCriaInicial(dados: DadosCriaInicial): Promise<number> {
  return db.transaction('rw', [db.animais, db.identificacoes], async () => {
    const timestamp = agora()
    const categoria: Categoria | undefined = dados.numero?.trim()
      ? 'novilha'
      : dados.sexo === 'M'
        ? 'bezerro'
        : dados.sexo === 'F'
          ? 'bezerra'
          : undefined

    const animalId = await db.animais.add({
      categoria,
      sexo: dados.sexo,
      situacao: 'ativo',
      dataNascimento: dados.data,
      maeId: dados.maeId,
      origem: 'cadastro_inicial',
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    })

    if (dados.numero?.trim()) {
      await db.identificacoes.add({
        animalId,
        numero: dados.numero.trim(),
        tipo: 'numero_proprio',
        ativa: true,
        criadoEm: timestamp,
      })
    }

    return animalId
  })
}

export async function atualizarCriaInicial(
  animalId: number,
  dados: Partial<DadosCriaInicial>,
): Promise<void> {
  const alteracoes: Partial<Animal> = { atualizadoEm: agora() }
  if (dados.sexo !== undefined) alteracoes.sexo = dados.sexo
  if (dados.data !== undefined) alteracoes.dataNascimento = dados.data
  await db.animais.update(animalId, alteracoes)

  if (dados.numero !== undefined) {
    const identificacoes = await db.identificacoes.where('animalId').equals(animalId).toArray()
    if (dados.numero.trim()) {
      if (identificacoes.length > 0) {
        await db.identificacoes.update(identificacoes[0].id!, { numero: dados.numero.trim() })
      } else {
        await db.identificacoes.add({
          animalId,
          numero: dados.numero.trim(),
          tipo: 'numero_proprio',
          ativa: true,
          criadoEm: agora(),
        })
      }
      await db.animais.update(animalId, { categoria: 'novilha' })
    } else if (identificacoes.length > 0) {
      await db.identificacoes.where('animalId').equals(animalId).delete()
    }
  }
}

export async function removerCriaInicial(animalId: number): Promise<void> {
  await db.transaction('rw', [db.animais, db.identificacoes], async () => {
    await db.identificacoes.where('animalId').equals(animalId).delete()
    await db.animais.delete(animalId)
  })
}

export async function listarCriasDaMatriz(maeId: number): Promise<AnimalComId[]> {
  const crias = await db.animais.where('maeId').equals(maeId).toArray()
  crias.sort((a, b) => a.criadoEm - b.criadoEm)
  return crias as AnimalComId[]
}

export async function obterNumeroAtual(animalId: number): Promise<string | undefined> {
  const identificacoes = await db.identificacoes.where('animalId').equals(animalId).toArray()
  return (identificacoes.find((i) => i.ativa) ?? identificacoes[0])?.numero
}

export async function mapaNumerosAtuais(): Promise<Map<number, string>> {
  const identificacoes = await db.identificacoes.toArray()
  const mapa = new Map<number, string>()
  for (const ident of identificacoes) {
    if (!mapa.has(ident.animalId)) mapa.set(ident.animalId, ident.numero)
  }
  for (const ident of identificacoes) {
    if (ident.ativa) mapa.set(ident.animalId, ident.numero)
  }
  return mapa
}

// ---------------------------------------------------------------------------
// Encerrar / reabrir a área
// ---------------------------------------------------------------------------

export async function cadastroInicialEstaEncerrado(): Promise<boolean> {
  const config = await db.configuracoes.get(1)
  return !!config?.cadastroInicialEncerrado
}

export async function encerrarCadastroInicial(): Promise<void> {
  const atual = (await db.configuracoes.get(1)) ?? { id: 1 }
  await db.configuracoes.put({ ...atual, id: 1, cadastroInicialEncerrado: true })
}

export async function reabrirCadastroInicial(): Promise<void> {
  const atual = (await db.configuracoes.get(1)) ?? { id: 1 }
  await db.configuracoes.put({ ...atual, id: 1, cadastroInicialEncerrado: false })
}
