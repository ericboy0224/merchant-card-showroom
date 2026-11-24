import type { CardData } from '@/domain/card'
import styles from '../card.module.css'

export function CardRating({ rating }: { rating?: CardData['rating'] }) {
  if (!rating) return null
  return (
    <p className={styles.rating} aria-label={`Rated ${rating.score} out of 5`}>
      ★ {rating.score.toFixed(1)} ({rating.count.toLocaleString('en-US')})
    </p>
  )
}

export function CardSales({ sales }: { sales?: CardData['sales'] }) {
  return sales ? <p className={styles.sales}>{sales.text}</p> : null
}
