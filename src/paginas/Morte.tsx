import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { CampoData } from '../componentes/CampoData'
import { CampoTexto } from '../componentes/CampoTexto'
import { Botao } from '../componentes/Botao'
import { registrarMorte } from '../repositorio'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { ResultadoBusca } from '../dominio/identificacao'

const CAUSAS = ['Doença', 'Predador', 'Complicação no parto', 'Acidente', 'Causa desconhecida', 'Outra']

export function Morte() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()

  const [animal, setAnimal] = useState<ResultadoBusca | null>(null)
  const [data, setData] = useState<string | undefined>()
  const [causa, setCausa] = useState<string | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoSalvar() {
    if (!animal) return
    setSalvando(true)
    await registrarMorte({
      animalId: animal.animal.id,
      data,
      causaProvavel: causa,
      observacoes: observacoes || undefined,
    })
    setSalvando(false)
    mostrar(`Morte de ${animal.identificacaoCorrespondente.numero} registrada.`, {
      podeDesfazer: true,
    })
    navigate('/')
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Morreu" />
      <div className="flex flex-col gap-5">
        <CampoBuscaAnimal rotulo="Animal" aoSelecionar={setAnimal} />
        <CampoData rotulo="Data" valor={data} aoAlterar={setData} />
        <div>
          <span className="mb-1 block text-lg font-medium text-texto">Causa provável</span>
          <div className="flex flex-wrap gap-2">
            {CAUSAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCausa(c)}
                className={`min-h-12 rounded-xl border-2 px-4 text-lg font-medium ${
                  causa === c
                    ? 'border-verde bg-verde-claro text-verde-escuro'
                    : 'border-borda bg-white text-texto'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <CampoTexto
          rotulo="Observações"
          valor={observacoes}
          aoAlterar={setObservacoes}
          placeholder="Opcional"
        />
        <Botao onClick={aoSalvar} disabled={!animal || salvando} variante="atencao">
          {salvando ? 'Salvando…' : 'Registrar morte'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
