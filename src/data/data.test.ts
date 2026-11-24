import { describe, expect, it, vi } from 'vitest'
import type { Logger } from './logger'
import { createMockRepository } from './repository'
import { createLocalStorageAdapter, createMemoryStorage, storageKey } from './storage'
import { createCardStore } from './store'
import { attachStorageSync } from './sync'
import { migrate } from './migrations'

function setup() {
  const backing = createMemoryStorage()
  const events: string[] = []
  const logger: Logger = { log: (e) => void events.push(e) }
  const adapter = createLocalStorageAdapter(backing, logger)
  let t = 1000
  const store = createCardStore(adapter, () => t++)
  return { backing, events, adapter, store }
}

describe('store', () => {
  it('saves an Override and reads it back, also from a new store', () => {
    const { store, adapter } = setup()
    store.save('c1', { title: 'New' })
    expect(store.getSnapshot().c1).toMatchObject({ cardId: 'c1', patch: { title: 'New' } })
    expect(createCardStore(adapter).getSnapshot().c1?.patch.title).toBe('New')
  })

  it('notifies subscribers and gives a new snapshot on each change', () => {
    const { store } = setup()
    const listener = vi.fn()
    const off = store.subscribe(listener)
    const before = store.getSnapshot()
    store.save('c1', { price: 5 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot()).not.toBe(before)
    off()
    store.save('c1', { price: 6 })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('removes the Override on reset and on an empty patch', () => {
    const { store, adapter } = setup()
    store.save('c1', { title: 'A' })
    store.save('c2', { title: 'B' })
    store.reset('c1')
    store.save('c2', {})
    expect(store.getSnapshot()).toEqual({})
    expect(adapter.load()).toEqual({})
  })

  it('keeps a write from another tab: the latest write for one card wins', () => {
    const { store, adapter } = setup()
    const other = createCardStore(adapter, () => 5000)
    other.save('c2', { title: 'From tab B' })
    store.save('c1', { title: 'From tab A' })
    expect(Object.keys(adapter.load()).sort()).toEqual(['c1', 'c2'])
    other.save('c1', { title: 'Later' })
    expect(adapter.load().c1?.patch.title).toBe('Later')
  })
})

describe('storage', () => {
  it('drops an invalid stored value and logs it', () => {
    const { backing, events, adapter, store } = setup()
    backing.setItem(storageKey(), '{"c1":{"cardId":"c1","updatedAt":"x","patch":{}},"c2":{"cardId":"c2","updatedAt":1,"patch":{"title":"ok"}}}')
    expect(Object.keys(adapter.load())).toEqual(['c2'])
    expect(events).toContain('drop')
    backing.setItem(storageKey(), 'not json')
    expect(adapter.load()).toEqual({})
    store.reload()
    expect(store.getSnapshot()).toEqual({})
  })

  it('drops an Override whose key differs from its card id', () => {
    const { backing, adapter } = setup()
    backing.setItem(storageKey(), '{"c1":{"cardId":"c9","updatedAt":1,"patch":{}}}')
    expect(adapter.load()).toEqual({})
  })

  it('migrates an older stored version when the current key is empty', () => {
    const backing = createMemoryStorage()
    backing.setItem(storageKey(0), '{"c1":{"cardId":"c1","updatedAt":1,"title":"Old"}}')
    const adapter = createLocalStorageAdapter(backing, undefined, {
      0: (v) =>
        Object.fromEntries(
          Object.entries(v as Record<string, { cardId: string; updatedAt: number; title: string }>).map(
            ([id, o]) => [id, { cardId: o.cardId, updatedAt: o.updatedAt, patch: { title: o.title } }],
          ),
        ),
    })
    expect(adapter.load().c1?.patch.title).toBe('Old')
  })

  it('fails when a migration step is missing', () => {
    expect(() => migrate({}, 0, 2, { 0: (v) => v })).toThrow()
  })
})

describe('sync', () => {
  function fakeTarget() {
    let handler: ((e: { key: string | null }) => void) | undefined
    return {
      addEventListener: (_t: 'storage', h: typeof handler) => void (handler = h),
      removeEventListener: () => void (handler = undefined),
      fire: (key: string | null) => handler?.({ key }),
    }
  }

  it('updates the store on a storage event for the Override key', () => {
    const { adapter, store } = setup()
    const target = fakeTarget()
    attachStorageSync(store, target)
    createCardStore(adapter).save('c1', { title: 'From another tab' })
    expect(store.getSnapshot().c1).toBeUndefined()
    target.fire(storageKey())
    expect(store.getSnapshot().c1?.patch.title).toBe('From another tab')
  })

  it('ignores other keys and stops after detach', () => {
    const { adapter, store } = setup()
    const target = fakeTarget()
    const detach = attachStorageSync(store, target)
    createCardStore(adapter).save('c1', { title: 'X' })
    target.fire('other-key')
    expect(store.getSnapshot().c1).toBeUndefined()
    detach()
    target.fire(storageKey())
    expect(store.getSnapshot().c1).toBeUndefined()
  })
})

describe('repository', () => {
  it('lists and gets Card Records', async () => {
    const repo = createMockRepository()
    const all = await repo.list()
    expect(all.length).toBeGreaterThan(0)
    expect((await repo.get(all[0].data.id))?.data.id).toBe(all[0].data.id)
    expect(await repo.get('missing')).toBeUndefined()
  })
})
