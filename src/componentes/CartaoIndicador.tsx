interface CartaoIndicadorProps {
  titulo: string
  valor: string
  explicacao?: string
  className?: string
}

export function CartaoIndicador({ titulo, valor, explicacao, className = '' }: CartaoIndicadorProps) {
  return (
    <div className={`rounded-2xl border border-borda bg-white p-5 ${className}`}>
      <p className="text-base font-medium text-texto-suave">{titulo}</p>
      <p className="mt-1 text-4xl font-bold text-marrom-escuro">{valor}</p>
      {explicacao && <p className="mt-2 text-base text-texto-suave">{explicacao}</p>}
    </div>
  )
}
