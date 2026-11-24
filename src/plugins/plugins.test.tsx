import { describe, expect, it, vi } from 'vitest'
import type { CardData } from '@/domain/card'
import { badgeRegistry, badgesFor } from './badges'
import './builtin'
import { createRegistry } from './registry'

const card = (extra: Partial<CardData> = {}): CardData => ({ id: 'c', title: 'T', price: 1, image: 'x', ...extra })

describe('registry', () => {
  it('stores values, changes version, and notifies', () => {
    const r = createRegistry<number>()
    const listener = vi.fn()
    r.subscribe(listener)
    const v = r.getVersion()
    r.register('a', 1)
    expect(r.get('a')).toBe(1)
    expect(r.get('b')).toBeUndefined()
    expect(r.getVersion()).toBe(v + 1)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('badgesFor', () => {
  it('renders a known badge type', () => {
    const out = badgesFor(card({ badges: [{ type: 'coupon', placement: 'chip', label: 'Save' }] }))
    expect(out).toMatchObject([{ placement: 'chip', node: 'Save' }])
  })

  it('renders nothing for an unknown badge type', () => {
    expect(badgesFor(card({ badges: [{ type: 'nope', placement: 'chip', label: 'X' }] }))).toEqual([])
  })

  it('adds the sponsored badge for the sponsored Flag only', () => {
    expect(badgesFor(card({ flags: ['sponsored'] })).map((b) => b.key)).toEqual(['plugin-sponsored'])
    expect(badgesFor(card())).toEqual([])
  })

  it('applies a badge that is registered later, and survives a broken plugin', () => {
    badgeRegistry.register('test-late', { placement: 'chip', appliesTo: (c) => c.price === 99, render: () => 'Late' })
    badgeRegistry.register('test-broken', {
      placement: 'chip',
      appliesTo: () => {
        throw new Error('boom')
      },
      render: () => 'Broken',
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(badgesFor(card({ price: 99 })).map((b) => b.node)).toEqual(['Late'])
  })
})
