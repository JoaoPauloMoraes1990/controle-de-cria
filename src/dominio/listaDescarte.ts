export interface CandidatoDescarte {
  matrizId: number
  intervaloMedioEntrePartos: number | null
  anosConsecutivosSemParir: number
  diasMediosAte180kg: number | null
  temDadosSuficientes: boolean
}

/**
 * Quantos anos seguidos, contando para trás a partir do ano de referência,
 * a matriz ficou sem parir. Para de contar assim que encontra um ano com
 * parto, ou quando chega no primeiro ano em que ela já pariu alguma vez.
 */
export function contarAnosConsecutivosSemParir(
  anosComParto: number[],
  anoReferencia: number,
): number {
  if (anosComParto.length === 0) return 0

  const anos = new Set(anosComParto)
  const primeiroAno = Math.min(...anosComParto)

  let falhas = 0
  for (let ano = anoReferencia; ano > primeiroAno; ano--) {
    if (anos.has(ano)) break
    falhas++
  }
  return falhas
}

/**
 * Pontuação de descarte: quanto maior, pior o desempenho da matriz. Não é
 * uma nota "oficial" — é só um jeito de ordenar candidatas usando os três
 * critérios do PRD juntos. Retorna null quando não há histórico suficiente,
 * para nunca sugerir descarte de quem "ainda não teve chance de mostrar
 * serviço".
 */
export function calcularPontuacaoDescarte(candidato: CandidatoDescarte): number | null {
  if (!candidato.temDadosSuficientes) return null

  let pontos = 0
  if (candidato.intervaloMedioEntrePartos != null) pontos += candidato.intervaloMedioEntrePartos
  if (candidato.diasMediosAte180kg != null) pontos += candidato.diasMediosAte180kg
  pontos += candidato.anosConsecutivosSemParir * 200

  return pontos
}

/**
 * Ordena as candidatas da pior para a melhor. Quem não tem dados
 * suficientes vai para o final, nunca misturada como se tivesse ficado bem
 * avaliada.
 */
export function ordenarListaDescarte(candidatos: CandidatoDescarte[]): CandidatoDescarte[] {
  return [...candidatos].sort((a, b) => {
    const pontosA = calcularPontuacaoDescarte(a)
    const pontosB = calcularPontuacaoDescarte(b)
    if (pontosA == null && pontosB == null) return 0
    if (pontosA == null) return 1
    if (pontosB == null) return -1
    return pontosB - pontosA
  })
}
