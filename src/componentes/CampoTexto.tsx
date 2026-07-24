interface CampoTextoProps {
  rotulo: string
  valor: string
  aoAlterar: (valor: string) => void
  obrigatorio?: boolean
  placeholder?: string
  autoFoco?: boolean
  numerico?: boolean
}

export function CampoTexto({
  rotulo,
  valor,
  aoAlterar,
  obrigatorio,
  placeholder,
  autoFoco,
  numerico,
}: CampoTextoProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-lg font-medium text-texto">
        {rotulo}
        {obrigatorio && <span className="text-atencao"> *</span>}
      </span>
      <input
        type="text"
        inputMode={numerico ? 'numeric' : 'text'}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFoco}
        className="min-h-14 w-full rounded-xl border-2 border-borda bg-white px-4 text-xl text-texto focus:border-verde focus:outline-none"
      />
    </label>
  )
}
