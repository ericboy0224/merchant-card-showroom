import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { catalog } from '@/domain/catalog'
import { cardRecords } from '@/domain/fixtures'
import { resolveCard } from '@/domain/resolve'
import type { CardData } from '@/domain/card'
import { registerBadge } from '@/plugins'
import { Card } from './Card'

const render = (data: CardData, variant: keyof typeof catalog) =>
  renderToString(<Card resolved={resolveCard(data, catalog[variant])} />)

describe('Card', () => {
  it.each(cardRecords)('renders $data.id to a string', ({ variant, data }) => {
    const html = render(data, variant)
    expect(html).toContain(data.title.replace(/&/g, '&amp;'))
    expect(html).toContain(`data-variant="${variant}"`)
  })

  it('uses the vertical template for search-result and the horizontal one for live-sidebar', () => {
    const base = { id: 'a', title: 'T', price: 10, image: 'x' }
    expect(render(base, 'search-result')).toContain('vertical')
    expect(render(base, 'live-sidebar')).toContain('horizontal')
  })

  it('renders a card that has only the Required Core', () => {
    const html = render({ id: 'a', title: 'Bare', price: 5, image: 'x' }, 'search-result')
    expect(html).toContain('Bare')
    expect(html).toContain('NT$5')
    expect(html).not.toContain('★')
  })

  it('renders the action button in the horizontal layout only', () => {
    const data = { id: 'a', title: 'T', price: 10, image: 'x', action: { label: 'Buy now' } }
    expect(render(data, 'live-sidebar')).toContain('Buy now')
    expect(render(data, 'search-result')).not.toContain('Buy now')
  })

  it('renders nothing for an unknown badge type', () => {
    const data = { id: 'a', title: 'T', price: 10, image: 'x', badges: [{ type: 'nope', placement: 'chip' as const, label: 'GHOST' }] }
    expect(render(data, 'search-result')).not.toContain('GHOST')
  })

  it('adds the Ad marker for the sponsored Flag', () => {
    const data = { id: 'a', title: 'T', price: 10, image: 'x' }
    expect(render({ ...data, flags: ['sponsored'] }, 'search-result')).toContain('<span>Ad</span>')
    expect(render(data, 'search-result')).not.toContain('>Ad<')
  })

  it('renders a badge from a plugin that registers later', () => {
    registerBadge('test-store', { placement: 'chip', appliesTo: (c) => c.id === 'plug', render: () => 'Plugged' })
    expect(render({ id: 'plug', title: 'T', price: 1, image: 'x' }, 'search-result')).toContain('Plugged')
  })
})
