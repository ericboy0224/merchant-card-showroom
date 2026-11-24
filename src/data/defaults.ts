// The shared instances. The Showroom and every <momo-card> element in one page use the same Store.
import { createMockRepository } from './repository'
import { consoleLogger } from './logger'
import { attachStorageSync } from './sync'
import { browserStorage, createLocalStorageAdapter } from './storage'
import { createCardStore } from './store'

export const cardRepository = createMockRepository()
export const cardStore = createCardStore(createLocalStorageAdapter(browserStorage(), consoleLogger))

if (typeof window !== 'undefined') attachStorageSync(cardStore, window, consoleLogger)
