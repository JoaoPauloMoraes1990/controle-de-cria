import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { CartaoIndicador } from '../componentes/CartaoIndicador'
import { Botao } from '../componentes/Botao'
import { obterIndicadoresReprodutivos, type IndicadoresReprodutivos } from '../repositorio/indicadores'
import { formatarMesesEDias } from '../utilitarios/datas'

export function PainelNumeros() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<IndicadoresReprodutivos | null>(null)

  useEffect(() => {
    obterIndicadoresReprodutivos().then(setDados)
  }, [])

  if (!dados) {
    return (
      <PaginaBase>
        <Cabecalho titulo="Os números" />
        <p className="text-lg text-texto-suave">Carregando…</p>
      </PaginaBase>
    )
  }

  const taxaAnoAtual = dados.taxaNatalidadePorAno.find((t) => t.ano === dados.anoAtual)

  return (
    <PaginaBase>
      <Cabecalho titulo="Os números" />

      <div className="flex flex-col gap-4">
        <CartaoIndicador
          titulo={`Taxa de natalidade em ${dados.anoAtual}`}
          valor={taxaAnoAtual?.taxa != null ? `${Math.round(taxaAnoAtual.taxa)}%` : 'não disponível'}
          explicacao="Crias nascidas este ano, para cada 100 matrizes que estavam no rebanho."
        />

        <Cartao>
          <p className="mb-2 text-base font-medium text-texto-suave">Taxa de natalidade nos últimos anos</p>
          <ul className="flex flex-col gap-1">
            {dados.taxaNatalidadePorAno.map((t) => (
              <li key={t.ano} className="flex justify-between text-lg">
                <span>{t.ano}</span>
                <span className="font-semibold">
                  {t.taxa != null ? `${Math.round(t.taxa)}%` : 'não disponível'}
                </span>
              </li>
            ))}
          </ul>
        </Cartao>

        <CartaoIndicador
          titulo="Intervalo médio entre partos do rebanho"
          valor={
            dados.intervaloMedioRebanho != null
              ? formatarMesesEDias(dados.intervaloMedioRebanho)
              : 'não disponível'
          }
          explicacao="Tempo médio entre uma cria e a seguinte, considerando as matrizes com pelo menos duas crias lançadas."
        />

        <Cartao>
          <p className="mb-2 text-lg font-semibold">Bezerros a caminho dos 180kg</p>
          {dados.bezerrosProjecao.length === 0 && (
            <p className="text-base text-texto-suave">Nenhum bezerro ativo no momento.</p>
          )}
          <ul className="flex flex-col gap-2">
            {dados.bezerrosProjecao.map((b) => (
              <li key={b.animalId}>
                <button
                  type="button"
                  onClick={() => navigate(`/animais/${b.animalId}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-borda bg-white px-3 py-3 text-left hover:bg-verde-claro"
                >
                  <span className="text-lg font-semibold">{b.numero || '(sem número)'}</span>
                  <span className="text-base text-texto-suave">
                    {b.projecao == null
                      ? 'sem peso registrado'
                      : b.projecao.jaAtingiu
                        ? 'pronto para vender'
                        : `~ ${format(parseISO(b.projecao.dataPrevista), 'dd/MM/yyyy')}${
                            b.projecao.estimativa ? ' (estimativa)' : ''
                          }`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao>
          <p className="mb-2 text-lg font-semibold">Matrizes mais rápidas até o bezerro de 180kg</p>
          {dados.rankingVelocidade.length === 0 && (
            <p className="text-base text-texto-suave">Sem dados suficientes ainda.</p>
          )}
          <ul className="flex flex-col gap-1">
            {dados.rankingVelocidade.slice(0, 5).map((d, indice) => (
              <li key={d.matrizId} className="flex items-center justify-between text-lg">
                <button
                  type="button"
                  onClick={() => navigate(`/animais/${d.matrizId}`)}
                  className="text-left underline"
                >
                  {indice + 1}. {d.numero || '(sem número)'}
                </button>
                <span className="text-texto-suave">
                  {d.diasMediosAte180kg != null ? `${Math.round(d.diasMediosAte180kg)} dias` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao>
          <p className="mb-2 text-lg font-semibold">
            Matrizes que mais produziram arrobas em {dados.anoAtual}
          </p>
          {dados.rankingArrobas.every((d) => d.arrobasProduzidasNoAno === 0) && (
            <p className="text-base text-texto-suave">Nenhuma arroba vendida este ano ainda.</p>
          )}
          <ul className="flex flex-col gap-1">
            {dados.rankingArrobas.slice(0, 5).map((d, indice) => (
              <li key={d.matrizId} className="flex items-center justify-between text-lg">
                <button
                  type="button"
                  onClick={() => navigate(`/animais/${d.matrizId}`)}
                  className="text-left underline"
                >
                  {indice + 1}. {d.numero || '(sem número)'}
                </button>
                <span className="text-texto-suave">{d.arrobasProduzidasNoAno.toFixed(1)} @</span>
              </li>
            ))}
          </ul>
        </Cartao>

        <Botao variante="secundario" onClick={() => navigate('/descarte')}>
          Ver lista de descarte sugerida
        </Botao>

        <Botao variante="neutro" onClick={() => navigate('/numeros/detalhado')}>
          Ver mais números
        </Botao>
      </div>
    </PaginaBase>
  )
}
