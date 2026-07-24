const KG_POR_ARROBA = 30

export function kgParaArroba(pesoKg: number): number {
  return pesoKg / KG_POR_ARROBA
}

export function arrobaParaKg(arrobas: number): number {
  return arrobas * KG_POR_ARROBA
}
