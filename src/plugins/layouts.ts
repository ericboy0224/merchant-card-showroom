import type { ComponentType } from 'react'
import type { CardData, CardVariant, Layout } from '@/domain/card'
import { createRegistry, type Registry } from './registry'

export type LayoutProps = { card: CardData; variant: CardVariant }

/** Maps a Layout value to a template. The `ui` layer registers `vertical` and `horizontal`. */
export const layoutRegistry: Registry<ComponentType<LayoutProps>> = createRegistry()

export function registerLayout(layout: Layout, template: ComponentType<LayoutProps>): void {
  layoutRegistry.register(layout, template)
}
