import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buscarPorNumero } from '../repositorio'
import type { ResultadoBusca } from '../dominio/identificacao'

export function BuscaInicial() {
  const navigate = useNavigate()
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [jaBuscou, setJaBuscou] = useState(false)

  async function aoDigitar(valor: string) {
    setTermo(valor)
    if (!valor.trim()) {
      setResultados([])
      setJaBuscou(false)
      return
    }
    const encontrados = await buscarPorNumero(valor)
    setResultados(encontrados)
    setJaBuscou(true)
  }

  return (
    <div className="mb-6">
      <input
        type="text"
        inputMode="numeric"
        value={termo}
        onChange={(e) => aoDigitar(e.target.value)}
        placeholder="Buscar animal pelo número"
        className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-4 text-xl text-texto focus:border-verde focus:outline-none"
      />

      {resultados.length > 0 && (
        <ul className="mt-2 divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-white">
          {resultados.map((r) => (
            <li key={r.animal.id}>
              <button
                type="button"
                onClick={() => navigate(`/animais/${r.animal.id}`)}
                className="w-full px-4 py-3 text-left text-lg hover:bg-verde-claro"
              >
                <span className="font-semibold">{r.identificacaoCorrespondente.numero}</span>
                {r.animal.categoria && <span className="text-texto-suave"> · {r.animal.categoria}</span>}
                {r.animal.dataNascimento && (
                  <span className="text-texto-suave"> · nascido em {r.animal.dataNascimento}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {jaBuscou && resultados.length === 0 && (
        <div className="mt-2 rounded-xl border border-borda bg-white p-4">
          <p className="text-lg text-texto-suave">Nenhum animal com o número "{termo.trim()}".</p>
          <button
            type="button"
            onClick={() => navigate(`/animais/novo?numero=${encodeURIComponent(termo.trim())}`)}
            className="mt-3 text-lg font-semibold text-verde underline"
          >
            Cadastrar animal {termo.trim()}
          </button>
        </div>
      )}
    </div>
  )
}
