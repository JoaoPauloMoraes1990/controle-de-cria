import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { obterIndicadoresReprodutivos } from '../repositorio/indicadores'
import { ordenarListaDescarte, type CandidatoDescarte } from '../dominio/listaDescarte'
import { formatarMesesEDias } from '../utilitarios/datas'

interface CandidatoComNumero extends CandidatoDescarte {
  numero: string
}

export function ListaDescarte() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState<CandidatoComNumero[] | null>(null)

  useEffect(() => {
    obterIndicadoresReprodutivos().then((dados) => {
      const lista: CandidatoComNumero[] = dados.desempenhoMatrizes.map((d) => ({
        matrizId: d.matrizId,
        numero: d.numero,
        intervaloMedioEntrePartos: d.intervaloMedioEntrePartos,
        anosConsecutivosSemParir: d.anosConsecutivosSemParir,
        diasMediosAte180kg: d.diasMediosAte180kg,
        temDadosSuficientes: d.temDadosSuficientes,
      }))
      setCandidatos(ordenarListaDescarte(lista) as CandidatoComNumero[])
    })
  }, [])

  return (
    <PaginaBase>
      <Cabecalho titulo="Lista de descarte sugerida" />
      <p className="mb-6 text-lg text-texto-suave">
        Matrizes ordenadas da que rendeu pior para a que rendeu melhor, considerando o intervalo
        entre partos, anos seguidos sem parir e a velocidade para entregar um bezerro de 180kg. A
        decisão de descartar é sempre sua — isso é só um retrato do histórico.
      </p>

      {!candidatos && <p className="text-lg text-texto-suave">Carregando…</p>}

      {candidatos && candidatos.length === 0 && (
        <p className="text-lg text-texto-suave">Nenhuma matriz cadastrada ainda.</p>
      )}

      <div className="flex flex-col gap-3">
        {candidatos?.map((c) => (
          <button
            key={c.matrizId}
            type="button"
            onClick={() => navigate(`/animais/${c.matrizId}`)}
            className="w-full text-left"
          >
            <Cartao className="hover:bg-verde-claro">
              <p className="text-xl font-bold text-marrom-escuro">{c.numero || '(sem número)'}</p>
              {c.temDadosSuficientes ? (
                <ul className="mt-2 flex flex-col gap-1 text-base text-texto-suave">
                  <li>
                    Intervalo entre partos:{' '}
                    {c.intervaloMedioEntrePartos != null
                      ? formatarMesesEDias(c.intervaloMedioEntrePartos)
                      : 'não disponível'}
                  </li>
                  <li>
                    Anos seguidos sem parir:{' '}
                    {c.anosConsecutivosSemParir > 0 ? c.anosConsecutivosSemParir : 'nenhum'}
                  </li>
                  <li>
                    Dias até um bezerro de 180kg:{' '}
                    {c.diasMediosAte180kg != null
                      ? `${Math.round(c.diasMediosAte180kg)} dias`
                      : 'não disponível'}
                  </li>
                </ul>
              ) : (
                <p className="mt-2 text-base text-texto-suave">Sem dados suficientes ainda.</p>
              )}
            </Cartao>
          </button>
        ))}
      </div>
    </PaginaBase>
  )
}
