import { forwardRef, type KeyboardEvent } from 'react'

interface SeletorSexoTecladoProps {
  valor: 'M' | 'F' | undefined
  aoAlterar: (valor: 'M' | 'F') => void
  aoConfirmar?: () => void
}

/**
 * Campo de sexo para a tela de cadastro inicial: em vez de dois botões
 * grandes (como no resto do app), aqui é uma única célula que alterna com
 * as teclas F e M, para não atrapalhar a digitação corrida em sequência.
 */
export const SeletorSexoTeclado = forwardRef<HTMLDivElement, SeletorSexoTecladoProps>(
  function SeletorSexoTeclado({ valor, aoAlterar, aoConfirmar }, ref) {
    function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        aoAlterar('F')
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        aoAlterar('M')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        aoConfirmar?.()
      }
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Sexo — aperte F ou M"
        tabIndex={0}
        onKeyDown={aoTeclar}
        className="flex min-h-14 w-24 shrink-0 cursor-default items-center justify-center rounded-xl border-2 border-borda bg-white text-lg font-semibold text-texto focus:border-verde focus:outline-none"
      >
        {valor === 'F' ? 'Fêmea' : valor === 'M' ? 'Macho' : 'F / M'}
      </div>
    )
  },
)
