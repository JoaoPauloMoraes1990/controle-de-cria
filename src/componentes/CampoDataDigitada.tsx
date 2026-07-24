import { useEffect, useState, type KeyboardEvent } from 'react'

interface CampoDataDigitadaProps {
  valor: string | undefined
  aoAlterar: (valorIso: string | undefined) => void
  aoConfirmar?: () => void
  rotulo?: string
  autoFoco?: boolean
}

function isoParaDigitos(iso: string | undefined): string {
  if (!iso) return ''
  const [aaaa, mm, dd] = iso.split('-')
  if (!aaaa || !mm || !dd) return ''
  return `${dd}${mm}${aaaa}`
}

function digitosParaIso(digitos: string): string | undefined {
  if (digitos.length !== 8) return undefined
  const dd = digitos.slice(0, 2)
  const mm = digitos.slice(2, 4)
  const aaaa = digitos.slice(4, 8)
  return `${aaaa}-${mm}-${dd}`
}

function formatarExibicao(digitos: string): string {
  const dd = digitos.slice(0, 2)
  const mm = digitos.slice(2, 4)
  const aaaa = digitos.slice(4, 8)
  return [dd, mm, aaaa].filter(Boolean).join('/')
}

/**
 * Campo de data feito para digitação corrida (ddmmaaaa), sem seletor de
 * calendário — pensado para a tela de cadastro inicial, onde a velocidade
 * de digitar mais de cem registros importa mais do que a validação da data.
 */
export function CampoDataDigitada({
  valor,
  aoAlterar,
  aoConfirmar,
  rotulo,
  autoFoco,
}: CampoDataDigitadaProps) {
  const [digitos, setDigitos] = useState(() => isoParaDigitos(valor))

  useEffect(() => {
    setDigitos(isoParaDigitos(valor))
  }, [valor])

  function aoDigitar(texto: string) {
    const novosDigitos = texto.replace(/\D/g, '').slice(0, 8)
    setDigitos(novosDigitos)
    aoAlterar(digitosParaIso(novosDigitos))
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      aoConfirmar?.()
    }
  }

  const campo = (
    <input
      type="text"
      inputMode="numeric"
      placeholder="ddmmaaaa"
      value={formatarExibicao(digitos)}
      onChange={(e) => aoDigitar(e.target.value)}
      onKeyDown={aoTeclar}
      autoFocus={autoFoco}
      className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-3 text-lg text-texto focus:border-verde focus:outline-none"
    />
  )

  if (!rotulo) return campo

  return (
    <label className="block">
      <span className="mb-1 block text-lg font-medium text-texto">{rotulo}</span>
      {campo}
    </label>
  )
}
