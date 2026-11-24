import type { CardData } from '@/domain/card'
import styles from '../card.module.css'

const money = (n: number) => `NT$${n.toLocaleString('en-US')}`

export function CardPrice({ card }: { card: Pick<CardData, 'price' | 'pricing'> }) {
  const original = card.pricing?.original
  return (
    <div className={styles.price}>
      <span className={styles.priceNow}>{money(card.price)}</span>
      {original !== undefined && <s className={styles.priceOriginal}>{money(original)}</s>}
      {card.pricing?.note && <span className={styles.priceNote}>{card.pricing.note}</span>}
    </div>
  )
}
