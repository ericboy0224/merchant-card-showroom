import type { ReactNode } from 'react'
import type { Badge, BadgePlacement, CardData } from '@/domain/card'
import { createRegistry, type Registry } from './registry'

export type BadgeContext = { card: CardData; badge?: Badge }

export interface BadgeDefinition {
  /** Where the badge appears when a Flag or a rule adds it. A Badge in Card Data sets its own placement. */
  placement: BadgePlacement
  /** Add this badge to every card for which the function returns true, for example by a Flag. */
  appliesTo?: (card: CardData) => boolean
  render(context: BadgeContext): ReactNode
}

export type PlacedBadge = { key: string; placement: BadgePlacement; node: ReactNode }

export const badgeRegistry: Registry<BadgeDefinition> = createRegistry()

export function registerBadge(type: string, definition: BadgeDefinition): void {
  badgeRegistry.register(type, definition)
}

function safely<T>(run: () => T, fallback: T): T {
  try {
    return run()
  } catch (error) {
    // One broken plugin must not break the card.
    console.error('[momo-showroom] badge plugin failed', error)
    return fallback
  }
}

/** List the badges of one card. A badge type that the registry does not know renders nothing. */
export function badgesFor(card: CardData, registry: Registry<BadgeDefinition> = badgeRegistry): PlacedBadge[] {
  const out: PlacedBadge[] = []
  const listed = new Set<string>()
  card.badges?.forEach((badge, i) => {
    listed.add(badge.type)
    const def = registry.get(badge.type)
    if (!def) return
    const node = safely(() => def.render({ card, badge }), null)
    if (node != null && node !== false) out.push({ key: `data-${i}`, placement: badge.placement, node })
  })
  for (const [type, def] of registry.entries()) {
    if (listed.has(type) || !def.appliesTo || !safely(() => def.appliesTo!(card), false)) continue
    const node = safely(() => def.render({ card }), null)
    if (node != null && node !== false) out.push({ key: `plugin-${type}`, placement: def.placement, node })
  }
  return out
}
