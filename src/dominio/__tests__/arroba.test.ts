import { describe, expect, it } from 'vitest'
import { arrobaParaKg, kgParaArroba } from '../arroba'

describe('arroba', () => {
  it('converte quilos em arrobas (30kg = 1@)', () => {
    expect(kgParaArroba(180)).toBe(6)
    expect(kgParaArroba(30)).toBe(1)
    expect(kgParaArroba(0)).toBe(0)
  })

  it('converte arrobas em quilos', () => {
    expect(arrobaParaKg(6)).toBe(180)
    expect(arrobaParaKg(1)).toBe(30)
  })

  it('é reversível', () => {
    expect(arrobaParaKg(kgParaArroba(255))).toBe(255)
  })
})
