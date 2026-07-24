import { listarAnimais, listarTodasMortes, listarTodasVendas } from './index'
import { listarDespesas } from './financeiro'
import { estavaAtivaNoAno, type PeriodoAtividade } from '../dominio/taxaNatalidade'
import {
  calcularCustoPorArroba,
  calcularCustoPorBezerroVendido,
  calcularCustoPorMatriz,
  calcularParticipacaoPorCategoria,
  calcularPrecoMedioRecebidoPorArroba,
  type ParticipacaoCategoria,
} from '../dominio/economico'

export interface IndicadoresEconomicos {
  anoAtual: number
  despesaPecuariaTotal: number
  despesaNaoPecuariaTotal: number
  custoPorMatriz: number | null
  custoPorBezerroVendido: number | null
  custoPorArroba: number | null
  precoMedioRecebidoPorArroba: number | null
  participacaoPorCategoria: ParticipacaoCategoria[]
  percentualOutros: number
  avisoOutrosAlto: boolean
  totalBezerrosVendidos: number
  totalArrobasVendidas: number
  totalMatrizesAtivas: number
}

function ano(data: string): number {
  return Number(data.slice(0, 4))
}

const LIMITE_AVISO_OUTROS_PCT = 10

export async function obterIndicadoresEconomicos(
  anoReferencia: number = new Date().getFullYear(),
): Promise<IndicadoresEconomicos> {
  const [animais, vendas, mortes, despesasTodas] = await Promise.all([
    listarAnimais(),
    listarTodasVendas(),
    listarTodasMortes(),
    listarDespesas(),
  ])

  const despesasDoAno = despesasTodas.filter((d) => d.data && ano(d.data) === anoReferencia)

  const despesaPecuariaTotal = despesasDoAno
    .filter((d) => d.categoria !== 'nao_pecuaria')
    .reduce((soma, d) => soma + (d.valor ?? 0), 0)
  const despesaNaoPecuariaTotal = despesasDoAno
    .filter((d) => d.categoria === 'nao_pecuaria')
    .reduce((soma, d) => soma + (d.valor ?? 0), 0)

  const valoresPorCategoria: Record<string, number> = {}
  for (const d of despesasDoAno) {
    if (d.categoria === 'nao_pecuaria') continue
    valoresPorCategoria[d.categoria] = (valoresPorCategoria[d.categoria] ?? 0) + (d.valor ?? 0)
  }
  const participacaoPorCategoria = calcularParticipacaoPorCategoria(
    valoresPorCategoria,
    despesaPecuariaTotal,
  )
  const percentualOutros =
    participacaoPorCategoria.find((p) => p.categoria === 'outros')?.percentual ?? 0

  const animaisPorId = new Map(animais.map((a) => [a.id, a]))
  const vendasDoAno = vendas.filter((v) => v.data && ano(v.data) === anoReferencia)
  const vendasDeCrias = vendasDoAno.filter((v) => animaisPorId.get(v.animalId)?.maeId != null)
  const totalBezerrosVendidos = vendasDeCrias.length
  const totalArrobasVendidas = vendasDoAno.reduce((soma, v) => soma + (v.arrobas ?? 0), 0)
  const valorTotalRecebido = vendasDoAno.reduce((soma, v) => soma + (v.valorTotal ?? 0), 0)

  const dataSaidaPorAnimal = new Map<number, string>()
  for (const v of vendas) if (v.data) dataSaidaPorAnimal.set(v.animalId, v.data)
  for (const m of mortes) if (m.data) dataSaidaPorAnimal.set(m.animalId, m.data)

  const matrizes = animais.filter((a) => a.categoria === 'vaca' || a.categoria === 'novilha')
  const periodosMatrizes: PeriodoAtividade[] = matrizes.map((m) => ({
    entrada: m.dataNascimento ?? (m.anoNascimentoAproximado ? `${m.anoNascimentoAproximado}-01-01` : undefined),
    saida: dataSaidaPorAnimal.get(m.id),
  }))
  const totalMatrizesAtivas = periodosMatrizes.filter((p) => estavaAtivaNoAno(p, anoReferencia)).length

  return {
    anoAtual: anoReferencia,
    despesaPecuariaTotal,
    despesaNaoPecuariaTotal,
    custoPorMatriz: calcularCustoPorMatriz(despesaPecuariaTotal, totalMatrizesAtivas),
    custoPorBezerroVendido: calcularCustoPorBezerroVendido(despesaPecuariaTotal, totalBezerrosVendidos),
    custoPorArroba: calcularCustoPorArroba(despesaPecuariaTotal, totalArrobasVendidas),
    precoMedioRecebidoPorArroba: calcularPrecoMedioRecebidoPorArroba(
      valorTotalRecebido,
      totalArrobasVendidas,
    ),
    participacaoPorCategoria,
    percentualOutros,
    avisoOutrosAlto: percentualOutros > LIMITE_AVISO_OUTROS_PCT,
    totalBezerrosVendidos,
    totalArrobasVendidas,
    totalMatrizesAtivas,
  }
}
