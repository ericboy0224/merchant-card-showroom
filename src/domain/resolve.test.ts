import { describe, expect, it } from 'vitest'
import type { CardData, CardOverride } from './card'
import { catalog } from './catalog'
import { buildPatch, resolveCard, toEditable } from './resolve'

const base: CardData = {
  id: 'c1',
  title: 'Base',
  price: 100,
  image: 'x.png',
  pricing: { original: 150 },
  rating: { score: 4, count: 10 },
  sales: { text: '>5' },
  action: { label: 'Buy' },
}

const override = (patch: CardOverride['patch']): CardOverride => ({ cardId: 'c1', updatedAt: 1, patch })

describe('resolveCard', () => {
  it('returns the Card Data unchanged when there is no Override', () => {
    const r = resolveCard(base, catalog['search-result'])
    expect(r.card.title).toBe('Base')
    expect(r.layout).toBe('vertical')
    expect(r.variant).toBe('search-result')
  })

  it('applies an Override', () => {
    const r = resolveCard(base, catalog['search-result'], override({ title: 'New', price: 80 }))
    expect(r.card).toMatchObject({ title: 'New', price: 80 })
  })

  it('does not change the input', () => {
    resolveCard(base, catalog['search-result'], override({ title: 'New' }))
    expect(base.title).toBe('Base')
  })

  it('removes a field when the Override holds null', () => {
    const r = resolveCard(base, catalog['search-result'], override({ rating: null, pricing: { original: null } }))
    expect(r.card.rating).toBeUndefined()
    expect(r.card.pricing).toBeUndefined()
  })

  it('keeps the other pricing fields when it removes the original price', () => {
    const data = { ...base, pricing: { original: 150, note: 'n' } }
    const r = resolveCard(data, catalog['search-result'], override({ pricing: { original: null } }))
    expect(r.card.pricing).toEqual({ note: 'n' })
  })

  it('drops the Optional Groups that the Preset does not list', () => {
    const r = resolveCard(base, catalog['live-sidebar'])
    expect(r.card.pricing).toBeUndefined()
    expect(r.card.sales).toBeUndefined()
    expect(r.card.rating).toEqual(base.rating)
    expect(r.card.action).toEqual(base.action)
    expect(r.layout).toBe('horizontal')
  })
})

describe('buildPatch', () => {
  it('is empty when nothing changed', () => {
    expect(buildPatch(base, toEditable(base))).toEqual({})
  })

  it('holds only the changed fields', () => {
    const edited = { ...toEditable(base), title: 'T2', originalPrice: null }
    expect(buildPatch(base, edited)).toEqual({ title: 'T2', pricing: { original: null } })
  })
})
