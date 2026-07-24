import { useState } from 'react'
import { buscarPorNumero } from '../repositorio'
import type { ResultadoBusca } from '../dominio/identificacao'

interface CampoBuscaAnimalProps {
  rotulo: string
  aoSelecionar: (resultado: ResultadoBusca) => void
  filtro?: (resultado: ResultadoBusca) => boolean
}

export function CampoBuscaAnimal({ rotulo, aoSelecionar, filtro }: CampoBuscaAnimalProps) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [buscando, setBuscando] = useState(false)
  const [selecionado, setSelecionado] = useState<ResultadoBusca | null>(null)

  async function aoDigitar(valor: string) {
    setTermo(valor)
    setSelecionado(null)
    if (!valor.trim()) {
      setResultados([])
      return
    }
    setBuscando(true)
    const encontrados = await buscarPorNumero(valor)
    setResultados(filtro ? encontrados.filter(filtro) : encontrados)
    setBuscando(false)
  }

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-lg font-medium text-texto">{rotulo}</span>
        <input
          type="text"
          inputMode="numeric"
          value={termo}
          onChange={(e) => aoDigitar(e.target.value)}
          placeholder="Número do animal"
          className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-4 text-xl text-texto focus:border-verde focus:outline-none"
        />
      </label>

      {selecionado && (
        <p className="mt-2 text-lg text-verde-escuro">
          Selecionado: {selecionado.identificacaoCorrespondente.numero}
        </p>
      )}

      {!selecionado && buscando && <p className="mt-2 text-texto-suave">Buscando…</p>}

      {!selecionado && resultados.length > 0 && (
        <ul className="mt-2 divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-white">
          {resultados.map((r) => (
            <li key={r.animal.id}>
              <button
                type="button"
                onClick={() => {
                  aoSelecionar(r)
                  setSelecionado(r)
                  setResultados([])
                }}
                className="w-full px-4 py-3 text-left text-lg hover:bg-verde-claro"
              >
                <span className="font-semibold">{r.identificacaoCorrespondente.numero}</span>
                {r.animal.dataNascimento && (
                  <span className="text-texto-suave"> · nascido em {r.animal.dataNascimento}</span>
                )}
                {r.animal.categoria && <span className="text-texto-suave"> · {r.animal.categoria}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!selecionado && termo.trim() && !buscando && resultados.length === 0 && (
        <p className="mt-2 text-texto-suave">Nenhum animal com esse número ainda.</p>
      )}
    </div>
  )
}
