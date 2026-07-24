import Dexie, { type Table } from 'dexie'

export type Sexo = 'M' | 'F'

export type Categoria = 'bezerro' | 'bezerra' | 'novilha' | 'vaca' | 'touro'

export type Situacao = 'ativo' | 'vendido' | 'morto' | 'descartado'

export type TipoIdentificacao = 'tatuagem' | 'numero_proprio'

export interface Animal {
  id?: number
  sexo?: Sexo
  categoria?: Categoria
  situacao: Situacao
  dataNascimento?: string
  anoNascimentoAproximado?: number
  maeId?: number
  observacoes?: string
  origem?: 'lancamento' | 'cadastro_inicial'
  criadoEm: number
  atualizadoEm: number
}

export interface Identificacao {
  id?: number
  animalId: number
  numero: string
  tipo: TipoIdentificacao
  dataInicio?: string
  ativa: boolean
  criadoEm: number
}

export interface Pesagem {
  id?: number
  animalId: number
  data?: string
  pesoKg?: number
  observacoes?: string
  criadoEm: number
}

export interface Venda {
  id?: number
  loteId?: string
  animalId: number
  data?: string
  pesoKg?: number
  arrobas?: number
  precoPorArroba?: number
  valorTotal?: number
  comprador?: string
  observacoes?: string
  criadoEm: number
}

export interface Morte {
  id?: number
  animalId: number
  data?: string
  causaProvavel?: string
  observacoes?: string
  criadoEm: number
}

export interface MudancaCategoria {
  id?: number
  animalId: number
  categoriaAnterior?: Categoria
  categoriaNova: Categoria
  data?: string
  criadoEm: number
}

export type CategoriaDespesa =
  | 'sanidade'
  | 'nutricao'
  | 'reproducao'
  | 'mao_de_obra'
  | 'pasto'
  | 'cercas_e_benfeitorias'
  | 'maquinas'
  | 'administrativo'
  | 'nao_pecuaria'
  | 'outros'

export type ComportamentoDespesa = 'custeio' | 'estrutura' | 'investimento'

export interface ItemDespesa {
  id?: number
  nome: string
  categoria: CategoriaDespesa
  comportamento: ComportamentoDespesa
  prazoDiluicaoAnos?: number
  criadoEm: number
  atualizadoEm: number
}

export interface Despesa {
  id?: number
  itemDespesaId?: number
  nome: string
  categoria: CategoriaDespesa
  comportamento: ComportamentoDespesa
  data?: string
  valor?: number
  prazoDiluicaoAnos?: number
  observacoes?: string
  criadoEm: number
  atualizadoEm: number
}

export interface UltimaAcao {
  id?: number
  tipo: string
  payload: string
  descricao: string
  timestamp: number
}

export interface Configuracoes {
  id?: number
  ultimoBackupEm?: number
  valorReferenciaNovilhaPorCabeca?: number
  prazoDiluicaoPadraoAnos?: number
  cadastroInicialEncerrado?: boolean
}

class ControleDeCriaDB extends Dexie {
  animais!: Table<Animal, number>
  identificacoes!: Table<Identificacao, number>
  pesagens!: Table<Pesagem, number>
  vendas!: Table<Venda, number>
  mortes!: Table<Morte, number>
  mudancasCategoria!: Table<MudancaCategoria, number>
  ultimaAcao!: Table<UltimaAcao, number>
  configuracoes!: Table<Configuracoes, number>
  itensDespesa!: Table<ItemDespesa, number>
  despesas!: Table<Despesa, number>

  constructor() {
    super('controle-de-cria')

    this.version(1).stores({
      animais: '++id, categoria, situacao, maeId, dataNascimento, origem',
      identificacoes: '++id, animalId, numero, ativa',
      pesagens: '++id, animalId, data',
      vendas: '++id, animalId, data, loteId',
      mortes: '++id, animalId, data',
      mudancasCategoria: '++id, animalId, data',
      ultimaAcao: '++id',
      configuracoes: '++id',
      itensDespesa: '++id, nome',
      despesas: '++id, itemDespesaId, categoria, data',
    })
  }
}

export const db = new ControleDeCriaDB()
