import type { CategoriaDespesa, ComportamentoDespesa } from '../db'

export const ROTULO_CATEGORIA_DESPESA: Record<CategoriaDespesa, string> = {
  sanidade: 'Sanidade',
  nutricao: 'Nutrição',
  reproducao: 'Reprodução',
  mao_de_obra: 'Mão de obra',
  pasto: 'Pasto',
  cercas_e_benfeitorias: 'Cercas e benfeitorias',
  maquinas: 'Máquinas',
  administrativo: 'Administrativo',
  nao_pecuaria: 'Não pecuária',
  outros: 'Outros',
}

export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  'sanidade',
  'nutricao',
  'reproducao',
  'mao_de_obra',
  'pasto',
  'cercas_e_benfeitorias',
  'maquinas',
  'administrativo',
  'nao_pecuaria',
  'outros',
]

export const ROTULO_COMPORTAMENTO_DESPESA: Record<ComportamentoDespesa, string> = {
  custeio: 'Custeio',
  estrutura: 'Estrutura',
  investimento: 'Investimento',
}

export const COMPORTAMENTOS_DESPESA: ComportamentoDespesa[] = ['custeio', 'estrutura', 'investimento']

export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  })
}
