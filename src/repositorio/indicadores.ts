import { listarAnimais, listarTodasMortes, listarTodasPesagens, listarTodasVendas } from './index'
import { mapaNumerosAtuais } from './cadastroInicial'
import {
  calcularGanhoPesoDiario,
  obterUltimaPesagemValida,
  type RegistroPesagem,
} from '../dominio/ganhoPeso'
import { calcularIntervaloMedioEntrePartos } from '../dominio/intervaloPartos'
import { calcularTaxaNatalidade, type PeriodoAtividade } from '../dominio/taxaNatalidade'
import { projetarDataPesoAlvo, type ProjecaoPeso } from '../dominio/projecaoVenda'
import { contarAnosConsecutivosSemParir } from '../dominio/listaDescarte'
import { contarNascimentosPorAno, contarNascimentosPorMes } from '../dominio/distribuicaoNascimentos'
import { ordenarComNulosPorUltimo } from '../dominio/ordenacao'
import { calcularIdadeEmMeses } from '../dominio/idade'
import type { AnimalComId } from '../dominio/identificacao'
import type { Categoria } from '../db'

export interface DesempenhoMatriz {
  matrizId: number
  numero: string
  intervaloMedioEntrePartos: number | null
  totalCrias: number
  anosComParto: number[]
  anosConsecutivosSemParir: number
  diasMediosAte180kg: number | null
  arrobasProduzidasNoAno: number
  temDadosSuficientes: boolean
}

export interface BezerroProjecao {
  animalId: number
  numero: string
  categoria?: Categoria
  dataNascimento?: string
  idadeEmMeses: number | null
  pesoUltimaPesagemKg: number | null
  dataUltimaPesagem: string | null
  projecao: ProjecaoPeso | null
}

export interface MatrizComId {
  matrizId: number
  numero: string
}

export interface IndicadoresReprodutivos {
  anoAtual: number
  taxaNatalidadePorAno: { ano: number; taxa: number | null }[]
  nascimentosPorAno: { ano: number; total: number }[]
  distribuicaoNascimentosPorMes: number[]
  intervaloMedioRebanho: number | null
  totalMatrizes: number
  bezerrosProjecao: BezerroProjecao[]
  rankingVelocidade: DesempenhoMatriz[]
  rankingArrobas: DesempenhoMatriz[]
  desempenhoMatrizes: DesempenhoMatriz[]
  matrizesFalharamEsteAno: MatrizComId[]
}

function ano(data: string): number {
  return Number(data.slice(0, 4))
}

function ehMatriz(animal: AnimalComId): boolean {
  return animal.categoria === 'vaca' || animal.categoria === 'novilha'
}

