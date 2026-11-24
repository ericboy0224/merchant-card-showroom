import { useEffect, useState, useSyncExternalStore } from 'react'
import { cardRepository, cardStore } from '@/data/defaults'
import { catalog, resolveCard, type CardOverride, type CardRecord } from '@/domain'

export function useRecords(): CardRecord[] | undefined {
  const [records, setRecords] = useState<CardRecord[]>()
  useEffect(() => void cardRepository.list().then(setRecords), [])
  return records
}

/** `undefined` while it loads, `null` when no card has this id. */
export function useRecord(id: string): CardRecord | null | undefined {
  const [loaded, setLoaded] = useState<{ id: string; record: CardRecord | null }>()
  useEffect(() => {
    let live = true
    void cardRepository.get(id).then((r) => live && setLoaded({ id, record: r ?? null }))
    return () => void (live = false)
  }, [id])
  return loaded?.id === id ? loaded.record : undefined
}

export function useOverride(cardId: string): CardOverride | undefined {
  return useSyncExternalStore(cardStore.subscribe, () => cardStore.getSnapshot()[cardId])
}

/** Card Data, its Preset, and its Override, merged. It updates when the Store changes. */
export function useResolved(record: CardRecord) {
  const override = useOverride(record.data.id)
  return resolveCard(record.data, catalog[record.variant], override)
}
