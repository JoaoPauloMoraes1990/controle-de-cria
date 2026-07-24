import { useEffect, useState } from 'react'
import { BlocoMatriz } from './BlocoMatriz'
import { BlocoNovaMatriz } from './BlocoNovaMatriz'
import {
  cadastroInicialEstaEncerrado,
  encerrarCadastroInicial,
  reabrirCadastroInicial,
  listarCriasDaMatriz,
  listarMatrizesIniciais,
  mapaNumerosAtuais,
} from '../../repositorio/cadastroInicial'
import type { AnimalComId } from '../../dominio/identificacao'
import { MarcaDaguaLogo } from '../../componentes/MarcaDaguaLogo'

interface MatrizComCrias {
  matriz: AnimalComId & { numero: string }
  crias: (AnimalComId & { numero?: string })[]
}

export function CadastroInicial() {
  const [carregando, setCarregando] = useState(true)
  const [encerrado, setEncerrado] = useState(false)
  const [blocos, setBlocos] = useState<MatrizComCrias[]>([])
  const [idRecemCriada, setIdRecemCriada] = useState<number | null>(null)

  async function carregar() {
    const [encerradoAtual, matrizes, numeros] = await Promise.all([
      cadastroInicialEstaEncerrado(),
      listarMatrizesIniciais(),
      mapaNumerosAtuais(),
    ])
    setEncerrado(encerradoAtual)

    const comCrias = await Promise.all(
      matrizes.map(async (matriz) => {
        const crias = await listarCriasDaMatriz(matriz.id)
        return {
          matriz: { ...matriz, numero: numeros.get(matriz.id) ?? '' },
          crias: crias.map((c) => ({ ...c, numero: numeros.get(c.id) })),
        }
      }),
    )

    setBlocos(comCrias)
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function aoNovaMatrizCriada(id: number) {
    setIdRecemCriada(id)
    await carregar()
  }

  const totalCrias = blocos.reduce((soma, b) => soma + b.crias.length, 0)

  if (carregando) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-lg text-texto-suave">Carregando…</p>
      </div>
    )
  }

  if (encerrado) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <MarcaDaguaLogo />
        <h1 className="mb-2 text-2xl font-bold text-texto">Cadastro inicial</h1>
        <p className="mb-6 text-lg text-texto-suave">
          Essa área foi encerrada. Os registros de {blocos.length}{' '}
          {blocos.length === 1 ? 'matriz' : 'matrizes'} e {totalCrias}{' '}
          {totalCrias === 1 ? 'cria' : 'crias'} continuam guardados normalmente no aplicativo.
        </p>
        <button
          type="button"
          onClick={async () => {
            await reabrirCadastroInicial()
            carregar()
          }}
          className="rounded-2xl border-2 border-verde bg-white px-6 py-3 text-lg font-semibold text-verde"
        >
          Reabrir cadastro inicial
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
      <MarcaDaguaLogo />
      <h1 className="mb-1 text-2xl font-bold text-texto">Cadastro inicial</h1>
      <p className="mb-6 text-lg text-texto-suave">
        Lance aqui as matrizes e as crias que elas já tiveram, olhando a planilha antiga do lado.
        Cada campo salva sozinho. Tab passa para o próximo campo, Enter cria a próxima linha de
        cria.
      </p>

      <p className="mb-4 text-lg font-medium text-verde-escuro">
        {blocos.length} {blocos.length === 1 ? 'matriz lançada' : 'matrizes lançadas'} ·{' '}
        {totalCrias} {totalCrias === 1 ? 'cria lançada' : 'crias lançadas'}
      </p>

      <div className="flex flex-col gap-4">
        {blocos.map(({ matriz, crias }) => (
          <BlocoMatriz
            key={matriz.id}
            matriz={matriz}
            crias={crias}
            focarAoMontar={matriz.id === idRecemCriada}
            aoRemovida={carregar}
            aoContagemMudar={carregar}
          />
        ))}

        <BlocoNovaMatriz aoCriada={aoNovaMatrizCriada} />
      </div>

      <button
        type="button"
        onClick={async () => {
          await encerrarCadastroInicial()
          carregar()
        }}
        className="mt-8 text-base text-texto-suave underline"
      >
        Encerrar cadastro inicial
      </button>
    </div>
  )
}
