import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variante?: 'primario' | 'secundario' | 'atencao' | 'neutro'
}

const estilosPorVariante: Record<string, string> = {
  primario: 'bg-marrom text-white active:bg-marrom-escuro',
  secundario: 'bg-white text-marrom border-2 border-marrom active:bg-marrom-claro',
  atencao: 'bg-atencao text-white active:opacity-90',
  neutro: 'bg-marrom-claro text-texto active:opacity-90',
}

export function Botao({
  children,
  variante = 'primario',
  className = '',
  ...props
}: BotaoProps) {
  return (
    <button
      type="button"
      className={`min-h-16 w-full rounded-2xl px-6 py-4 text-center text-xl font-semibold transition-colors disabled:opacity-40 ${estilosPorVariante[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
