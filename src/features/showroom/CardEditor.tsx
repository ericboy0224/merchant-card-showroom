import { useState, type FormEvent } from 'react'
import { buildPatch, type CardRecord } from '@/domain'
import { cardStore } from '@/data/defaults'
import { badgeRegistry } from '@/plugins'
import { useResolved } from './hooks'
import { parseForm, toForm, type FormResult, type FormValues } from './form'
import styles from './showroom.module.css'

/** Badge types that an Operator can add by hand. A type that a Flag drives is not in the list. */
const manualTypes = () => badgeRegistry.entries().filter(([, d]) => !d.appliesTo)

export function CardEditor({ record }: { record: CardRecord }) {
  const shown = useResolved(record).card
  const [values, setValues] = useState<FormValues>(() => toForm(shown))
  const [result, setResult] = useState<FormResult>()
  const errors = result && !result.ok ? result.errors : {}
  const set = (patch: Partial<FormValues>) => setValues((v) => ({ ...v, ...patch }))

  function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseForm(values)
    setResult(parsed)
    if (parsed.ok) cardStore.save(record.data.id, buildPatch(record.data, parsed.data))
  }

  const field = (label: string, key: keyof FormValues, error?: string, type = 'text') => (
    <label className={styles.field}>
      {label}
      <input
        type={type}
        value={values[key] as string}
        onChange={(e) => set({ [key]: e.target.value })}
        aria-invalid={error ? true : undefined}
      />
    </label>
  )

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h3>Edit card</h3>
      {field('Title', 'title', errors.title)}
      {errors.title && <p role="alert">{errors.title}</p>}
      {field('Price (NT$)', 'price', errors.price, 'number')}
      {errors.price && <p role="alert">{errors.price}</p>}
      {field('Original price (NT$, empty for none)', 'original', errors.originalPrice, 'number')}
      {errors.originalPrice && <p role="alert">{errors.originalPrice}</p>}
      <div className={styles.row}>
        {field('Rating (0 to 5)', 'ratingScore', errors.rating, 'number')}
        {field('Review count', 'ratingCount', errors.rating, 'number')}
      </div>
      {errors.rating && <p role="alert">{errors.rating}</p>}

      <fieldset className={styles.badges}>
        <legend>Badges</legend>
        {values.badges.map((b, i) => (
          <div key={i} className={styles.row}>
            <select
              aria-label="Badge type"
              value={b.type}
              onChange={(e) => {
                const def = badgeRegistry.get(e.target.value)
                set({ badges: values.badges.map((x, j) => (j === i ? { ...x, type: e.target.value, placement: def?.placement ?? x.placement } : x)) })
              }}
            >
              {[...new Set([...manualTypes().map(([t]) => t), b.type])].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              aria-label="Badge label"
              value={b.label ?? ''}
              onChange={(e) => set({ badges: values.badges.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            />
            <button type="button" onClick={() => set({ badges: values.badges.filter((_, j) => j !== i) })}>
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const [type, def] = manualTypes()[0]
            set({ badges: [...values.badges, { type, placement: def.placement, label: '' }] })
          }}
        >
          Add badge
        </button>
      </fieldset>

      <button type="submit">Save</button>
    </form>
  )
}
