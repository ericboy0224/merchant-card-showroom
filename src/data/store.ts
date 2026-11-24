import type { OverridePatch } from '@/domain/card'
import type { OverrideMap, OverrideStorage } from './storage'

/** The Store holds Overrides. Components read it with `useSyncExternalStore`. */
export interface CardStore {
  /** The snapshot changes identity on every change, so React can compare it. */
  getSnapshot(): OverrideMap
  subscribe(listener: () => void): () => void
  /** Save the Override of one card. An empty patch removes the Override. */
  save(cardId: string, patch: OverridePatch): void
  /** Remove the Override of one card. The Preset values apply again. */
  reset(cardId: string): void
  /** Read storage again. Another tab changed it. */
  reload(): void
}

export function createCardStore(storage: OverrideStorage, now: () => number = Date.now): CardStore {
  let state = storage.load()
  const listeners = new Set<() => void>()

  function commit(next: OverrideMap, persist: boolean) {
    if (persist) storage.save(next)
    state = next
    listeners.forEach((l) => l())
  }

  function reset(cardId: string) {
    const { [cardId]: _removed, ...rest } = storage.load()
    commit(rest, true)
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    save(cardId, patch) {
      if (Object.keys(patch).length === 0) return reset(cardId)
      // Read storage first. A write from another tab then survives, and the latest write for one card wins.
      const fresh = storage.load()
      commit({ ...fresh, [cardId]: { cardId, updatedAt: now(), patch } }, true)
    },
    reset,
    reload: () => commit(storage.load(), false),
  }
}
