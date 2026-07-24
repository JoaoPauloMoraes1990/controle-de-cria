import { db } from '../db'
import type { CategoriaDespesa, ComportamentoDespesa, Despesa, ItemDespesa } from '../db'

function agora(): number {
  return Date.now()
}

// ---------------------------------------------------------------------------
// Itens de despesa (classificação reaproveitável)
// ---------------------------------------------------------------------------

export async function listarItensDespesa(): Promise<ItemDespesa[]> {
  const itens = await db.itensDespesa.toArray()
  return itens.sort((a, b) => a.nome.localeCompare(b.nome))
}

export async function buscarItensDespesaPorNome(termo: string): Promise<ItemDespesa[]> {
  const termoNormalizado = termo.trim().toLowerCase()
  if (!termoNormalizado) return []
  const itens = await db.itensDespesa.toArray()
  return itens.filter((i) => i.nome.toLowerCase().includes(termoNormalizado))
}

async function obterItemDespesaPorNomeExato(nome: string): Promise<ItemDespesa | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase()
  const itens = await db.itensDespesa.toArray()
  return itens.find((i) => i.nome.trim().toLowerCase() === nomeNormalizado)
}

export interface DadosItemDespesa {
  nome: string
  categoria: CategoriaDespesa
  comportamento: ComportamentoDespesa
  prazoDiluicaoAnos?: number
}

export async function criarItemDespesa(dados: DadosItemDespesa): Promise<number> {
  const timestamp = agora()
  return db.itensDespesa.add({
    nome: dados.nome.trim(),
    categoria: dados.categoria,
    comportamento: dados.comportamento,
    prazoDiluicaoAnos: dados.prazoDiluicaoAnos,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  })
}

export async function atualizarItemDespesa(
  id: number,
  dados: Partial<DadosItemDespesa>,
): Promise<void> {
  await db.itensDespesa.update(id, { ...dados, atualizadoEm: agora() })
}

export async function removerItemDespesa(id: number): Promise<void> {
  await db.itensDespesa.delete(id)
}

// ---------------------------------------------------------------------------
// Despesas lançadas
// ---------------------------------------------------------------------------

export interface DadosDespesa {
  nome: string
  categoria: CategoriaDespesa
  comportamento: ComportamentoDespesa
  data?: string
  valor?: number
  prazoDiluicaoAnos?: number
  observacoes?: string
}

/**
 * Lança uma despesa. Se ainda não existir um item com esse nome, ele é
 * criado automaticamente com a classificação escolhida agora, para já
 * vir pronto da próxima vez — é a "tabela editável reaplicada
 * automaticamente" que o PRD pede, sem precisar de uma etapa separada de
 * cadastro antes de lançar.
 */
export async function registrarDespesa(dados: DadosDespesa): Promise<number> {
  return db.transaction('rw', db.itensDespesa, db.despesas, async () => {
    const timestamp = agora()
    let item = await obterItemDespesaPorNomeExato(dados.nome)

    if (!item) {
      const itemId = await criarItemDespesa({
        nome: dados.nome,
        categoria: dados.categoria,
        comportamento: dados.comportamento,
        prazoDiluicaoAnos: dados.prazoDiluicaoAnos,
      })
      item = await db.itensDespesa.get(itemId)
    }

    return db.despesas.add({
      itemDespesaId: item?.id,
      nome: dados.nome.trim(),
      categoria: dados.categoria,
      comportamento: dados.comportamento,
      data: dados.data,
      valor: dados.valor,
      prazoDiluicaoAnos: dados.prazoDiluicaoAnos,
      observacoes: dados.observacoes,
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    })
  })
}

export async function atualizarDespesa(id: number, dados: Partial<DadosDespesa>): Promise<void> {
  await db.despesas.update(id, { ...dados, atualizadoEm: agora() })
}

export async function removerDespesa(id: number): Promise<void> {
  await db.despesas.delete(id)
}

export async function listarDespesas(): Promise<Despesa[]> {
  const despesas = await db.despesas.toArray()
  return despesas.sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''))
}

// ---------------------------------------------------------------------------
// Importação em massa (ex.: histórico vindo de planilha)
// ---------------------------------------------------------------------------

export interface LinhaImportacaoDespesa {
  nome: string
  categoria: CategoriaDespesa
  comportamento: ComportamentoDespesa
  data?: string
  valor?: number
}

export interface ResultadoImportacaoDespesas {
  totalLinhas: number
  itensCriados: number
  valorTotal: number
}

/**
 * Importa várias despesas de uma vez (ex.: histórico de anos anteriores).
 * Reaproveita um item já existente pelo nome (sem diferenciar maiúsculas);
 * quando o nome ainda não existe, cria o item com a classificação daquela
 * linha.
 */
export async function importarDespesasEmMassa(
  linhas: LinhaImportacaoDespesa[],
): Promise<ResultadoImportacaoDespesas> {
  return db.transaction('rw', db.itensDespesa, db.despesas, async () => {
    const timestamp = agora()
    const itensExistentes = await db.itensDespesa.toArray()
    const itemPorNome = new Map(itensExistentes.map((i) => [i.nome.trim().toLowerCase(), i]))
    let itensCriados = 0
    let valorTotal = 0

    for (const linha of linhas) {
      const chave = linha.nome.trim().toLowerCase()
      let item = itemPorNome.get(chave)

      if (!item) {
        const itemId = await db.itensDespesa.add({
          nome: linha.nome.trim(),
          categoria: linha.categoria,
          comportamento: linha.comportamento,
          criadoEm: timestamp,
          atualizadoEm: timestamp,
        })
        item = {
          id: itemId,
          nome: linha.nome.trim(),
          categoria: linha.categoria,
          comportamento: linha.comportamento,
          criadoEm: timestamp,
          atualizadoEm: timestamp,
        }
        itemPorNome.set(chave, item)
        itensCriados++
      }

      await db.despesas.add({
        itemDespesaId: item.id,
        nome: linha.nome.trim(),
        categoria: linha.categoria,
        comportamento: linha.comportamento,
        data: linha.data,
        valor: linha.valor,
        criadoEm: timestamp,
        atualizadoEm: timestamp,
      })
      valorTotal += linha.valor ?? 0
    }

    return { totalLinhas: linhas.length, itensCriados, valorTotal }
  })
}
