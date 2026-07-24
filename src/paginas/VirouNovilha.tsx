import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { CampoTexto } from '../componentes/CampoTexto'
import { CampoData } from '../componentes/CampoData'
import { Botao } from '../componentes/Botao'
import { registrarVirouNovilha } from '../repositorio'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { ResultadoBusca } from '../dominio/identificacao'

export function VirouNovilha() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()

  const [animal, setAnimal] = useState<ResultadoBusca | null>(null)
  const [numeroNovo, setNumeroNovo] = useState('')
  const [data, setData] = useState<string | undefined>()
  const [salvando, setSalvando] = useState(false)

  async function aoSalvar() {
    if (!animal || !numeroNovo.trim()) return
    setSalvando(true)
    await registrarVirouNovilha({ animalId: animal.animal.id, numeroNovo, data })
    setSalvando(false)
    mostrar(`${animal.identificacaoCorrespondente.numero} agora é a novilha ${numeroNovo.trim()}.`, {
      podeDesfazer: true,
    })
    navigate('/')
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Virou novilha" />
      <div className="flex flex-col gap-5">
        <CampoBuscaAnimal
          rotulo="Bezerra"
          aoSelecionar={setAnimal}
          filtro={(r) => r.animal.categoria === 'bezerra' || r.animal.sexo === 'F'}
        />
        <CampoTexto
          rotulo="Número novo (definitivo)"
          valor={numeroNovo}
          aoAlterar={setNumeroNovo}
          obrigatorio
          numerico
        />
        <CampoData rotulo="Data" valor={data} aoAlterar={setData} />
        <Botao onClick={aoSalvar} disabled={!animal || !numeroNovo.trim() || salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
