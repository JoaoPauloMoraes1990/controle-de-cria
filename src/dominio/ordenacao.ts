/**
 * Ordena uma lista por um valor numérico, sempre deixando os itens sem
 * valor (sem dados suficientes) por último — nunca misturados como se
 * fossem zero.
 */
export function ordenarComNulosPorUltimo<T>(
  itens: T[],
  obterValor: (item: T) => number | null,
  crescente: boolean = true,
): T[] {
  return [...itens].sort((a, b) => {
    const valorA = obterValor(a)
    const valorB = obterValor(b)
    if (valorA == null && valorB == null) return 0
    if (valorA == null) return 1
    if (valorB == null) return -1
    return crescente ? valorA - valorB : valorB - valorA
  })
}
