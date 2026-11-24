import type { CardPreset } from '../card'

export const searchResult: CardPreset = {
  id: 'search-result',
  surface: 'search-results',
  layout: 'vertical',
  fields: ['pricing', 'rating', 'sales', 'slogan', 'badges', 'media'],
  rationale:
    'A shopper compares many products at once, so the card shows price, rating, sales, and badges in a vertical stack.',
}
