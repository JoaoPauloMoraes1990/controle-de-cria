/**
 * Módulo único de validação. Hoje só o número do animal é obrigatório —
 * o resto do app nunca bloqueia nem mostra erro. As "pendências" retornadas
 * aqui servem só para mostrar um lembrete neutro na tela, nunca para impedir
 * o salvamento. Quando as regras forem endurecidas no futuro, mudam só aqui.
 */

export type TipoRegistro =
  | 'animal'
  | 'nascimento'
  | 'pesagem'
  | 'venda'
  | 'morte'
  | 'virouNovilha'

const CAMPOS_RECOMENDADOS: Record<TipoRegistro, { campo: string; rotulo: string }[]> = {
  animal: [{ campo: 'dataNascimento', rotulo: 'data de nascimento' }],
  nascimento: [
    { campo: 'data', rotulo: 'data do nascimento' },
    { campo: 'sexo', rotulo: 'sexo' },
  ],
  pesagem: [{ campo: 'pesoKg', rotulo: 'peso' }],
  venda: [
    { campo: 'pesoKg', rotulo: 'peso' },
    { campo: 'precoPorArroba', rotulo: 'preço por arroba' },
  ],
  morte: [{ campo: 'causaProvavel', rotulo: 'causa provável' }],
  virouNovilha: [{ campo: 'data', rotulo: 'data' }],
}

export function numeroValido(numero: string | undefined | null): boolean {
  return !!numero && numero.trim().length > 0
}

/**
 * Lista, em português simples, o que ficou faltando num lançamento — para
 * mostrar como pendência, nunca como erro. Não impede salvar.
 */
export function listarPendencias(
  tipo: TipoRegistro,
  dados: Record<string, unknown>,
): string[] {
  const campos = CAMPOS_RECOMENDADOS[tipo] ?? []
  return campos
    .filter(({ campo }) => {
      const valor = dados[campo]
      return valor === undefined || valor === null || valor === ''
    })
    .map(({ rotulo }) => rotulo)
}
