import { catalog, type CardRecord, type CardVariant } from '@/domain'
import { Card } from '@/ui/Card'
import { useRecords, useResolved } from './hooks'
import styles from './showroom.module.css'

function ListItem({ record }: { record: CardRecord }) {
  const resolved = useResolved(record)
  return (
    <a className={styles.cardLink} href={`#/card/${record.data.id}`} aria-label={`Open ${record.data.title}`}>
      <Card resolved={resolved} />
    </a>
  )
}

export function ShowroomList() {
  const records = useRecords()
  if (!records) return <p>Loading…</p>
  return (
    <>
      {(Object.keys(catalog) as CardVariant[]).map((variant) => (
        <section key={variant} className={styles.section}>
          <h2>
            {variant} <small>{catalog[variant].surface}</small>
          </h2>
          <p className={styles.rationale}>{catalog[variant].rationale}</p>
          <div className={styles.grid}>
            {records
              .filter((r) => r.variant === variant)
              .map((r) => (
                <ListItem key={r.data.id} record={r} />
              ))}
          </div>
        </section>
      ))}
    </>
  )
}
