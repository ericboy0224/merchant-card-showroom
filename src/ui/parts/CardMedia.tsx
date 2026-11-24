import type { CardData } from '@/domain/card'
import styles from '../card.module.css'

export function CardMedia({ card }: { card: Pick<CardData, 'image' | 'title' | 'media'> }) {
  const { media } = card
  return (
    <>
      {media?.kind === 'video' ? (
        <video src={media.src} poster={card.image} muted loop playsInline aria-label={card.title} />
      ) : (
        <img src={card.image} alt={card.title} loading="lazy" />
      )}
      {media?.kind === 'carousel' && media.images.length > 1 && (
        <span className={styles.mediaCount}>{media.images.length} photos</span>
      )}
    </>
  )
}
