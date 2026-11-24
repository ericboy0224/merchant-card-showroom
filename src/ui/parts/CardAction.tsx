import type { CardData } from '@/domain/card'
import styles from '../card.module.css'

export function CardAction({ action }: { action?: CardData['action'] }) {
  return action ? (
    <button type="button" className={styles.action}>
      {action.label}
    </button>
  ) : null
}
