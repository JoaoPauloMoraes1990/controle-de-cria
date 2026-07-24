import type { Animal, Identificacao } from '../db'

export interface AnimalComId extends Animal {
  id: number
}

export interface ResultadoBusca {
  animal: AnimalComId
  identificacaoCorrespondente: Identificacao
  identificacoes: Identificacao[]
}

/**
 * Busca animais por um número (tatuagem ou número próprio), aceitando tanto
 * a identificação atual quanto uma antiga. Como a tatuagem se repete entre
 * irmãs do mesmo ventre, mais de um animal pode corresponder ao mesmo
 * número — quem chama esta função decide como desambiguar (normalmente pelo
 * ano de nascimento, presente em `animal.dataNascimento`).
 */
export function buscarAnimaisPorNumero(
  termo: string,
  animais: AnimalComId[],
  identificacoes: Identificacao[],
): ResultadoBusca[] {
  const termoNormalizado = termo.trim()
  if (!termoNormalizado) return []

  const animaisPorId = new Map(animais.map((a) => [a.id, a]))
  const identificacoesPorAnimal = new Map<number, Identificacao[]>()
  for (const ident of identificacoes) {
    const lista = identificacoesPorAnimal.get(ident.animalId) ?? []
    lista.push(ident)
    identificacoesPorAnimal.set(ident.animalId, lista)
  }

  const correspondencias = identificacoes.filter(
    (i) => i.numero.trim() === termoNormalizado,
  )

  const animalIdsJaAdicionados = new Set<number>()
  const resultados: ResultadoBusca[] = []

  for (const correspondencia of correspondencias) {
    if (animalIdsJaAdicionados.has(correspondencia.animalId)) continue
    const animal = animaisPorId.get(correspondencia.animalId)
    if (!animal) continue

    animalIdsJaAdicionados.add(correspondencia.animalId)
    resultados.push({
      animal,
      identificacaoCorrespondente: correspondencia,
      identificacoes: (identificacoesPorAnimal.get(animal.id) ?? []).sort(
        (a, b) => (a.dataInicio ?? '').localeCompare(b.dataInicio ?? ''),
      ),
    })
  }

  resultados.sort((a, b) =>
    (b.identificacaoCorrespondente.dataInicio ?? '').localeCompare(
      a.identificacaoCorrespondente.dataInicio ?? '',
    ),
  )

  return resultados
}
