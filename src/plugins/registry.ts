/** A lookup table with change notification. A late registration re-renders the cards that use it. */
export interface Registry<T> {
  register(key: string, value: T): void
  get(key: string): T | undefined
  entries(): [string, T][]
  subscribe(listener: () => void): () => void
  /** A number that changes on every registration. Use it as a `useSyncExternalStore` snapshot. */
  getVersion(): number
}

export function createRegistry<T>(): Registry<T> {
  const items = new Map<string, T>()
  const listeners = new Set<() => void>()
  let version = 0
  return {
    register(key, value) {
      items.set(key, value)
      version++
      listeners.forEach((l) => l())
    },
    get: (key) => items.get(key),
    entries: () => [...items],
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    getVersion: () => version,
  }
}
