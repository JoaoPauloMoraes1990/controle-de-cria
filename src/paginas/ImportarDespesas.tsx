import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Cartao } from '../componentes/Cartao'
import { Botao } from '../componentes/Botao'
import { importarDespesasEmMassa, type LinhaImportacaoDespesa } from '../repositorio/financeiro'
import { CATEGORIAS_DESPESA, COMPORTAMENTOS_DESPESA, formatarReais } from '../utilitarios/despesas'
import type { CategoriaDespesa, ComportamentoDespesa } from '../db'

interface LinhaCsv {
  nome?: string
  categoria?: string
  comportamento?: string
  data?: string
  valor?: string
}

function ehCategoriaValida(v: string | undefined): v is CategoriaDespesa {
  return !!v && (CATEGORIAS_DESPESA as string[]).includes(v)
}

function ehComportamentoValido(v: string | undefined): v is ComportamentoDespesa {
  return !!v && (COMPORTAMENTOS_DESPESA as string[]).includes(v)
}

export function ImportarDespesas() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const [linhasValidas, setLinhasValidas] = useState<LinhaImportacaoDespesa[]>([])
  const [linhasIgnoradas, setLinhasIgnoradas] = useState(0)
  const [processando, setProcessando] = useState(false)
  const [resultado, setResultado] = useState<{ totalLinhas: number; itensCriados: number; valorTotal: number } | null>(
    null,
  )

  function aoEscolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setResultado(null)
    setNomeArquivo(arquivo.name)

    Papa.parse<LinhaCsv>(arquivo, {
      header: true,
      skipEmptyLines: true,
      complete: (resultadoParse) => {
        const validas: LinhaImportacaoDespesa[] = []
        let ignoradas = 0

        for (const linha of resultadoParse.data) {
          const nome = linha.nome?.trim()
          const categoria = linha.categoria?.trim()
          const comportamento = linha.comportamento?.trim()
          const valor = linha.valor != null && linha.valor !== '' ? Number(linha.valor) : undefined

          if (!nome || !ehCategoriaValida(categoria) || !ehComportamentoValido(comportamento)) {
            ignoradas++
            continue
          }

          validas.push({
            nome,
            categoria,
            comportamento,
            data: linha.data?.trim() || undefined,
            valor: valor != null && !Number.isNaN(valor) ? valor : undefined,
          })
        }

        setLinhasValidas(validas)
        setLinhasIgnoradas(ignoradas)
      },
    })
  }

  async function aoConfirmarImportacao() {
    if (linhasValidas.length === 0) return
    setProcessando(true)
    const resultadoImportacao = await importarDespesasEmMassa(linhasValidas)
    setProcessando(false)
    setResultado(resultadoImportacao)
    setLinhasValidas([])
    setNomeArquivo(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const valorTotalPreview = linhasValidas.reduce((soma, l) => soma + (l.valor ?? 0), 0)

  return (
    <PaginaBase>
      <Cabecalho titulo="Importar despesas" />
      <div className="flex flex-col gap-5">
        <Cartao>
          <p className="mb-3 text-lg">
            Importa várias despesas de uma vez, a partir de uma planilha em CSV com as colunas:{' '}
            <b>nome, categoria, comportamento, data, valor</b>.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={aoEscolherArquivo}
            className="text-lg"
          />
        </Cartao>

        {nomeArquivo && linhasValidas.length > 0 && (
          <Cartao>
            <p className="mb-2 text-lg font-semibold">Prévia do arquivo "{nomeArquivo}"</p>
            <p className="text-base">
              {linhasValidas.length} despesas prontas para importar, somando{' '}
              {formatarReais(valorTotalPreview)}.
            </p>
            {linhasIgnoradas > 0 && (
              <p className="mt-2 text-base text-atencao">
                {linhasIgnoradas} linha(s) ignorada(s) por faltar nome, categoria ou comportamento
                válido.
              </p>
            )}
            <Botao className="mt-4" onClick={aoConfirmarImportacao} disabled={processando}>
              {processando ? 'Importando…' : `Importar ${linhasValidas.length} despesas`}
            </Botao>
          </Cartao>
        )}

        {nomeArquivo && linhasValidas.length === 0 && (
          <Cartao>
            <p className="text-base text-atencao">
              Não encontrei nenhuma linha válida em "{nomeArquivo}". Confira se a primeira linha do
              arquivo tem os nomes das colunas: nome, categoria, comportamento, data, valor.
            </p>
          </Cartao>
        )}

        {resultado && (
          <Cartao>
            <p className="text-lg font-semibold text-verde-escuro">Importação concluída!</p>
            <p className="mt-2 text-base">
              {resultado.totalLinhas} despesas importadas, somando {formatarReais(resultado.valorTotal)}.
              {resultado.itensCriados > 0 && ` ${resultado.itensCriados} itens novos foram classificados.`}
            </p>
            <Botao
              variante="secundario"
              className="mt-4"
              onClick={() => navigate('/financeiro/numeros')}
            >
              Ver números do dinheiro
            </Botao>
          </Cartao>
        )}
      </div>
    </PaginaBase>
  )
}
