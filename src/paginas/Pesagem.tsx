import { useState } from 'react'
import { format } from 'date-fns'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { CampoNumero } from '../componentes/CampoNumero'
import { CampoData } from '../componentes/CampoData'
import { Botao } from '../componentes/Botao'
import { registrarPesagem } from '../repositorio'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { ResultadoBusca } from '../dominio/identificacao'

export function Pesagem() {
  const { mostrar } = useConfirmacao()
  const [animal, setAnimal] = useState<ResultadoBusca | null>(null)
  const [peso, setPeso] = useState<number | undefined>()
  const [data, setData] = useState<string | undefined>(format(new Date(), 'yyyy-MM-dd'))
  const [salvando, setSalvando] = useState(false)
  const [contador, setContador] = useState(0)

  async function aoSalvar() {
    if (!animal) return
    setSalvando(true)
    await registrarPesagem({ animalId: animal.animal.id, data, pesoKg: peso })
    setSalvando(false)
    mostrar(
      peso != null
        ? `Peso de ${animal.identificacaoCorrespondente.numero} salvo: ${peso} kg`
        : `Pesagem de ${animal.identificacaoCorrespondente.numero} salva`,
      { podeDesfazer: true },
    )
    setContador((c) => c + 1)
    setAnimal(null)
    setPeso(undefined)
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Pesar" />
      {contador > 0 && (
        <p className="mb-4 text-lg text-verde-escuro">
          {contador} pesagem{contador > 1 ? 'ns' : ''} salva{contador > 1 ? 's' : ''} agora há pouco.
        </p>
      )}
      <div className="flex flex-col gap-5">
        {!animal ? (
          <CampoBuscaAnimal rotulo="Animal" aoSelecionar={setAnimal} />
        ) : (
          <div className="rounded-xl border border-verde bg-verde-claro p-4">
            <p className="text-lg font-semibold text-verde-escuro">
              Animal: {animal.identificacaoCorrespondente.numero}
            </p>
            <button
              type="button"
              onClick={() => setAnimal(null)}
              className="text-base text-verde-escuro underline"
            >
              Trocar animal
            </button>
          </div>
        )}
        <CampoNumero rotulo="Peso" valor={peso} aoAlterar={setPeso} sufixo="kg" autoFoco={!!animal} />
        <CampoData rotulo="Data da pesagem" valor={data} aoAlterar={setData} />
        <Botao onClick={aoSalvar} disabled={!animal || salvando}>
          {salvando ? 'Salvando…' : 'Salvar e ir para o próximo'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
