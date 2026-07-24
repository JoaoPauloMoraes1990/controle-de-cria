import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { Botao } from '../componentes/Botao'
import { AjudaComportamentoDespesa } from '../componentes/AjudaComportamentoDespesa'
import {
  atualizarItemDespesa,
  listarItensDespesa,
  removerItemDespesa,
} from '../repositorio/financeiro'
import {
  CATEGORIAS_DESPESA,
  COMPORTAMENTOS_DESPESA,
  ROTULO_CATEGORIA_DESPESA,
  ROTULO_COMPORTAMENTO_DESPESA,
} from '../utilitarios/despesas'
import type { ItemDespesa } from '../db'

export function ItensDespesa() {
  const navigate = useNavigate()
  const [itens, setItens] = useState<ItemDespesa[] | null>(null)

  async function carregar() {
    setItens(await listarItensDespesa())
  }

  useEffect(() => {
    carregar()
  }, [])

  async function aoMudarCategoria(item: ItemDespesa, categoria: ItemDespesa['categoria']) {
    await atualizarItemDespesa(item.id!, { categoria })
    carregar()
  }

  async function aoMudarComportamento(item: ItemDespesa, comportamento: ItemDespesa['comportamento']) {
    await atualizarItemDespesa(item.id!, { comportamento })
    carregar()
  }

  async function aoRemover(item: ItemDespesa) {
    await removerItemDespesa(item.id!)
    carregar()
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Classificação de despesas" />
      <p className="mb-6 text-lg text-texto-suave">
        Cada item lembra a categoria e o comportamento escolhidos da última vez. Mude aqui quando
        precisar corrigir — vale para os próximos lançamentos, não para os que já foram salvos.
      </p>

      <div className="mb-6">
        <AjudaComportamentoDespesa />
      </div>

      {!itens && <p className="text-lg text-texto-suave">Carregando…</p>}
      {itens && itens.length === 0 && (
        <p className="text-lg text-texto-suave">
          Nenhum item classificado ainda. Itens aparecem aqui sozinhos assim que você lança a
          primeira despesa com aquele nome.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {itens?.map((item) => (
          <Cartao key={item.id}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-semibold text-marrom-escuro">{item.nome}</p>
              <button
                type="button"
                onClick={() => aoRemover(item)}
                className="text-base text-atencao underline"
              >
                Remover
              </button>
            </div>

            <p className="mb-1 text-base font-medium text-texto-suave">Categoria</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIAS_DESPESA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => aoMudarCategoria(item, c)}
                  className={`min-h-10 rounded-lg border-2 px-3 text-sm font-medium ${
                    item.categoria === c
                      ? 'border-verde bg-verde-claro text-verde-escuro'
                      : 'border-borda bg-white text-texto'
                  }`}
                >
                  {ROTULO_CATEGORIA_DESPESA[c]}
                </button>
              ))}
            </div>

            <p className="mb-1 text-base font-medium text-texto-suave">Comportamento</p>
            <div className="flex flex-wrap gap-2">
              {COMPORTAMENTOS_DESPESA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => aoMudarComportamento(item, c)}
                  className={`min-h-10 rounded-lg border-2 px-3 text-sm font-medium ${
                    item.comportamento === c
                      ? 'border-verde bg-verde-claro text-verde-escuro'
                      : 'border-borda bg-white text-texto'
                  }`}
                >
                  {ROTULO_COMPORTAMENTO_DESPESA[c]}
                </button>
              ))}
            </div>
          </Cartao>
        ))}
      </div>

      <Botao
        variante="neutro"
        className="mt-6"
        onClick={() => navigate('/financeiro/importar')}
      >
        Importar despesas de uma planilha
      </Botao>
    </PaginaBase>
  )
}
