import { describe, expect, it } from 'vitest'
import { parseForm, toForm } from './form'

const card = { id: 'a', title: 'T', price: 10, image: 'x', pricing: { original: 20 }, rating: { score: 4, count: 2 } }

describe('parseForm', () => {
  it('round-trips an unchanged card', () => {
    const r = parseForm(toForm(card))
    expect(r).toMatchObject({ ok: true, data: { title: 'T', price: 10, originalPrice: 20, rating: { score: 4, count: 2 } } })
  })

  it('treats empty original price and empty rating as no value', () => {
    const r = parseForm({ ...toForm(card), original: '', ratingScore: '', ratingCount: '' })
    expect(r).toMatchObject({ ok: true, data: { originalPrice: null, rating: null } })
  })

  it('reports an empty title, a bad price, and a half-filled rating', () => {
    const r = parseForm({ ...toForm(card), title: ' ', price: 'abc', ratingCount: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['price', 'rating', 'title'])
  })

  it('rejects a rating above 5', () => {
    const r = parseForm({ ...toForm(card), ratingScore: '6' })
    expect(r.ok).toBe(false)
  })
})
