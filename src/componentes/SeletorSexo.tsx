interface SeletorSexoProps {
  valor: 'M' | 'F' | undefined
  aoAlterar: (valor: 'M' | 'F') => void
}

export function SeletorSexo({ valor, aoAlterar }: SeletorSexoProps) {
  return (
    <div>
      <span className="mb-1 block text-lg font-medium text-texto">Sexo</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => aoAlterar('F')}
          className={`min-h-14 flex-1 rounded-xl border-2 text-xl font-semibold ${
            valor === 'F'
              ? 'border-verde bg-verde-claro text-verde-escuro'
              : 'border-borda bg-white text-texto'
          }`}
        >
          Fêmea
        </button>
        <button
          type="button"
          onClick={() => aoAlterar('M')}
          className={`min-h-14 flex-1 rounded-xl border-2 text-xl font-semibold ${
            valor === 'M'
              ? 'border-verde bg-verde-claro text-verde-escuro'
              : 'border-borda bg-white text-texto'
          }`}
        >
          Macho
        </button>
      </div>
    </div>
  )
}
