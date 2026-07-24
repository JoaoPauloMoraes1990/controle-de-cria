export function Pendencias({ itens }: { itens: string[] }) {
  if (itens.length === 0) return null
  return (
    <p className="text-base text-atencao">
      Falta preencher: {itens.join(', ')}. Pode salvar assim mesmo e completar depois.
    </p>
  )
}
