import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { CampoBuscaAnimal } from '../componentes/CampoBuscaAnimal'
import { CampoNumero } from '../componentes/CampoNumero'
import { CampoData } from '../componentes/CampoData'
import { CampoTexto } from '../componentes/CampoTexto'
import { Botao } from '../componentes/Botao'
import { registrarVenda } from '../repositorio'
import { kgParaArroba } from '../dominio/arroba'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'
import type { ResultadoBusca } from '../dominio/identificacao'

interface ItemCarrinho {
  resultado: ResultadoBusca
  pesoKg: number | undefined
}

export function Venda() {
  const navigate = useNavigate()
  const { mostrar } = useConfirmacao()

  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [data, setData] = useState<string | undefined>()
  const [comprador, setComprador] = useState('')
  const [precoPorArroba, setPrecoPorArroba] = useState<number | undefined>()
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  function adicionar(resultado: ResultadoBusca) {
    setItens((atual) =>
      atual.some((i) => i.resultado.animal.id === resultado.animal.id)
        ? atual
        : [...atual, { resultado, pesoKg: undefined }],
    )
  }

  function remover(animalId: number) {
    setItens((atual) => atual.filter((i) => i.resultado.animal.id !== animalId))
  }

  function alterarPeso(animalId: number, pesoKg: number | undefined) {
    setItens((atual) =>
      atual.map((i) => (i.resultado.animal.id === animalId ? { ...i, pesoKg } : i)),
    )
  }

  async function aoSalvar() {
    if (itens.length === 0) return
    setSalvando(true)
    await registrarVenda({
      data,
      comprador: comprador || undefined,
      precoPorArroba,
      observacoes: observacoes || undefined,
      itens: itens.map((i) => ({ animalId: i.resultado.animal.id, pesoKg: i.pesoKg })),
    })
    setSalvando(false)
    mostrar(itens.length > 1 ? `Venda de ${itens.length} animais salva!` : 'Venda salva!', {
      podeDesfazer: true,
    })
    navigate('/')
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Vendeu" />
      <div className="flex flex-col gap-5">
        <CampoBuscaAnimal rotulo="Adicionar animal" aoSelecionar={adicionar} />

        {itens.length > 0 && (
          <ul className="flex flex-col gap-3">
            {itens.map((item) => (
              <li key={item.resultado.animal.id} className="rounded-xl border border-borda bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {item.resultado.identificacaoCorrespondente.numero}
                  </span>
                  <button
                    type="button"
                    onClick={() => remover(item.resultado.animal.id)}
                    className="text-base text-atencao underline"
                  >
                    Remover
                  </button>
                </div>
                <CampoNumero
                  rotulo="Peso"
                  valor={item.pesoKg}
                  aoAlterar={(v) => alterarPeso(item.resultado.animal.id, v)}
                  sufixo={item.pesoKg != null ? `≈ ${kgParaArroba(item.pesoKg).toFixed(2)} @` : 'kg'}
                />
              </li>
            ))}
          </ul>
        )}

        <CampoData rotulo="Data da venda" valor={data} aoAlterar={setData} />
        <CampoNumero rotulo="Preço por arroba" valor={precoPorArroba} aoAlterar={setPrecoPorArroba} sufixo="R$" />
        <CampoTexto rotulo="Comprador" valor={comprador} aoAlterar={setComprador} placeholder="Opcional" />
        <CampoTexto
          rotulo="Observações"
          valor={observacoes}
          aoAlterar={setObservacoes}
          placeholder="Opcional"
        />

        <Botao onClick={aoSalvar} disabled={itens.length === 0 || salvando}>
          {salvando
            ? 'Salvando…'
            : itens.length > 1
              ? `Salvar venda de ${itens.length} animais`
              : 'Salvar venda'}
        </Botao>
      </div>
    </PaginaBase>
  )
}
