import { describe, expect, it } from 'vitest'
import { cardDataSchema, cardPresetSchema, cardRecordSchema } from './card'
import { catalog } from './catalog'
import { cardRecords } from './fixtures'

const core = { id: 'a', title: 'Item', price: 10, image: 'x.png' }

describe('cardDataSchema', () => {
  it('accepts the Required Core alone', () => {
    expect(cardDataSchema.safeParse(core).success).toBe(true)
  })

  it('accepts Card Data with every Optional Group', () => {
    const full = {
      ...core,
      pricing: { original: 20, note: 'discounted' },
      rating: { score: 4.5, count: 3 },
      sales: { text: '>10' },
      slogan: 'Hi',
      badges: [{ type: 'event', placement: 'overlay', label: 'Sale' }],
      action: { label: 'Buy' },
      media: { kind: 'video', src: 'v.mp4' },
      flags: ['sponsored'],
    }
    expect(cardDataSchema.safeParse(full).success).toBe(true)
  })

  it.each([
    ['a missing title', { ...core, title: undefined }],
    ['an empty title', { ...core, title: '  ' }],
    ['a negative price', { ...core, price: -1 }],
    ['a rating above 5', { ...core, rating: { score: 6, count: 1 } }],
    ['a badge with a bad placement', { ...core, badges: [{ type: 'x', placement: 'top' }] }],
    ['an empty carousel', { ...core, media: { kind: 'carousel', images: [] } }],
  ])('rejects %s', (_name, input) => {
    expect(cardDataSchema.safeParse(input).success).toBe(false)
  })
})

describe('fixtures', () => {
  it('are all valid card records', () => {
    for (const record of cardRecords) expect(cardRecordSchema.safeParse(record).success).toBe(true)
  })

  it('have unique ids', () => {
    const ids = cardRecords.map((r) => r.data.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cover every Card Variant', () => {
    const variants = new Set(cardRecords.map((r) => r.variant))
    expect([...variants].sort()).toEqual(Object.keys(catalog).sort())
  })
})

describe('catalog', () => {
  it.each(Object.entries(catalog))('Preset %s passes the schema', (key, preset) => {
    expect(cardPresetSchema.safeParse(preset).success).toBe(true)
    expect(preset.id).toBe(key)
    expect(preset.surface).toBeTruthy()
    expect(preset.rationale.length).toBeGreaterThan(0)
  })

  it('rejects a Preset without surface or rationale', () => {
    const { surface: _s, ...noSurface } = catalog['live-sidebar']
    const { rationale: _r, ...noRationale } = catalog['live-sidebar']
    expect(cardPresetSchema.safeParse(noSurface).success).toBe(false)
    expect(cardPresetSchema.safeParse(noRationale).success).toBe(false)
  })
})
