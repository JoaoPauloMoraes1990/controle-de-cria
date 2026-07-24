import { useNavigate } from 'react-router-dom'

interface CabecalhoProps {
  titulo: string
}

export function Cabecalho({ titulo }: CabecalhoProps) {
  const navigate = useNavigate()
  return (
    <header className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Voltar para a tela inicial"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-borda bg-white text-2xl"
      >
        ←
      </button>
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        aria-hidden="true"
        className="h-11 w-auto shrink-0"
      />
      <h1 className="text-2xl font-bold text-texto">{titulo}</h1>
    </header>
  )
}
