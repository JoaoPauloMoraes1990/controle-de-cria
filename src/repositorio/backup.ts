import Papa from 'papaparse'
import { db } from '../db'
import type {
  Animal,
  Configuracoes,
  Identificacao,
  MudancaCategoria,
  Morte,
  Pesagem,
  Venda,
} from '../db'
import { salvarConfiguracoes } from './index'

const VERSAO_BACKUP = 1

interface ArquivoBackup {
  versao: number
  exportadoEm: number
  animais: Animal[]
  identificacoes: Identificacao[]
  pesagens: Pesagem[]
  vendas: Venda[]
  mortes: Morte[]
  mudancasCategoria: MudancaCategoria[]
  configuracoes: Configuracoes[]
}

export async function gerarBackupCompleto(): Promise<string> {
  const [animais, identificacoes, pesagens, vendas, mortes, mudancasCategoria, configuracoes] =
    await Promise.all([
      db.animais.toArray(),
      db.identificacoes.toArray(),
      db.pesagens.toArray(),
      db.vendas.toArray(),
      db.mortes.toArray(),
      db.mudancasCategoria.toArray(),
      db.configuracoes.toArray(),
    ])

  const arquivo: ArquivoBackup = {
    versao: VERSAO_BACKUP,
    exportadoEm: Date.now(),
    animais,
    identificacoes,
    pesagens,
    vendas,
    mortes,
    mudancasCategoria,
    configuracoes,
  }

  await salvarConfiguracoes({ ultimoBackupEm: Date.now() })

  return JSON.stringify(arquivo, null, 2)
}

export async function restaurarBackupCompleto(conteudoJson: string): Promise<void> {
  const arquivo = JSON.parse(conteudoJson) as Partial<ArquivoBackup>

  if (!arquivo || typeof arquivo.versao !== 'number' || !Array.isArray(arquivo.animais)) {
    throw new Error('Esse arquivo não parece ser um backup do Controle de Cria.')
  }

  await db.transaction(
    'rw',
    [
      db.animais,
      db.identificacoes,
      db.pesagens,
      db.vendas,
      db.mortes,
      db.mudancasCategoria,
      db.configuracoes,
      db.ultimaAcao,
    ],
    async () => {
      await Promise.all([
        db.animais.clear(),
        db.identificacoes.clear(),
        db.pesagens.clear(),
        db.vendas.clear(),
        db.mortes.clear(),
        db.mudancasCategoria.clear(),
        db.configuracoes.clear(),
        db.ultimaAcao.clear(),
      ])

      await Promise.all([
        db.animais.bulkAdd(arquivo.animais ?? []),
        db.identificacoes.bulkAdd(arquivo.identificacoes ?? []),
        db.pesagens.bulkAdd(arquivo.pesagens ?? []),
        db.vendas.bulkAdd(arquivo.vendas ?? []),
        db.mortes.bulkAdd(arquivo.mortes ?? []),
        db.mudancasCategoria.bulkAdd(arquivo.mudancasCategoria ?? []),
        db.configuracoes.bulkAdd(arquivo.configuracoes ?? []),
      ])
    },
  )
}

export interface CsvsExportados {
  animais: string
  pesagens: string
  vendas: string
  mortes: string
}

export async function gerarCsvsExportacao(): Promise<CsvsExportados> {
  const [animais, identificacoes, pesagens, vendas, mortes] = await Promise.all([
    db.animais.toArray(),
    db.identificacoes.toArray(),
    db.pesagens.toArray(),
    db.vendas.toArray(),
    db.mortes.toArray(),
  ])

  const numeroAtualPorAnimal = new Map<number, string>()
  for (const ident of identificacoes) {
    if (ident.ativa) numeroAtualPorAnimal.set(ident.animalId, ident.numero)
  }
  const numeroDe = (animalId: number | undefined) =>
    animalId != null ? (numeroAtualPorAnimal.get(animalId) ?? '') : ''

  const animaisCsv = Papa.unparse(
    animais.map((a) => ({
      numero: numeroDe(a.id),
      categoria: a.categoria ?? '',
      sexo: a.sexo ?? '',
      situacao: a.situacao,
      dataNascimento: a.dataNascimento ?? '',
      maeNumero: numeroDe(a.maeId),
      observacoes: a.observacoes ?? '',
    })),
  )

  const pesagensCsv = Papa.unparse(
    pesagens.map((p) => ({
      numero: numeroDe(p.animalId),
      data: p.data ?? '',
      pesoKg: p.pesoKg ?? '',
    })),
  )

  const vendasCsv = Papa.unparse(
    vendas.map((v) => ({
      numero: numeroDe(v.animalId),
      data: v.data ?? '',
      pesoKg: v.pesoKg ?? '',
      arrobas: v.arrobas ?? '',
      precoPorArroba: v.precoPorArroba ?? '',
      valorTotal: v.valorTotal ?? '',
      comprador: v.comprador ?? '',
    })),
  )

  const mortesCsv = Papa.unparse(
    mortes.map((m) => ({
      numero: numeroDe(m.animalId),
      data: m.data ?? '',
      causaProvavel: m.causaProvavel ?? '',
    })),
  )

  return { animais: animaisCsv, pesagens: pesagensCsv, vendas: vendasCsv, mortes: mortesCsv }
}
