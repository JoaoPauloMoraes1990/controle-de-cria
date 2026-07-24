import type { ReactNode } from 'react'

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-borda bg-white p-5 ${className}`}>{children}</div>
  )
}
