import { useEffect, useState, useSyncExternalStore } from 'react'
import { cardRepository, cardStore } from '@/data/defaults'
import { catalog, resolveCard, type CardRecord } from '@/domain'
import { Card } from '@/ui/Card'

/** Read one card from the Repository and apply its Override from the shared Store. */
export function EmbeddedCard({ cardId }: { cardId: string }) {
  const [loaded, setLoaded] = useState<{ id: string; record?: CardRecord }>()
  useEffect(() => {
    let live = true
    void cardRepository.get(cardId).then((record) => live && setLoaded({ id: cardId, record }))
    return () => void (live = false)
  }, [cardId])
  const override = useSyncExternalStore(cardStore.subscribe, () => cardStore.getSnapshot()[cardId])
  const record = loaded?.id === cardId ? loaded.record : undefined
  if (!record) return null
  return <Card resolved={resolveCard(record.data, catalog[record.variant], override)} />
}
