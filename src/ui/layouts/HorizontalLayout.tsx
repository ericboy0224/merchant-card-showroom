import type { LayoutProps } from '@/plugins'
import styles from '../card.module.css'
import { cx } from '../cx'
import { BadgeList } from '../parts/BadgeList'
import { CardAction } from '../parts/CardAction'
import { CardMedia } from '../parts/CardMedia'
import { CardPrice } from '../parts/CardPrice'
import { CardRating } from '../parts/CardRating'
import { CardTitle } from '../parts/CardTitle'

export function HorizontalLayout({ card, variant }: LayoutProps) {
  return (
    <article className={cx(styles.card, styles.horizontal)} data-variant={variant}>
      <div className={styles.media}>
        <CardMedia card={card} />
        <BadgeList card={card} placement="ribbon" />
        <BadgeList card={card} placement="overlay" />
      </div>
      <div className={styles.body}>
        <CardTitle title={card.title} />
        <CardPrice card={card} />
        <CardRating rating={card.rating} />
        <BadgeList card={card} placement="chip" />
        <CardAction action={card.action} />
      </div>
    </article>
  )
}
