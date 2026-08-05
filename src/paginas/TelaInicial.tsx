import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/Botao'
import { BuscaInicial } from '../componentes/BuscaInicial'
import { MarcaDaguaLogo } from '../componentes/MarcaDaguaLogo'
import {
  obterUltimaAcao,
  obterConfiguracoes,
  desfazerUltimoLancamento,
  aplicarTransicoesAutomaticasDeCategoria,
} from '../repositorio'

const QUINZE_DIAS_EM_MS = 15 * 24 * 60 * 60 * 1000

export function TelaInicial() {
  const navigate = useNavigate()
  const [ultimaAcaoDescricao, setUltimaAcaoDescricao] = useState<string | null>(null)
  const [avisoBackup, setAvisoBackup] = useState(false)
  const [numerosViraramNovilha, setNumerosViraramNovilha] = useState<string[]>([])

  async function carregar() {
    const [ultima, config] = await Promise.all([obterUltimaAcao(), obterConfiguracoes()])
    setUltimaAcaoDescricao(ultima?.descricao ?? null)
    const ultimoBackup = config.ultimoBackupEm
    setAvisoBackup(!ultimoBackup || Date.now() - ultimoBackup > QUINZE_DIAS_EM_MS)
  }

  useEffect(() => {
    carregar()
    aplicarTransicoesAutomaticasDeCategoria().then((transicoes) => {
      if (transicoes.length > 0) {
        setNumerosViraramNovilha(transicoes.map((t) => t.numero))
      }
    })
  }, [])

  async function aoDesfazer() {
    await desfazerUltimoLancamento()
    setUltimaAcaoDescricao(null)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <MarcaDaguaLogo />
      <div className="mb-6 flex flex-col items-center text-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Fazenda São Lourenço"
          className="mb-1 h-28 w-auto drop-shadow-[0_6px_10px_rgba(74,46,26,0.35)]"
        />
        <h1 className="text-3xl font-bold text-marrom-escuro">Controle de Cria</h1>
      </div>

      <BuscaInicial />

      <div className="flex flex-col gap-3">
        <Botao onClick={() => navigate('/nascimento')}>Nasceu um bezerro</Botao>
        <Botao onClick={() => navigate('/pesagem')}>Pesar</Botao>
        <Botao onClick={() => navigate('/venda')}>Vendeu</Botao>
        <Botao onClick={() => navigate('/morte')} variante="secundario">
          Morreu
        </Botao>
        <Botao onClick={() => navigate('/numeros')} variante="secundario">
          Ver os números
        </Botao>
      </div>

      {numerosViraramNovilha.length > 0 && (
        <p className="mt-6 rounded-xl bg-verde-claro p-4 text-base text-verde-escuro">
          {numerosViraramNovilha.length === 1
            ? `A bezerra ${numerosViraramNovilha[0]} completou 8 meses e virou novilha.`
            : `As bezerras ${numerosViraramNovilha.join(', ')} completaram 8 meses e viraram novilhas.`}
        </p>
      )}

      {ultimaAcaoDescricao && (
        <button
          type="button"
          onClick={aoDesfazer}
          className="mt-6 block w-full text-center text-lg font-medium text-atencao underline"
        >
          Desfazer: {ultimaAcaoDescricao}
        </button>
      )}

      {avisoBackup && (
        <p className="mt-6 rounded-xl bg-atencao-claro p-4 text-base text-atencao">
          Faz tempo que você não guarda uma cópia dos dados.{' '}
          <button
            type="button"
            onClick={() => navigate('/backup')}
            className="font-semibold underline"
          >
            Fazer backup agora
          </button>
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate('/financeiro/numeros')}
        className="mt-8 block w-full text-center text-base text-texto-suave underline"
      >
        Despesas e custos
      </button>

      <button
        type="button"
        onClick={() => navigate('/backup')}
        className="mt-3 block w-full text-center text-base text-texto-suave underline"
      >
        Copiar dados / restaurar backup
      </button>
    </div>
  )
}
