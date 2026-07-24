import { useRef, useState, type KeyboardEvent } from 'react'
import { criarMatrizInicial } from '../../repositorio/cadastroInicial'

interface BlocoNovaMatrizProps {
  aoCriada: (id: number) => void
}

export function BlocoNovaMatriz({ aoCriada }: BlocoNovaMatrizProps) {
  const [numero, setNumero] = useState('')
  const [categoria, setCategoria] = useState<'vaca' | 'novilha'>('vaca')
  const [ano, setAno] = useState('')
  const criandoRef = useRef(false)

  async function confirmar() {
    if (!numero.trim() || criandoRef.current) return
    criandoRef.current = true
    const id = await criarMatrizInicial({
      numero,
      categoria,
      anoNascimentoAproximado: ano ? Number(ano) : undefined,
    })
    criandoRef.current = false
    setNumero('')
    setAno('')
    setCategoria('vaca')
    aoCriada(id)
  }

  function aoTeclarNumero(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirmar()
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-verde bg-verde-claro p-4">
      <p className="mb-3 text-base font-medium text-verde-escuro">Nova matriz</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <span className="mb-1 block text-base font-medium text-texto-suave">Número</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Número da matriz"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            onKeyDown={aoTeclarNumero}
            onBlur={confirmar}
            autoFocus
            className="min-h-12 w-40 rounded-xl border-2 border-borda bg-white px-3 text-xl font-bold text-marrom-escuro focus:border-verde focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(['vaca', 'novilha'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`min-h-12 rounded-xl border-2 px-3 text-base font-medium ${
                categoria === c
                  ? 'border-verde bg-white text-verde-escuro'
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
            className="min-h-12 w-24 rounded-xl border-2 border-borda bg-white px-3 text-lg focus:border-verde focus:outline-none"
          />
        </div>
      </div>
      <p className="mt-3 text-base text-verde-escuro">
        Digite o número e aperte Enter (ou saia do campo) para começar o bloco dela.
      </p>
    </div>
  )
}
