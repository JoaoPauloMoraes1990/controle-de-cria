import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { desfazerUltimoLancamento } from '../repositorio'

interface EstadoConfirmacao {
  mensagem: string
  podeDesfazer: boolean
}

interface ConfirmacaoContextoValor {
  mostrar: (mensagem: string, opcoes?: { podeDesfazer?: boolean }) => void
}

const ConfirmacaoContexto = createContext<ConfirmacaoContextoValor | null>(null)

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoConfirmacao | null>(null)
  const [desfeito, setDesfeito] = useState(false)

  const mostrar = useCallback((mensagem: string, opcoes?: { podeDesfazer?: boolean }) => {
    setDesfeito(false)
    setEstado({ mensagem, podeDesfazer: opcoes?.podeDesfazer ?? false })
    window.setTimeout(() => {
      setEstado((atual) => (atual?.mensagem === mensagem ? null : atual))
    }, 6000)
  }, [])

  async function aoDesfazer() {
    await desfazerUltimoLancamento()
    setDesfeito(true)
    window.setTimeout(() => setEstado(null), 1500)
  }

  return (
    <ConfirmacaoContexto.Provider value={{ mostrar }}>
      {children}
      {estado && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl bg-marrom-escuro px-5 py-4 text-white shadow-lg">
          <span className="text-lg font-medium">{desfeito ? 'Desfeito.' : estado.mensagem}</span>
          {estado.podeDesfazer && !desfeito && (
            <button type="button" onClick={aoDesfazer} className="shrink-0 text-lg font-bold underline">
              Desfazer
            </button>
          )}
        </div>
      )}
    </ConfirmacaoContexto.Provider>
  )
}

export function useConfirmacao() {
  const contexto = useContext(ConfirmacaoContexto)
  if (!contexto) throw new Error('useConfirmacao precisa estar dentro de ConfirmacaoProvider')
  return contexto
}
