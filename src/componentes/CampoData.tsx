interface CampoDataProps {
  rotulo: string
  valor: string | undefined
  aoAlterar: (valor: string | undefined) => void
}

export function CampoData({ rotulo, valor, aoAlterar }: CampoDataProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-lg font-medium text-texto">{rotulo}</span>
      <input
        type="date"
        value={valor ?? ''}
        onChange={(e) => aoAlterar(e.target.value === '' ? undefined : e.target.value)}
        className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-4 text-xl text-texto focus:border-verde focus:outline-none"
      />
    </label>
  )
}
