import { useEffect, useState } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import {
  obterIndicadoresReprodutivos,
  type IndicadoresReprodutivos,
  type DesempenhoMatriz,
} from '../repositorio/indicadores'
import { formatarMesesEDias } from '../utilitarios/datas'

const CORES = {
  marrom: '#4A2E1A',
  verde: '#55693C',
}

const NOMES_MESES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function NumerosDetalhado() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<IndicadoresReprodutivos | null>(null)

  useEffect(() => {
    obterIndicadoresReprodutivos().then(setDados)
  }, [])

  if (!dados) {
    return (
      <PaginaBase>
        <Cabecalho titulo="Mais números" />
        <p className="text-lg text-texto-suave">Carregando…</p>
      </PaginaBase>
    )
  }

  const dadosNascimentosPorAno = dados.nascimentosPorAno.map((n) => ({
    ano: String(n.ano),
    crias: n.total,
  }))

  const dadosTaxaPorAno = dados.taxaNatalidadePorAno.map((t) => ({
    ano: String(t.ano),
    taxa: t.taxa ?? 0,
  }))

  const dadosPorMes = dados.distribuicaoNascimentosPorMes.map((total, indice) => ({
    mes: NOMES_MESES[indice],
    crias: total,
  }))

  return (
    <PaginaBase>
      <Cabecalho titulo="Mais números" />
      <p className="mb-6 text-lg text-texto-suave">
        Visão mais completa, com gráficos e listas inteiras. O painel simples continua em "Ver os
        números", na tela inicial.
      </p>

      <div className="flex flex-col gap-6">
        <Cartao>
          <p className="mb-3 text-lg font-semibold">Nascimentos por ano</p>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={dadosNascimentosPorAno}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd0b8" />
                <XAxis dataKey="ano" tick={{ fontSize: 14 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                <Tooltip formatter={(v) => [`${v}`, 'Crias']} />
                <Bar dataKey="crias" fill={CORES.marrom} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">Taxa de natalidade por ano (%)</p>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={dadosTaxaPorAno}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd0b8" />
                <XAxis dataKey="ano" tick={{ fontSize: 14 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} unit="%" />
                <Tooltip formatter={(v) => [`${Math.round(Number(v))}%`, 'Taxa']} />
                <Bar dataKey="taxa" fill={CORES.verde} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao>
          <p className="mb-1 text-lg font-semibold">Nascimentos por mês</p>
          <p className="mb-3 text-base text-texto-suave">Somando todos os anos lançados.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={dadosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd0b8" />
                <XAxis dataKey="mes" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                <Tooltip formatter={(v) => [`${v}`, 'Crias']} />
                <Bar dataKey="crias" fill={CORES.marrom} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">
            Ranking completo — velocidade até o bezerro de 180kg
          </p>
          {dados.rankingVelocidade.length === 0 ? (
            <p className="text-base text-texto-suave">Sem dados suficientes ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-base">
                <thead>
                  <tr className="border-b border-borda text-texto-suave">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Matriz</th>
                    <th className="py-2 pr-2">Dias até 180kg</th>
                    <th className="py-2 pr-2">Intervalo entre partos</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.rankingVelocidade.map((d, indice) => (
                    <tr key={d.matrizId} className="border-b border-borda last:border-0">
                      <td className="py-2 pr-2 text-texto-suave">{indice + 1}</td>
                      <td className="py-2 pr-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/animais/${d.matrizId}`)}
                          className="font-semibold text-marrom-escuro underline"
                        >
                          {d.numero || '(sem número)'}
                        </button>
                      </td>
                      <td className="py-2 pr-2">
                        {d.diasMediosAte180kg != null ? `${Math.round(d.diasMediosAte180kg)} dias` : '—'}
                      </td>
                      <td className="py-2 pr-2">
                        {d.intervaloMedioEntrePartos != null
                          ? formatarMesesEDias(d.intervaloMedioEntrePartos)
                          : 'não disponível'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">20 melhores vacas — intervalo entre partos</p>
          <TabelaIntervalo itens={dados.melhoresIntervalos} navigate={navigate} />
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">20 piores vacas — intervalo entre partos</p>
          <TabelaIntervalo itens={dados.pioresIntervalos} navigate={navigate} />
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">
            Ranking completo — arrobas produzidas em {dados.anoAtual}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-base">
              <thead>
                <tr className="border-b border-borda text-texto-suave">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Matriz</th>
                  <th className="py-2 pr-2">Arrobas</th>
                </tr>
              </thead>
              <tbody>
                {dados.rankingArrobas.map((d, indice) => (
                  <tr key={d.matrizId} className="border-b border-borda last:border-0">
                    <td className="py-2 pr-2 text-texto-suave">{indice + 1}</td>
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/animais/${d.matrizId}`)}
                        className="font-semibold text-marrom-escuro underline"
                      >
                        {d.numero || '(sem número)'}
                      </button>
                    </td>
                    <td className="py-2 pr-2">{d.arrobasProduzidasNoAno.toFixed(1)} @</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg font-semibold">
            Vacas que não pariram em {dados.anoAtual}
          </p>
          {dados.matrizesFalharamEsteAno.length === 0 ? (
            <p className="text-base text-texto-suave">
              Nenhuma matriz ativa ficou sem parir este ano até agora.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {dados.matrizesFalharamEsteAno.map((m) => (
                <li key={m.matrizId}>
                  <button
                    type="button"
                    onClick={() => navigate(`/animais/${m.matrizId}`)}
                    className="rounded-xl border border-atencao bg-atencao-claro px-3 py-2 text-base font-semibold text-atencao"
                  >
                    {m.numero || '(sem número)'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>
    </PaginaBase>
  )
}

function TabelaIntervalo({
  itens,
  navigate,
}: {
  itens: DesempenhoMatriz[]
  navigate: NavigateFunction
}) {
  if (itens.length === 0) {
    return <p className="text-base text-texto-suave">Sem dados suficientes ainda.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-base">
        <thead>
          <tr className="border-b border-borda text-texto-suave">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Matriz</th>
            <th className="py-2 pr-2">Intervalo entre partos</th>
            <th className="py-2 pr-2">Crias</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((d, indice) => (
            <tr key={d.matrizId} className="border-b border-borda last:border-0">
              <td className="py-2 pr-2 text-texto-suave">{indice + 1}</td>
              <td className="py-2 pr-2">
                <button
                  type="button"
                  onClick={() => navigate(`/animais/${d.matrizId}`)}
                  className="font-semibold text-marrom-escuro underline"
                >
                  {d.numero || '(sem número)'}
                </button>
              </td>
              <td className="py-2 pr-2">
                {d.intervaloMedioEntrePartos != null
                  ? formatarMesesEDias(d.intervaloMedioEntrePartos)
                  : 'não disponível'}
              </td>
              <td className="py-2 pr-2">{d.totalCrias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
