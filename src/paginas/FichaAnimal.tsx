import { useEffect, useState } from 'react'
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
  atualizarAnimal,
} from '../repositorio'
import type { AnimalComId } from '../dominio/identificacao'
import { calcularGanhoPesoDiario } from '../dominio/ganhoPeso'
import type {
  Identificacao,
  Pesagem,
  Venda,
  Morte,
  MudancaCategoria,
  Situacao,
} from '../db'

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
          {animal.dataNascimento && <p className="text-lg">Nasceu em {animal.dataNascimento}</p>}
        </Cartao>

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
