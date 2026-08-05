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
import { formatarIdadeEmMeses } from '../dominio/idade'

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

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
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

        <Cartao className="lg:col-span-2">
          <p className="text-base font-medium text-texto-suave">
            Intervalo médio entre partos do rebanho
          </p>
          <p className="mt-1 text-4xl font-bold text-marrom-escuro">
            {dados.intervaloMedioRebanho != null
              ? formatarMesesEDias(dados.intervaloMedioRebanho)
              : 'não disponível'}
          </p>
          <p className="mt-2 text-base text-texto-suave">
            Tempo médio entre uma cria e a seguinte, considerando as matrizes com pelo menos duas
            crias lançadas.{' '}
            <button
              type="button"
              onClick={() => navigate('/numeros/detalhado')}
              className="font-semibold underline"
            >
              Ver as 20 melhores e 20 piores vacas nesse número
            </button>
            .
          </p>
        </Cartao>

        <Cartao className="lg:col-span-2">
          <p className="mb-2 text-lg font-semibold">Bezerros machos ativos</p>
          {dados.bezerrosProjecao.length === 0 ? (
            <p className="text-base text-texto-suave">Nenhum bezerro macho ativo no momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-base">
                <thead>
                  <tr className="border-b border-borda text-texto-suave">
                    <th className="py-2 pr-2">Número</th>
                    <th className="py-2 pr-2">Idade</th>
                    <th className="py-2 pr-2">Peso</th>
                    <th className="py-2 pr-2">Data da pesagem</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.bezerrosProjecao.map((b) => (
                    <tr key={b.animalId} className="border-b border-borda last:border-0">
                      <td className="py-2 pr-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/animais/${b.animalId}`)}
                          className="font-semibold text-marrom-escuro underline"
                        >
                          {b.numero || '(sem número)'}
                        </button>
                      </td>
                      <td className="py-2 pr-2">
                        {b.idadeEmMeses != null ? formatarIdadeEmMeses(b.idadeEmMeses) : 'não disponível'}
                      </td>
                      <td className="py-2 pr-2">
                        {b.pesoUltimaPesagemKg != null ? `${b.pesoUltimaPesagemKg} kg` : 'sem peso ainda'}
                      </td>
                      <td className="py-2 pr-2">
                        {b.dataUltimaPesagem != null
                          ? format(parseISO(b.dataUltimaPesagem), 'dd/MM/yyyy')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Botao variante="secundario" onClick={() => navigate('/descarte')}>
            Ver lista de descarte sugerida
          </Botao>

          <Botao variante="neutro" onClick={() => navigate('/numeros/detalhado')}>
            Ver mais números
          </Botao>
        </div>
      </div>
    </PaginaBase>
  )
}