export async function obterIndicadoresReprodutivos(
  anoReferencia: number = new Date().getFullYear(),
): Promise<IndicadoresReprodutivos> {
  const [animais, pesagens, vendas, mortes, numeros] = await Promise.all([
    listarAnimais(),
    listarTodasPesagens(),
    listarTodasVendas(),
    listarTodasMortes(),
    mapaNumerosAtuais(),
  ])

  const pesagensPorAnimal = new Map<number, RegistroPesagem[]>()
  for (const p of pesagens) {
    const lista = pesagensPorAnimal.get(p.animalId) ?? []
    lista.push({ data: p.data, pesoKg: p.pesoKg })
    pesagensPorAnimal.set(p.animalId, lista)
  }

  const vendasPorAnimal = new Map<number, typeof vendas>()
  for (const v of vendas) {
    const lista = vendasPorAnimal.get(v.animalId) ?? []
    lista.push(v)
    vendasPorAnimal.set(v.animalId, lista)
  }

  const dataSaidaPorAnimal = new Map<number, string>()
  for (const v of vendas) {
    if (v.data) dataSaidaPorAnimal.set(v.animalId, v.data)
  }
  for (const m of mortes) {
    if (m.data) dataSaidaPorAnimal.set(m.animalId, m.data)
  }

  const ganhosValidos: number[] = []
  for (const lista of pesagensPorAnimal.values()) {
    const g = calcularGanhoPesoDiario(lista)
    if (g != null && g > 0) ganhosValidos.push(g)
  }
  const ganhoMedioRebanho =
    ganhosValidos.length > 0 ? ganhosValidos.reduce((s, g) => s + g, 0) / ganhosValidos.length : null

  const criasPorMae = new Map<number, AnimalComId[]>()
  for (const a of animais) {
    if (a.maeId == null) continue
    const lista = criasPorMae.get(a.maeId) ?? []
    lista.push(a)
    criasPorMae.set(a.maeId, lista)
  }

  const matrizes = animais.filter(ehMatriz)

  // --- Taxa de natalidade por ano -------------------------------------
  const periodosMatrizes: PeriodoAtividade[] = matrizes.map((m) => ({
    entrada: m.dataNascimento ?? (m.anoNascimentoAproximado ? `${m.anoNascimentoAproximado}-01-01` : undefined),
    saida: dataSaidaPorAnimal.get(m.id),
  }))
  const datasNascimentoCrias = animais.filter((a) => a.maeId != null).map((a) => a.dataNascimento)

  const ultimosCincoAnos = Array.from({ length: 5 }, (_, i) => anoReferencia - 4 + i)
  const taxaNatalidadePorAno = ultimosCincoAnos.map((a) => ({
    ano: a,
    taxa: calcularTaxaNatalidade(a, periodosMatrizes, datasNascimentoCrias),
  }))
  const nascimentosPorAno = contarNascimentosPorAno(datasNascimentoCrias, ultimosCincoAnos)
  const distribuicaoNascimentosPorMes = contarNascimentosPorMes(datasNascimentoCrias)

  // --- Desempenho por matriz -------------------------------------------
  function diasAte180kg(criaId: number, dataNascimento: string | undefined): number | null {
    if (!dataNascimento) return null
    const projecao = projetarDataPesoAlvo(pesagensPorAnimal.get(criaId) ?? [], ganhoMedioRebanho)
    if (!projecao) return null
    const dias = Math.round(
      (new Date(projecao.dataPrevista).getTime() - new Date(dataNascimento).getTime()) / 86_400_000,
    )
    return dias >= 0 ? dias : null
  }

  const desempenhos: DesempenhoMatriz[] = matrizes.map((matriz) => {
    const crias = criasPorMae.get(matriz.id) ?? []
    const datasParto = crias.map((c) => c.dataNascimento).filter((d): d is string => !!d)
    const anosComParto = [...new Set(datasParto.map(ano))].sort((a, b) => a - b)

    const diasPorCria = crias
      .map((c) => diasAte180kg(c.id, c.dataNascimento))
      .filter((d): d is number => d != null)
    const diasMediosAte180kg =
      diasPorCria.length > 0 ? diasPorCria.reduce((s, d) => s + d, 0) / diasPorCria.length : null

    const arrobasProduzidasNoAno = crias.reduce((soma, cria) => {
      const vendasDaCria = vendasPorAnimal.get(cria.id) ?? []
      const arrobasNoAno = vendasDaCria
        .filter((v) => v.data && ano(v.data) === anoReferencia)
        .reduce((s, v) => s + (v.arrobas ?? 0), 0)
      return soma + arrobasNoAno
    }, 0)

    return {
      matrizId: matriz.id,
      numero: numeros.get(matriz.id) ?? '',
      intervaloMedioEntrePartos: calcularIntervaloMedioEntrePartos(datasParto),
      totalCrias: crias.length,
      anosComParto,
      anosConsecutivosSemParir: contarAnosConsecutivosSemParir(anosComParto, anoReferencia),
      diasMediosAte180kg,
      arrobasProduzidasNoAno,
      temDadosSuficientes: crias.length >= 2,
    }
  })

  const intervalosValidos = desempenhos
    .map((d) => d.intervaloMedioEntrePartos)
    .filter((v): v is number => v != null)
  const intervaloMedioRebanho =
    intervalosValidos.length > 0
      ? intervalosValidos.reduce((s, v) => s + v, 0) / intervalosValidos.length
      : null

  const rankingVelocidade = ordenarComNulosPorUltimo(
    desempenhos.filter((d) => d.diasMediosAte180kg != null),
    (d) => d.diasMediosAte180kg,
    true,
  )
  const rankingArrobas = [...desempenhos].sort(
    (a, b) => b.arrobasProduzidasNoAno - a.arrobasProduzidasNoAno,
  )

  // --- Bezerros a caminho do peso de venda ------------------------------
  const bezerrosProjecaoBrutos: BezerroProjecao[] = animais
    .filter((a) => (a.categoria === 'bezerro' || a.categoria === 'bezerra') && a.situacao === 'ativo')
    .map((a) => {
      const ultimaPesagem = obterUltimaPesagemValida(pesagensPorAnimal.get(a.id) ?? [])
      return {
        animalId: a.id,
        numero: numeros.get(a.id) ?? '',
        categoria: a.categoria,
        dataNascimento: a.dataNascimento,
        idadeEmMeses: calcularIdadeEmMeses(a.dataNascimento),
        pesoUltimaPesagemKg: ultimaPesagem?.pesoKg ?? null,
        dataUltimaPesagem: ultimaPesagem?.data ?? null,
        projecao: projetarDataPesoAlvo(pesagensPorAnimal.get(a.id) ?? [], ganhoMedioRebanho),
      }
    })
  const bezerrosProjecao = ordenarComNulosPorUltimo(
    bezerrosProjecaoBrutos,
    (b) => (b.projecao ? new Date(b.projecao.dataPrevista).getTime() : null),
    true,
  )

  // --- Vacas que não pariram este ano -----------------------------------
  // Só conta vaca, não novilha — diferente da taxa de natalidade e dos
  // rankings acima, que usam o conceito mais amplo de "matriz".
  const matrizesAtivasPorId = new Map(
    matrizes
      .filter((m) => m.situacao === 'ativo' && m.categoria === 'vaca')
      .map((m) => [m.id, m]),
  )
  const matrizesFalharamEsteAno: MatrizComId[] = desempenhos
    .filter((d) => matrizesAtivasPorId.has(d.matrizId) && !d.anosComParto.includes(anoReferencia))
    .map((d) => ({ matrizId: d.matrizId, numero: d.numero }))

  return {
    anoAtual: anoReferencia,
    taxaNatalidadePorAno,
    nascimentosPorAno,
    distribuicaoNascimentosPorMes,
    intervaloMedioRebanho,
    totalMatrizes: matrizes.length,
    bezerrosProjecao,
    rankingVelocidade,
    rankingArrobas,
    desempenhoMatrizes: desempenhos,
    matrizesFalharamEsteAno,
  }
}
