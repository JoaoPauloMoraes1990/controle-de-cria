import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { CartaoIndicador } from '../componentes/CartaoIndicador'
import { Botao } from '../componentes/Botao'
import {
  obterIndicadoresEconomicos,
  type IndicadoresEconomicos,
} from '../repositorio/indicadoresEconomicos'
import { ROTULO_CATEGORIA_DESPESA, formatarReais } from '../utilitarios/despesas'
import type { CategoriaDespesa } from '../db'

const ANO_ATUAL = new Date().getFullYear()
const ANOS_DISPONIVEIS = Array.from({ length: 6 }, (_, i) => ANO_ATUAL - i)

export function NumerosFinanceiros() {
  const navigate = useNavigate()
  const [ano, setAno] = useState(ANO_ATUAL)
  const [dados, setDados] = useState<IndicadoresEconomicos | null>(null)

  useEffect(() => {
    setDados(null)
    obterIndicadoresEconomicos(ano).then(setDados)
  }, [ano])

  return (
    <PaginaBase>
      <Cabecalho titulo="Números do dinheiro" />

      <div className="mb-4 flex flex-wrap gap-2">
        {ANOS_DISPONIVEIS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAno(a)}
            className={`min-h-10 rounded-lg border-2 px-3 text-base font-medium ${
              ano === a
                ? 'border-verde bg-verde-claro text-verde-escuro'
                : 'border-borda bg-white text-texto'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {!dados && <p className="text-lg text-texto-suave">Carregando…</p>}

      {dados && (
      <div className="flex flex-col gap-4">
        <CartaoIndicador
          titulo={`Gasto pecuário em ${dados.anoAtual}`}
          valor={formatarReais(dados.despesaPecuariaTotal)}
          explicacao={
            dados.despesaNaoPecuariaTotal > 0
              ? `Não inclui ${formatarReais(dados.despesaNaoPecuariaTotal)} de despesas não pecuárias, lançadas à parte.`
              : 'Sem despesas não pecuárias lançadas neste ano.'
          }
        />

        <CartaoIndicador
          titulo="Custo por matriz"
          valor={dados.custoPorMatriz != null ? formatarReais(dados.custoPorMatriz) : 'não disponível'}
          explicacao={`Considerando ${dados.totalMatrizesAtivas} matrizes ativas no ano.`}
        />

        <CartaoIndicador
          titulo="Custo por bezerro vendido"
          valor={
            dados.custoPorBezerroVendido != null
              ? formatarReais(dados.custoPorBezerroVendido)
              : 'não disponível'
          }
          explicacao={`Considerando ${dados.totalBezerrosVendidos} bezerros vendidos no ano.`}
        />

        <Cartao>
          <p className="mb-2 text-base font-medium text-texto-suave">Custo por arroba vs. preço recebido</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-marrom-escuro">
              {dados.custoPorArroba != null ? formatarReais(dados.custoPorArroba) : 'não disponível'}
            </span>
            <span className="text-lg text-texto-suave">custo</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-verde-escuro">
              {dados.precoMedioRecebidoPorArroba != null
                ? formatarReais(dados.precoMedioRecebidoPorArroba)
                : 'não disponível'}
            </span>
            <span className="text-lg text-texto-suave">recebido</span>
          </div>
          <p className="mt-2 text-base text-texto-suave">
            Considerando {dados.totalArrobasVendidas.toFixed(1)} arrobas vendidas no ano.
          </p>
        </Cartao>

        {dados.avisoOutrosAlto && (
          <p className="rounded-xl bg-atencao-claro p-4 text-base text-atencao">
            {Math.round(dados.percentualOutros)}% do gasto está classificado como "Outros" — acima
            de 10%. Os números acima perdem confiabilidade enquanto isso não for reclassificado em{' '}
            <button
              type="button"
              onClick={() => navigate('/financeiro/itens')}
              className="font-semibold underline"
            >
              Classificação de despesas
            </button>
            .
          </p>
        )}

        <Cartao>
          <p className="mb-3 text-lg font-semibold">Participação por categoria</p>
          {dados.participacaoPorCategoria.length === 0 ? (
            <p className="text-base text-texto-suave">Nenhuma despesa pecuária lançada neste ano.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dados.participacaoPorCategoria.map((p) => (
                <li key={p.categoria} className="flex items-center justify-between text-lg">
                  <span>{ROTULO_CATEGORIA_DESPESA[p.categoria as CategoriaDespesa]}</span>
                  <span className="text-texto-suave">
                    {Math.round(p.percentual)}% · {formatarReais(p.valor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Botao onClick={() => navigate('/financeiro')}>Lançar despesa</Botao>
        <Botao variante="secundario" onClick={() => navigate('/financeiro/itens')}>
          Ver classificação de despesas
        </Botao>
      </div>
      )}
    </PaginaBase>
  )
}
