import type { CardPreset } from '../card'

export const homeFeed: CardPreset = {
  id: 'home-feed',
  surface: 'home-feed',
  layout: 'vertical',
  fields: ['pricing', 'rating', 'sales', 'slogan', 'badges', 'media'],
  rationale:
    'The feed reuses the vertical shape of search results and adds the original price and a video preview to catch a passing shopper.',
}
