import { useSyncExternalStore } from 'react'
import type { BadgePlacement, CardData } from '@/domain/card'
import { badgeRegistry, badgesFor } from '@/plugins'
import styles from '../card.module.css'

/** Render the badges of one placement. It re-renders when a plugin registers a badge later. */
export function BadgeList({ card, placement }: { card: CardData; placement: BadgePlacement }) {
  useSyncExternalStore(badgeRegistry.subscribe, badgeRegistry.getVersion, badgeRegistry.getVersion)
  const items = badgesFor(card).filter((b) => b.placement === placement)
  if (items.length === 0) return null
  return (
    <div className={styles[placement === 'chip' ? 'chips' : placement]}>
      {items.map((b) => (
        <span key={b.key}>{b.node}</span>
      ))}
    </div>
  )
}
