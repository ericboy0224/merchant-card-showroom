import type { CardRecord } from '@/domain/card'
import { cardRecords } from '@/domain/fixtures'

/** Returns Card Records. A real API client replaces the mock below and nothing else. */
export interface CardRepository {
  list(): Promise<CardRecord[]>
  get(id: string): Promise<CardRecord | undefined>
}

export function createMockRepository(records: CardRecord[] = cardRecords): CardRepository {
  return {
    list: async () => records,
    get: async (id) => records.find((r) => r.data.id === id),
  }
}
