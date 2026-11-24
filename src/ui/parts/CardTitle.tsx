import styles from '../card.module.css'

export function CardTitle({ title }: { title: string }) {
  return <h3 className={styles.title}>{title}</h3>
}

export function CardSlogan({ slogan }: { slogan?: string }) {
  return slogan ? <p className={styles.slogan}>{slogan}</p> : null
}
