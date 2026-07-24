interface CampoNumeroProps {
  rotulo: string
  valor: number | undefined
  aoAlterar: (valor: number | undefined) => void
  sufixo?: string
  autoFoco?: boolean
}

export function CampoNumero({ rotulo, valor, aoAlterar, sufixo, autoFoco }: CampoNumeroProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-lg font-medium text-texto">{rotulo}</span>
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={valor ?? ''}
          onChange={(e) => {
            const texto = e.target.value
            aoAlterar(texto === '' ? undefined : Number(texto))
          }}
          autoFocus={autoFoco}
          className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-4 text-xl text-texto focus:border-verde focus:outline-none"
        />
        {sufixo && <span className="text-lg text-texto-suave">{sufixo}</span>}
      </div>
    </label>
  )
}
