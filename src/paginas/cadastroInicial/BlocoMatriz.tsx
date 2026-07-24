import { useEffect, useRef, useState } from 'react'
import { CampoDataDigitada } from '../../componentes/CampoDataDigitada'
import { SeletorSexoTeclado } from '../../componentes/SeletorSexoTeclado'
import {
  atualizarCriaInicial,
  atualizarMatrizInicial,
  criarCriaInicial,
  removerCriaInicial,
  removerMatrizInicial,
} from '../../repositorio/cadastroInicial'
import { calcularIntervaloMedioEntrePartos } from '../../dominio/intervaloPartos'
import { formatarMesesEDias } from '../../utilitarios/datas'
import type { AnimalComId } from '../../dominio/identificacao'
import type { Sexo } from '../../db'

interface LinhaCriaEstado {
  chave: string
  id: number | null
  sexo?: Sexo
  data?: string
  numero: string
}

function novaChave(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`
}

function linhaVazia(): LinhaCriaEstado {
  return { chave: novaChave(), id: null, sexo: undefined, data: undefined, numero: '' }
}

interface BlocoMatrizProps {
  matriz: AnimalComId & { numero: string }
  crias: (AnimalComId & { numero?: string })[]
  focarAoMontar?: boolean
  aoRemovida: () => void
  aoContagemMudar: () => void
}

export function BlocoMatriz({
  matriz,
  crias,
  focarAoMontar,
  aoRemovida,
  aoContagemMudar,
}: BlocoMatrizProps) {
  const [numero, setNumero] = useState(matriz.numero)
  const [categoria, setCategoria] = useState<'vaca' | 'novilha'>(
    matriz.categoria === 'novilha' ? 'novilha' : 'vaca',
  )
  const [ano, setAno] = useState<string>(
    matriz.anoNascimentoAproximado != null ? String(matriz.anoNascimentoAproximado) : '',
  )

  const [linhas, setLinhas] = useState<LinhaCriaEstado[]>(() => [
    ...crias.map((c) => ({
      chave: String(c.id),
      id: c.id,
      sexo: c.sexo,
      data: c.dataNascimento,
      numero: c.numero ?? '',
    })),
    linhaVazia(),
  ])

  const refsSexo = useRef(new Map<string, HTMLDivElement | null>())

  useEffect(() => {
    if (focarAoMontar) {
      const primeiraChave = linhas[0]?.chave
      if (primeiraChave) refsSexo.current.get(primeiraChave)?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function salvarMatriz(alteracoes: {
    numero?: string
    categoria?: 'vaca' | 'novilha'
    anoNascimentoAproximado?: number
  }) {
    if (matriz.id == null) return
    await atualizarMatrizInicial(matriz.id, alteracoes)
  }

  function focarLinha(chave: string) {
    window.setTimeout(() => refsSexo.current.get(chave)?.focus(), 0)
  }

  function atualizarLinha(chave: string, alteracoes: Partial<LinhaCriaEstado>) {
    setLinhas((atual) => atual.map((l) => (l.chave === chave ? { ...l, ...alteracoes } : l)))
  }

  async function persistirLinha(chave: string) {
    const linha = linhas.find((l) => l.chave === chave)
    if (!linha) return

    const temConteudo = !!linha.sexo || !!linha.data || !!linha.numero.trim()

    if (linha.id === null) {
      if (!temConteudo) return
      const novoId = await criarCriaInicial({
        maeId: matriz.id,
        sexo: linha.sexo,
        data: linha.data,
        numero: linha.numero.trim() || undefined,
      })
      setLinhas((atual) => {
        const indice = atual.findIndex((l) => l.chave === chave)
        if (indice === -1) return atual
        const copia = [...atual]
        copia[indice] = { ...copia[indice], id: novoId }
        if (indice === copia.length - 1) copia.push(linhaVazia())
        return copia
      })
      aoContagemMudar()
    } else {
      await atualizarCriaInicial(linha.id, {
        sexo: linha.sexo,
        data: linha.data,
        numero: linha.numero.trim() || undefined,
      })
    }
  }

  async function aoConfirmarLinha(chave: string) {
    await persistirLinha(chave)
    const indice = linhas.findIndex((l) => l.chave === chave)
    const proxima = linhas[indice + 1]
    if (proxima) {
      focarLinha(proxima.chave)
    } else {
      // a linha que acabou de ser confirmada virou a nova última — a linha
      // vazia seguinte só existe depois do próximo render
      window.setTimeout(() => {
        setLinhas((atual) => {
          const ultima = atual[atual.length - 1]
          if (ultima) focarLinha(ultima.chave)
          return atual
        })
      }, 0)
    }
  }

  async function removerLinha(chave: string) {
    const linha = linhas.find((l) => l.chave === chave)
    if (!linha) return
    const eraSalva = linha.id != null
    if (linha.id != null) await removerCriaInicial(linha.id)
    setLinhas((atual) => {
      const restante = atual.filter((l) => l.chave !== chave)
      return restante.length > 0 ? restante : [linhaVazia()]
    })
    if (eraSalva) aoContagemMudar()
  }

  async function aoRemoverMatriz() {
    if (matriz.id == null) return
    await removerMatrizInicial(matriz.id)
    aoRemovida()
  }

  const criasLancadas = linhas.filter((l) => l.id !== null)
  const intervaloMedio = calcularIntervaloMedioEntrePartos(criasLancadas.map((l) => l.data))

  return (
    <div className="rounded-2xl border border-borda bg-white p-4">
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div>
          <span className="mb-1 block text-base font-medium text-texto-suave">Número</span>
          <input
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            onBlur={() => salvarMatriz({ numero })}
            className="min-h-12 w-28 rounded-xl border-2 border-borda bg-white px-3 text-xl font-bold text-marrom-escuro focus:border-verde focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(['vaca', 'novilha'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategoria(c)
                salvarMatriz({ categoria: c })
              }}
              className={`min-h-12 rounded-xl border-2 px-3 text-base font-medium ${
                categoria === c
                  ? 'border-verde bg-verde-claro text-verde-escuro'
                  : 'border-borda bg-white text-texto'
              }`}
            >
              {c === 'vaca' ? 'Vaca' : 'Novilha'}
            </button>
          ))}
        </div>

        <div>
          <span className="mb-1 block text-base font-medium text-texto-suave">Ano de nasc.</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="aaaa"
            value={ano}
            onChange={(e) => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={() =>
              salvarMatriz({ anoNascimentoAproximado: ano ? Number(ano) : undefined })
            }
            className="min-h-12 w-24 rounded-xl border-2 border-borda bg-white px-3 text-lg focus:border-verde focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={aoRemoverMatriz}
          className="ml-auto text-base text-atencao underline"
        >
          Remover matriz
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {linhas.map((linha) => (
          <div key={linha.chave} className="flex items-center gap-2">
            <SeletorSexoTeclado
              ref={(el) => {
                refsSexo.current.set(linha.chave, el)
              }}
              valor={linha.sexo}
              aoAlterar={(v) => {
                atualizarLinha(linha.chave, { sexo: v })
                window.setTimeout(() => persistirLinha(linha.chave), 0)
              }}
              aoConfirmar={() => aoConfirmarLinha(linha.chave)}
            />
            <div className="w-32">
              <CampoDataDigitada
                valor={linha.data}
                aoAlterar={(v) => atualizarLinha(linha.chave, { data: v })}
                aoConfirmar={() => aoConfirmarLinha(linha.chave)}
              />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Número, se ficou"
              value={linha.numero}
              onChange={(e) => atualizarLinha(linha.chave, { numero: e.target.value })}
              onBlur={() => persistirLinha(linha.chave)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  aoConfirmarLinha(linha.chave)
                }
              }}
              className="min-h-14 flex-1 rounded-xl border-2 border-borda bg-white px-3 text-lg focus:border-verde focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removerLinha(linha.chave)}
              className="shrink-0 text-base text-atencao underline"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-base text-texto-suave">
        {criasLancadas.length} {criasLancadas.length === 1 ? 'cria lançada' : 'crias lançadas'}
        {intervaloMedio != null
          ? ` · intervalo médio entre partos: ${formatarMesesEDias(intervaloMedio)}`
          : ' · intervalo entre partos: sem dados suficientes'}
      </p>
    </div>
  )
}
