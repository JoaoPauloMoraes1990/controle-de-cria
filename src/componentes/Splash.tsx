export function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-fundo">
      <img
        src="/logo.png"
        alt="Fazenda São Lourenço"
        className="h-40 w-auto drop-shadow-[0_6px_10px_rgba(74,46,26,0.35)]"
      />
      <p className="text-lg font-medium text-marrom-escuro">Controle de Cria</p>
    </div>
  )
}
