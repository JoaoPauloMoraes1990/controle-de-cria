import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoTexto } from '../componentes/CampoTexto'
import { CampoNumero } from '../componentes/CampoNumero'
import { CampoData } from '../componentes/CampoData'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { SeletorSexo } from '../componentes/SeletorSexo'
import { Botao } from '../componentes/Botao'
import { Pendencias } from '../componentes/Pendencias'
import { registrarNascimento } from '../repositorio'
import { listarPendencias } from '../validacao/regras'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { ResultadoBusca } from '../dominio/identificacao'

export function Nascimento() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()

  const [numero, setNumero] = useState('')
  const [numeroAutoPreenchido, setNumeroAutoPreenchido] = useState(false)
  const [mae, setMae] = useState<ResultadoBusca | null>(null)
  const [sexo, setSexo] = useState<'M' | 'F' | undefined>()
  const [data, setData] = useState<string | undefined>()
  const [peso, setPeso] = useState<number | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  // O bezerro (macho) herda o número da mãe, pois é vendido logo após o
  // desmame. A bezerra recebe número definitivo próprio (a tatuagem já é o
  // número dela para sempre), então nunca é preenchido automaticamente.
  function aoSelecionarMae(resultado: ResultadoBusca) {
    setMae(resultado)
    if (sexo === 'M' && (!numero.trim() || numeroAutoPreenchido)) {
      setNumero(resultado.identificacaoCorrespondente.numero)
      setNumeroAutoPreenchido(true)
    }
  }

  function aoAlterarSexo(novoSexo: 'M' | 'F' | undefined) {
    setSexo(novoSexo)
    if (novoSexo === 'M' && mae && (!numero.trim() || numeroAutoPreenchido)) {
      setNumero(mae.identificacaoCorrespondente.numero)
      setNumeroAutoPreenchido(true)
    } else if (novoSexo !== 'M' && numeroAutoPreenchido) {
      setNumero('')
      setNumeroAutoPreenchido(false)
    }
  }

  function aoAlterarNumero(valor: string) {
    setNumero(valor)
    setNumeroAutoPreenchido(false)
  }

  const pendencias = listarPendencias('nascimento', { data, sexo })

  async function aoSalvar() {
    if (!numero.trim()) return
    setSalvando(true)
    await registrarNascimento({
      numero,
      maeId: mae?.animal.id,
      sexo,
      data,
      pesoKg: peso,
      observacoes: observacoes || undefined,
    })
    setSalvando(false)
    mostrar(`Nascimento do bezerro ${numero.trim()} salvo!`, { podeDesfazer: true })
    navigate('/')
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Nasceu um bezerro" />
      <div className="flex flex-col gap-5">
        <CampoBuscaAnimal
          rotulo="Mãe (opcional)"
          aoSelecionar={aoSelecionarMae}
          filtro={(r) => r.animal.categoria === 'vaca' || r.animal.categoria === 'novilha'}
        />
        <CampoTexto
          rotulo="Número (tatuagem)"
          valor={numero}
          aoAlterar={aoAlterarNumero}
          obrigatorio
          numerico
        />
        <SeletorSexo valor={sexo} aoAlterar={aoAlterarSexo} />
        <CampoData rotulo="Data do nascimento" valor={data} aoAlterar={setData} />
        <CampoNumero rotulo="Peso ao nascer (opcional)" valor={peso} aoAlterar={setPeso} sufixo="kg" />
        <CampoTexto
          rotulo="Observações"
          valor={observacoes}
          aoAlterar={setObservacoes}
          placeholder="Opcional"
        />
        <Pendencias itens={pendencias} />
        <Botao onClick={aoSalvar} disabled={!numero.trim() || salvando}>
          {salvando ? 'Salvando…' : 'Salvar nascimento'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
