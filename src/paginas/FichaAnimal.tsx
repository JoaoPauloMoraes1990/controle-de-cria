import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useNavigate, useParams } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { Botao } from '../componentes/Botao'
import { CampoTexto } from '../componentes/CampoTexto'
import {
  obterAnimal,
  listarIdentificacoes,
  listarPesagens,
  listarVendas,
  listarMortes,
  listarMudancasCategoria,
  listarCriasDoAnimal,
  atualizarAnimal,
} from '../repositorio'
import { obterIndicadoresReprodutivos, type DesempenhoMatriz } from '../repositorio/indicadores'
import { mapaNumerosAtuais } from '../repositorio/cadastroInicial'
import type { AnimalComId } from '../dominio/identificacao'
import { calcularGanhoPesoDiario, obterUltimaPesagemValida } from '../dominio/ganhoPeso'
import { projetarDataPesoAlvo, type ProjecaoPeso } from '../dominio/projecaoVenda'
import { calcularIdadeEmMeses, formatarIdadeEmMeses } from '../dominio/idade'
import { formatarMesesEDias, parseDataSegura } from '../utilitarios/datas'
import type {
  Identificacao,
  Pesagem,
  Venda,
  Morte,
  MudancaCategoria,
  Situacao,
} from '../db'

interface CriaComDados {
  animal: AnimalComId
  numero: string
  idadeEmMeses: number | null
  pesoUltimaPesagemKg: number | null
  dataUltimaPesagem: string | null
}

/**
 * Datas de nascimento antigas podem vir malformadas do campo de digitação
 * corrida do cadastro inicial — mostra a data como foi digitada em vez de
 * travar a ficha inteira tentando formatar uma data inválida.
 */
function formatarDataNascimento(dataIso: string): string {
  const data = parseDataSegura(dataIso)
  return data ? format(data, 'dd/MM/yyyy') : dataIso
}

const SITUACOES: { valor: Situacao; rotulo: string }[] = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'vendido', rotulo: 'Vendido' },
  { valor: 'morto', rotulo: 'Morto' },
  { valor: 'descartado', rotulo: 'Descartado' },
]

const ROTULO_CATEGORIA: Record<string, string> = {
  bezerro: 'bezerro',
  bezerra: 'bezerra',
  novilha: 'novilha',
  vaca: 'vaca',
  touro: 'touro',
}

