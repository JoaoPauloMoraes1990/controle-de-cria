import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoTexto } from '../componentes/CampoTexto'
import { CampoNumero } from '../componentes/CampoNumero'
import { CampoData } from '../componentes/CampoData'
import { Botao } from '../componentes/Botao'
import { AjudaComportamentoDespesa } from '../componentes/AjudaComportamentoDespesa'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import { buscarItensDespesaPorNome, registrarDespesa } from '../repositorio/financeiro'
import {
  CATEGORIAS_DESPESA,
  COMPORTAMENTOS_DESPESA,
  ROTULO_CATEGORIA_DESPESA,
  ROTULO_COMPORTAMENTO_DESPESA,
} from '../utilitarios/despesas'
import type { CategoriaDespesa, ComportamentoDespesa, ItemDespesa } from '../db'

const PRAZO_DILUICAO_PADRAO = 5

export function LancarDespesa() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()

  const [nome, setNome] = useState('')
  const [sugestoes, setSugestoes] = useState<ItemDespesa[]>([])
  const [categoria, setCategoria] = useState<CategoriaDespesa | undefined>()
  const [comportamento, setComportamento] = useState<ComportamentoDespesa | undefined>()
  const [prazoDiluicaoAnos, setPrazoDiluicaoAnos] = useState<number | undefined>(
    PRAZO_DILUICAO_PADRAO,
  )
  const [data, setData] = useState<string | undefined>()
  const [valor, setValor] = useState<number | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoDigitarNome(valorDigitado: string) {
    setNome(valorDigitado)
    if (!valorDigitado.trim()) {
      setSugestoes([])
      return
    }
    setSugestoes(await buscarItensDespesaPorNome(valorDigitado))
  }

  function aoEscolherSugestao(item: ItemDespesa) {
    setNome(item.nome)
    setCategoria(item.categoria)
    setComportamento(item.comportamento)
    if (item.prazoDiluicaoAnos != null) setPrazoDiluicaoAnos(item.prazoDiluicaoAnos)
    setSugestoes([])
  }

  async function aoSalvar() {
    if (!nome.trim() || !categoria || !comportamento) return
    setSalvando(true)
    await registrarDespesa({
      nome,
      categoria,
      comportamento,
      data,
      valor,
      prazoDiluicaoAnos: comportamento === 'investimento' ? prazoDiluicaoAnos : undefined,
      observacoes: observacoes || undefined,
    })
    setSalvando(false)
    mostrar(`Despesa "${nome.trim()}" salva!`)
    navigate('/')
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Lançar despesa" />
      <div className="flex flex-col gap-5">
        <div>
          <CampoTexto rotulo="Nome da despesa" valor={nome} aoAlterar={aoDigitarNome} obrigatorio autoFoco />
          {sugestoes.length > 0 && (
            <ul className="mt-2 divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-white">
              {sugestoes.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => aoEscolherSugestao(item)}
                    className="w-full px-4 py-3 text-left text-lg hover:bg-verde-claro"
                  >
                    <span className="font-semibold">{item.nome}</span>
                    <span className="text-texto-suave">
                      {' '}
                      · {ROTULO_CATEGORIA_DESPESA[item.categoria]} · {ROTULO_COMPORTAMENTO_DESPESA[item.comportamento]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <span className="mb-1 block text-lg font-medium text-texto">Categoria</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_DESPESA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`min-h-12 rounded-xl border-2 px-3 text-base font-medium ${
                  categoria === c
                    ? 'border-verde bg-verde-claro text-verde-escuro'
                    : 'border-borda bg-white text-texto'
                }`}
              >
                {ROTULO_CATEGORIA_DESPESA[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-lg font-medium text-texto">Comportamento</span>
          <div className="flex flex-wrap gap-2">
            {COMPORTAMENTOS_DESPESA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setComportamento(c)}
                className={`min-h-12 rounded-xl border-2 px-3 text-base font-medium ${
                  comportamento === c
                    ? 'border-verde bg-verde-claro text-verde-escuro'
                    : 'border-borda bg-white text-texto'
                }`}
              >
                {ROTULO_COMPORTAMENTO_DESPESA[c]}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <AjudaComportamentoDespesa />
          </div>
        </div>

        {comportamento === 'investimento' && (
          <div>
            <CampoNumero
              rotulo="Prazo de diluição"
              valor={prazoDiluicaoAnos}
              aoAlterar={setPrazoDiluicaoAnos}
              sufixo="anos"
            />
            <p className="mt-1 text-base text-texto-suave">
              Só fica guardado por enquanto — os cálculos de custo ainda contam o valor inteiro no
              ano do lançamento.
            </p>
          </div>
        )}

        <CampoData rotulo="Data" valor={data} aoAlterar={setData} />
        <CampoNumero rotulo="Valor" valor={valor} aoAlterar={setValor} sufixo="R$" />
        <CampoTexto
          rotulo="Observações"
          valor={observacoes}
          aoAlterar={setObservacoes}
          placeholder="Opcional"
        />

        <Botao onClick={aoSalvar} disabled={!nome.trim() || !categoria || !comportamento || salvando}>
          {salvando ? 'Salvando…' : 'Salvar despesa'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
