import { cardOverrideSchema, type CardOverride } from '@/domain/card'
import { silentLogger, type Logger } from './logger'
import { migrate, type MigrationRegistry } from './migrations'

/** The schema version of the stored value. A new version needs a migration. */
export const STORAGE_VERSION = 1
export const storageKey = (version = STORAGE_VERSION) => `momo-showroom:v${version}:overrides`

export type OverrideMap = Readonly<Record<string, CardOverride>>
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Reads and writes the whole Override map. The Store depends on this interface only. */
export interface OverrideStorage {
  load(): OverrideMap
  save(overrides: OverrideMap): void
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) }
}

/** Return `localStorage`, or a memory fallback when the browser blocks it. */
export function browserStorage(): KeyValueStorage {
  try {
    return globalThis.localStorage ?? createMemoryStorage()
  } catch {
    return createMemoryStorage()
  }
}

export function createLocalStorageAdapter(
  storage: KeyValueStorage,
  logger: Logger = silentLogger,
  migrations: MigrationRegistry = {},
): OverrideStorage {
  /** Find the newest stored value. An older version is migrated when the current key is empty. */
  function readRaw(): unknown {
    const current = storage.getItem(storageKey())
    if (current !== null) return JSON.parse(current)
    const olderVersions = Object.keys(migrations).map(Number).sort((a, b) => b - a)
    for (const from of olderVersions) {
      const old = storage.getItem(storageKey(from))
      if (old === null) continue
      logger.log('read', { migratedFrom: from })
      return migrate(JSON.parse(old), from, STORAGE_VERSION, migrations)
    }
    return {}
  }

  function write(overrides: OverrideMap) {
    try {
      storage.setItem(storageKey(), JSON.stringify(overrides))
      logger.log('write', { count: Object.keys(overrides).length })
    } catch (error) {
      logger.log('drop', { reason: 'write failed', error: String(error) })
    }
  }

  return {
    load() {
      let raw: unknown
      try {
        raw = readRaw()
      } catch (error) {
        logger.log('drop', { reason: 'unreadable', error: String(error) })
        // A SyntaxError means that the stored text is corrupt. Remove it. Any other error is a missing migration: keep the data.
        if (error instanceof SyntaxError) write({})
        return {}
      }
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        logger.log('drop', { reason: 'not an object' })
        write({})
        return {}
      }
      const out: Record<string, CardOverride> = {}
      let dropped = false
      for (const [id, value] of Object.entries(raw)) {
        const parsed = cardOverrideSchema.safeParse(value)
        if (parsed.success && parsed.data.cardId === id) out[id] = parsed.data
        else {
          dropped = true
          logger.log('drop', { reason: 'invalid override', cardId: id })
        }
      }
      // Write the cleaned map back, so a corrupt entry does not stay in storage.
      if (dropped) write(out)
      logger.log('read', { count: Object.keys(out).length })
      return out
    },
    save: write,
  }
}
