import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoTexto } from '../componentes/CampoTexto'
import { CampoData } from '../componentes/CampoData'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { SeletorSexo } from '../componentes/SeletorSexo'
import { Botao } from '../componentes/Botao'
import { cadastrarAnimal } from '../repositorio'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { Categoria } from '../db'
import type { ResultadoBusca } from '../dominio/identificacao'

const CATEGORIAS: { valor: Categoria; rotulo: string }[] = [
  { valor: 'bezerro', rotulo: 'Bezerro' },
  { valor: 'bezerra', rotulo: 'Bezerra' },
  { valor: 'novilha', rotulo: 'Novilha' },
  { valor: 'vaca', rotulo: 'Vaca' },
  { valor: 'touro', rotulo: 'Touro' },
]

export function CadastrarAnimal() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()
  const [params] = useSearchParams()

  const [numero, setNumero] = useState(params.get('numero') ?? '')
  const [categoria, setCategoria] = useState<Categoria | undefined>()
  const [sexo, setSexo] = useState<'M' | 'F' | undefined>()
  const [dataNascimento, setDataNascimento] = useState<string | undefined>()
  const [mae, setMae] = useState<ResultadoBusca | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoSalvar() {
    if (!numero.trim()) return
    setSalvando(true)
    const id = await cadastrarAnimal({
      numero,
      categoria,
      sexo,
      dataNascimento,
      maeId: mae?.animal.id,
      observacoes: observacoes || undefined,
    })
    setSalvando(false)
    mostrar(`Animal ${numero.trim()} cadastrado!`, { podeDesfazer: true })
    navigate(`/animais/${id}`)
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Cadastrar animal" />
      <div className="flex flex-col gap-5">
        <CampoTexto rotulo="Número" valor={numero} aoAlterar={setNumero} obrigatorio autoFoco numerico />
        <div>
          <span className="mb-1 block text-lg font-medium text-texto">Categoria</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.valor}
                type="button"
                onClick={() => setCategoria(c.valor)}
                className={`min-h-12 rounded-xl border-2 px-4 text-lg font-medium ${
                  categoria === c.valor
                    ? 'border-verde bg-verde-claro text-verde-escuro'
                    : 'border-borda bg-white text-texto'
                }`}
              >
                {c.rotulo}
              </button>
            ))}
          </div>
        </div>
        <SeletorSexo valor={sexo} aoAlterar={setSexo} />
        <CampoData rotulo="Data de nascimento" valor={dataNascimento} aoAlterar={setDataNascimento} />
        <CampoBuscaAnimal
          rotulo="Mãe (opcional)"
          aoSelecionar={setMae}
          filtro={(r) => r.animal.categoria === 'vaca' || r.animal.categoria === 'novilha'}
        />
        <CampoTexto
          rotulo="Observações"
          valor={observacoes}
          aoAlterar={setObservacoes}
          placeholder="Opcional"
        />
        <Botao onClick={aoSalvar} disabled={!numero.trim() || salvando}>
          {salvando ? 'Salvando…' : 'Cadastrar'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
