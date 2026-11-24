import type { LayoutProps } from '@/plugins'
import styles from '../card.module.css'
import { cx } from '../cx'
import { BadgeList } from '../parts/BadgeList'
import { CardMedia } from '../parts/CardMedia'
import { CardPrice } from '../parts/CardPrice'
import { CardRating, CardSales } from '../parts/CardRating'
import { CardSlogan, CardTitle } from '../parts/CardTitle'

export function VerticalLayout({ card, variant }: LayoutProps) {
  return (
    <article className={cx(styles.card, styles.vertical)} data-variant={variant}>
      <div className={styles.media}>
        <CardMedia card={card} />
        <BadgeList card={card} placement="overlay" />
        <BadgeList card={card} placement="ribbon" />
      </div>
      <div className={styles.body}>
        <CardSlogan slogan={card.slogan} />
        <CardTitle title={card.title} />
        <CardPrice card={card} />
        <CardRating rating={card.rating} />
        <CardSales sales={card.sales} />
        <BadgeList card={card} placement="chip" />
      </div>
    </article>
  )
}
