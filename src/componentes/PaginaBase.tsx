import type { ReactNode } from 'react'
import { MarcaDaguaLogo } from './MarcaDaguaLogo'

export function PaginaBase({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-6 lg:max-w-5xl">
      <MarcaDaguaLogo />
      {children}
    </div>
  )
}
