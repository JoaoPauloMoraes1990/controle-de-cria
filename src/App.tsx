import { useEffect, useState } from 'react'
import { ConfirmacaoProvider } from './componentes/ConfirmacaoContexto'
import { Splash } from './componentes/Splash'
import { Rotas } from './rotas'

const DURACAO_SPLASH_MS = 700

function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setMostrarSplash(false), DURACAO_SPLASH_MS)
    return () => window.clearTimeout(temporizador)
  }, [])

  return (
    <ConfirmacaoProvider>
      {mostrarSplash && <Splash />}
      <Rotas />
    </ConfirmacaoProvider>
  )
}

export default App
