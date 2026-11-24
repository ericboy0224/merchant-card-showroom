import { createElement, useSyncExternalStore } from 'react'
import type { ResolvedCard } from '@/domain/resolve'
import { layoutRegistry, registerLayout } from '@/plugins'
import { HorizontalLayout } from './layouts/HorizontalLayout'
import { VerticalLayout } from './layouts/VerticalLayout'

registerLayout('vertical', VerticalLayout)
registerLayout('horizontal', HorizontalLayout)

/** Render a resolved card with the template that its Layout names. */
export function Card({ resolved }: { resolved: ResolvedCard }) {
  useSyncExternalStore(layoutRegistry.subscribe, layoutRegistry.getVersion, layoutRegistry.getVersion)
  const template = layoutRegistry.get(resolved.layout)
  return template ? createElement(template, { card: resolved.card, variant: resolved.variant }) : null
}
