// The library entry. A host page loads the bundle and gets the <momo-card> element.
// The exports let the page register a badge or a layout from outside the bundle.
import { defineMomoCard } from './momo-card'

defineMomoCard()

export { cardStore } from '@/data/defaults'
export { registerBadge, registerLayout } from '@/plugins'
export type { BadgeContext, BadgeDefinition, LayoutProps } from '@/plugins'
