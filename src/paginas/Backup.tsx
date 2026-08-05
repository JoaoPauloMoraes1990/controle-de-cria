import { useRef, useState, type ChangeEvent } from 'react'
import { format } from 'date-fns'
import { Cabecalho } from '../componentes/Cabecalho'
import { PaginaBase } from '../componentes/PaginaBase'
import { Botao } from '../componentes/Botao'
import { Cartao } from '../componentes/Cartao'
import { gerarBackupCompleto, restaurarBackupCompleto, gerarCsvsExportacao } from '../repositorio/backup'
import { baixarArquivo, lerArquivoComoTexto } from '../utilitarios/arquivo'
import { useConfirmacao } from '../componentes/ConfirmacaoContexto'

export function Backup() {
  const { mostrar } = useConfirmacao()
  const inputRef = useRef<HTMLInputElement>(null)
  const [confirmandoRestauracao, setConfirmandoRestauracao] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoExportarBackup() {
    setProcessando(true)
    const conteudo = await gerarBackupCompleto()
    const nomeArquivo = `controle-de-cria-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    baixarArquivo(nomeArquivo, conteudo, 'application/json')
    setProcessando(false)
    mostrar('Backup salvo no aparelho.')
  }

  async function aoExportarCsv() {
    setProcessando(true)
    const csvs = await gerarCsvsExportacao()
    const dataHoje = format(new Date(), 'yyyy-MM-dd')
    baixarArquivo(`animais-${dataHoje}.csv`, csvs.animais, 'text/csv')
    baixarArquivo(`pesagens-${dataHoje}.csv`, csvs.pesagens, 'text/csv')
    baixarArquivo(`vendas-${dataHoje}.csv`, csvs.vendas, 'text/csv')
    baixarArquivo(`mortes-${dataHoje}.csv`, csvs.mortes, 'text/csv')
    setProcessando(false)
    mostrar('Planilhas CSV salvas no aparelho.')
  }

  function aoEscolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    setErro(null)
    if (arquivo) setConfirmandoRestauracao(arquivo)
  }

  async function confirmarRestauracao() {
    if (!confirmandoRestauracao) return
    setProcessando(true)
    try {
      const texto = await lerArquivoComoTexto(confirmandoRestauracao)
      await restaurarBackupCompleto(texto)
      mostrar('Dados restaurados a partir do backup.')
      setConfirmandoRestauracao(null)
    } catch {
      setErro('Não consegui ler esse arquivo como backup do Controle de Cria.')
    }
    setProcessando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <PaginaBase>
      <Cabecalho titulo="Backup" />
      <div className="flex flex-col gap-5">
        <Cartao>
          <p className="mb-3 text-lg">
            Guarde uma cópia de tudo para não perder nada se o celular quebrar ou for trocado.
          </p>
          <Botao onClick={aoExportarBackup} disabled={processando}>
            Salvar cópia completa
          </Botao>
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg">Planilhas separadas, para abrir no computador.</p>
          <Botao variante="secundario" onClick={aoExportarCsv} disabled={processando}>
            Exportar planilhas (CSV)
          </Botao>
        </Cartao>

        <Cartao>
          <p className="mb-3 text-lg">
            Restaurar substitui todos os dados do aparelho pelos dados do arquivo escolhido.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            onChange={aoEscolherArquivo}
            className="hidden"
          />
          <Botao variante="secundario" onClick={() => inputRef.current?.click()}>
            Escolher arquivo do backup
          </Botao>
          {erro && <p className="mt-2 text-base text-atencao">{erro}</p>}
        </Cartao>

        {confirmandoRestauracao && (
          <Cartao className="border-atencao bg-atencao-claro">
            <p className="mb-3 text-lg text-atencao">
              Isso vai apagar os dados atuais do aparelho e colocar no lugar os dados do arquivo "
              {confirmandoRestauracao.name}". Tem certeza?
            </p>
            <div className="flex gap-3">
              <Botao variante="atencao" onClick={confirmarRestauracao} disabled={processando}>
                Sim, restaurar
              </Botao>
              <Botao
                variante="secundario"
                onClick={() => {
                  setConfirmandoRestauracao(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                Cancelar
              </Botao>
            </div>
          </Cartao>
        )}
      </div>
    </PaginaBase>
  )
}
