import { catalog } from '@/domain'
import { cardStore } from '@/data/defaults'
import { Card } from '@/ui/Card'
import { CardEditor } from './CardEditor'
import { useOverride, useRecord, useResolved } from './hooks'
import styles from './showroom.module.css'

function Detail({ record }: { record: ReturnType<typeof useRecord> & object }) {
  const resolved = useResolved(record)
  const override = useOverride(record.data.id)
  const preset = catalog[record.variant]
  return (
    <>
      <div className={styles.detail}>
        <div>
          <Card resolved={resolved} />
          <p className={styles.meta}>
            Variant <b>{record.variant}</b> on <b>{preset.surface}</b>, {preset.layout} layout.
          </p>
          <p className={styles.rationale}>{preset.rationale}</p>
        </div>
        {/* A new key remounts the form when an edit, a reset, or another tab changes the Override. */}
        <CardEditor key={override?.updatedAt ?? 'preset'} record={record} />
      </div>
      <button type="button" disabled={!override} onClick={() => cardStore.reset(record.data.id)}>
        Reset to Preset
      </button>{' '}
      {override && <span className={styles.meta}>Edited. The Override is saved in this browser.</span>}
    </>
  )
}

export function CardDetail({ id }: { id: string }) {
  const record = useRecord(id)
  return (
    <>
      <p>
        <a href="#/">← All cards</a>
      </p>
      {record === undefined ? <p>Loading…</p> : record === null ? <p>No card has the id “{id}”.</p> : <Detail record={record} />}
    </>
  )
}