export function FichaAnimal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const animalId = Number(id)

  const [animal, setAnimal] = useState<AnimalComId | null>(null)
  const [identificacoes, setIdentificacoes] = useState<Identificacao[]>([])
  const [pesagens, setPesagens] = useState<Pesagem[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [mortes, setMortes] = useState<Morte[]>([])
  const [mudancas, setMudancas] = useState<MudancaCategoria[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [desempenho, setDesempenho] = useState<DesempenhoMatriz | null>(null)
  const [crias, setCrias] = useState<CriaComDados[]>([])
  const [idadeEmMeses, setIdadeEmMeses] = useState<number | null>(null)
  const [projecaoPeso, setProjecaoPeso] = useState<ProjecaoPeso | null>(null)

  async function carregar() {
    const a = await obterAnimal(animalId)
    if (!a) {
      setCarregando(false)
      return
    }
    setAnimal(a)
    setObservacoes(a.observacoes ?? '')
    const [idents, pes, vend, mort, mud] = await Promise.all([
      listarIdentificacoes(animalId),
      listarPesagens(animalId),
      listarVendas(animalId),
      listarMortes(animalId),
      listarMudancasCategoria(animalId),
    ])
    setIdentificacoes(idents)
    setPesagens(pes)
    setVendas(vend)
    setMortes(mort)
    setMudancas(mud)

    if (a.categoria === 'vaca' || a.categoria === 'novilha') {
      const [indicadores, criasBrutas, numeros] = await Promise.all([
        obterIndicadoresReprodutivos(),
        listarCriasDoAnimal(animalId),
        mapaNumerosAtuais(),
      ])
      setDesempenho(indicadores.desempenhoMatrizes.find((d) => d.matrizId === animalId) ?? null)
      const criasComDados = await Promise.all(
        criasBrutas.map(async (c) => {
          const pesagensCria = c.id != null ? await listarPesagens(c.id) : []
          const ultima = obterUltimaPesagemValida(pesagensCria)
          return {
            animal: c,
            numero: numeros.get(c.id) ?? '',
            idadeEmMeses: calcularIdadeEmMeses(c.dataNascimento),
            pesoUltimaPesagemKg: ultima?.pesoKg ?? null,
            dataUltimaPesagem: ultima?.data ?? null,
          }
        }),
      )
      setCrias(criasComDados)
    } else {
      setDesempenho(null)
      setCrias([])
    }

    if ((a.categoria === 'bezerro' || a.categoria === 'bezerra') && a.situacao === 'ativo') {
      setIdadeEmMeses(calcularIdadeEmMeses(a.dataNascimento))
      const indicadores = await obterIndicadoresReprodutivos()
      setProjecaoPeso(projetarDataPesoAlvo(pes, indicadores.ganhoMedioRebanhoKgDia))
    } else {
      setIdadeEmMeses(null)
      setProjecaoPeso(null)
    }

    setCarregando(false)
  }

  useEffect(() => {
    setCarregando(true)
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId])

  if (carregando) {
    return (
      <PaginaBase>
        <Cabecalho titulo="Ficha do animal" />
        <p className="text-lg text-texto-suave">Carregando…</p>
      </PaginaBase>
    )
  }

  if (!animal) {
    return (
      <PaginaBase>
        <Cabecalho titulo="Ficha do animal" />
        <p className="text-lg text-texto-suave">Animal não encontrado.</p>
      </PaginaBase>
    )
  }

  const identificacaoAtual =
    [...identificacoes].reverse().find((i) => i.ativa) ?? identificacoes[identificacoes.length - 1]
  const identificacoesAnteriores = identificacoes.filter((i) => i.id !== identificacaoAtual?.id)
  const ganhoDiario = calcularGanhoPesoDiario(pesagens)

  async function aoMudarSituacao(situacao: Situacao) {
    await atualizarAnimal(animalId, { situacao })
    carregar()
  }

  async function aoSalvarObservacoes() {
    await atualizarAnimal(animalId, { observacoes: observacoes || undefined })
  }

  return (
    <PaginaBase>
      <Cabecalho titulo={identificacaoAtual ? `Animal ${identificacaoAtual.numero}` : 'Animal'} />

      <div className="flex flex-col gap-5">
        <Cartao>
          <p className="text-2xl font-bold text-marrom-escuro">{identificacaoAtual?.numero ?? '—'}</p>
          {identificacoesAnteriores.length > 0 && (
            <p className="mt-1 text-base text-texto-suave">
              Antes: {identificacoesAnteriores.map((i) => i.numero).join(', ')}
            </p>
          )}
          <p className="mt-2 text-lg">
            {animal.categoria ? ROTULO_CATEGORIA[animal.categoria] : 'categoria não informada'} ·{' '}
            {animal.sexo === 'M' ? 'macho' : animal.sexo === 'F' ? 'fêmea' : 'sexo não informado'}
          </p>
          {animal.dataNascimento && (
            <p className="text-lg">
              Nasceu em {animal.dataNascimento}
              {idadeEmMeses != null && ` · ${formatarIdadeEmMeses(idadeEmMeses)}`}
            </p>
          )}
        </Cartao>

        {(animal.categoria === 'bezerro' || animal.categoria === 'bezerra') &&
          animal.situacao === 'ativo' && (
            <Cartao>
              <p className="mb-2 text-lg font-semibold">Peso de venda (180kg)</p>
              <p className="text-lg">
                {projecaoPeso == null
                  ? 'não disponível'
                  : projecaoPeso.jaAtingiu
                    ? 'já atingiu — pronto para vender'
                    : `previsão: ${format(parseISO(projecaoPeso.dataPrevista), 'dd/MM/yyyy')}${
                        projecaoPeso.estimativa ? ' (estimativa)' : ''
                      }`}
              </p>
            </Cartao>
          )}

        {desempenho && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Desempenho reprodutivo</p>
            <ul className="flex flex-col gap-1 text-lg">
              <li>
                Intervalo médio entre partos:{' '}
                {desempenho.intervaloMedioEntrePartos != null
                  ? formatarMesesEDias(desempenho.intervaloMedioEntrePartos)
                  : 'não disponível'}
              </li>
              <li>Total de crias: {desempenho.totalCrias}</li>
              <li>Anos seguidos sem parir: {desempenho.anosConsecutivosSemParir}</li>
              <li>
                Dias médios até 180kg das crias:{' '}
                {desempenho.diasMediosAte180kg != null
                  ? `${Math.round(desempenho.diasMediosAte180kg)} dias`
                  : 'não disponível'}
              </li>
              <li>Arrobas produzidas este ano: {desempenho.arrobasProduzidasNoAno.toFixed(1)} @</li>
            </ul>
          </Cartao>
        )}

        {crias.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Crias</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-base">
                <thead>
                  <tr className="border-b border-borda text-texto-suave">
                    <th className="py-2 pr-2">Número</th>
                    <th className="py-2 pr-2">Sexo</th>
                    <th className="py-2 pr-2">Nasceu em</th>
                    <th className="py-2 pr-2">Idade</th>
                    <th className="py-2 pr-2">Peso</th>
                    <th className="py-2 pr-2">Data da pesagem</th>
                  </tr>
                </thead>
                <tbody>
                  {crias.map((c) => (
                    <tr key={c.animal.id} className="border-b border-borda last:border-0">
                      <td className="py-2 pr-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/animais/${c.animal.id}`)}
                          className="font-semibold text-marrom-escuro underline"
                        >
                          {c.numero || '(sem número)'}
                        </button>
                      </td>
                      <td className="py-2 pr-2">
                        {c.animal.sexo === 'M' ? 'macho' : c.animal.sexo === 'F' ? 'fêmea' : 'não informado'}
                      </td>
                      <td className="py-2 pr-2">
                        {c.animal.dataNascimento ? formatarDataNascimento(c.animal.dataNascimento) : '—'}
                      </td>
                      <td className="py-2 pr-2">
                        {c.idadeEmMeses != null ? formatarIdadeEmMeses(c.idadeEmMeses) : 'não disponível'}
                      </td>
                      <td className="py-2 pr-2">
                        {c.pesoUltimaPesagemKg != null ? `${c.pesoUltimaPesagemKg} kg` : 'sem peso ainda'}
                      </td>
                      <td className="py-2 pr-2">
                        {c.dataUltimaPesagem != null
                          ? format(parseISO(c.dataUltimaPesagem), 'dd/MM/yyyy')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cartao>
        )}

        <Cartao>
          <p className="mb-2 text-lg font-semibold">Situação</p>
          <div className="flex flex-wrap gap-2">
            {SITUACOES.map((s) => (
              <button
                key={s.valor}
                type="button"
                onClick={() => aoMudarSituacao(s.valor)}
                className={`min-h-12 rounded-xl border-2 px-4 text-lg font-medium ${
                  animal.situacao === s.valor
                    ? 'border-verde bg-verde-claro text-verde-escuro'
                    : 'border-borda bg-white text-texto'
                }`}
              >
                {s.rotulo}
              </button>
            ))}
          </div>
        </Cartao>

        {pesagens.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Pesagens</p>
            <ul className="flex flex-col gap-1">
              {pesagens.map((p) => (
                <li key={p.id} className="text-lg">
                  {p.data ?? 'sem data'}: {p.pesoKg != null ? `${p.pesoKg} kg` : 'sem peso'}
                </li>
              ))}
            </ul>
            {ganhoDiario != null && (
              <p className="mt-2 text-base text-texto-suave">
                Ganho médio: {ganhoDiario.toFixed(2)} kg/dia
              </p>
            )}
          </Cartao>
        )}

        {vendas.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Vendas</p>
            <ul className="flex flex-col gap-1">
              {vendas.map((v) => (
                <li key={v.id} className="text-lg">
                  {v.data ?? 'sem data'} · {v.pesoKg ?? '—'} kg · {v.comprador ?? 'comprador não informado'}
                </li>
              ))}
            </ul>
          </Cartao>
        )}

        {mortes.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Morte</p>
            {mortes.map((m) => (
              <p key={m.id} className="text-lg">
                {m.data ?? 'sem data'} · {m.causaProvavel ?? 'causa não informada'}
              </p>
            ))}
          </Cartao>
        )}

        {mudancas.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Histórico de categoria</p>
            <ul className="flex flex-col gap-1">
              {mudancas.map((m) => (
                <li key={m.id} className="text-lg">
                  {m.data ?? 'sem data'}: {m.categoriaAnterior ?? '—'} → {m.categoriaNova}
                </li>
              ))}
            </ul>
          </Cartao>
        )}

        <Cartao>
          <CampoTexto
            rotulo="Observações"
            valor={observacoes}
            aoAlterar={setObservacoes}
            placeholder="Opcional"
          />
          <Botao variante="secundario" className="mt-3" onClick={aoSalvarObservacoes}>
            Salvar observações
          </Botao>
        </Cartao>

        <Botao variante="neutro" onClick={() => navigate('/')}>
          Voltar para a tela inicial
        </Botao>
      </div>
    </PaginaBase>
  )
}
