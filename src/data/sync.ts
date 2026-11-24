import { silentLogger, type Logger } from './logger'
import { storageKey } from './storage'
import type { CardStore } from './store'

type StorageEventLike = { key: string | null }
type StorageEventTarget = {
  addEventListener(type: 'storage', listener: (e: StorageEventLike) => void): void
  removeEventListener(type: 'storage', listener: (e: StorageEventLike) => void): void
}

/**
 * Reload the Store when another tab writes the Override key.
 * The browser does not fire `storage` in the tab that wrote the value,
 * so components in one page sync through the Store subscription instead.
 */
export function attachStorageSync(
  store: CardStore,
  target: StorageEventTarget,
  logger: Logger = silentLogger,
): () => void {
  const onStorage = (e: StorageEventLike) => {
    // A null key means that another tab cleared the whole storage.
    if (e.key !== null && e.key !== storageKey()) return
    logger.log('sync', { key: e.key })
    store.reload()
  }
  target.addEventListener('storage', onStorage)
  return () => target.removeEventListener('storage', onStorage)
}
