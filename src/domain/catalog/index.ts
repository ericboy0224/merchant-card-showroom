import type { CardPreset, CardVariant } from '../card'
import { homeFeed } from './home-feed'
import { liveSidebar } from './live-sidebar'
import { searchResult } from './search-result'

/** The Catalog: every Preset, keyed by Card Variant id. */
export const catalog: Record<CardVariant, CardPreset> = {
  'search-result': searchResult,
  'home-feed': homeFeed,
  'live-sidebar': liveSidebar,
}
