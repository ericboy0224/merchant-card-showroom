import type { CardPreset } from '../card'

export const liveSidebar: CardPreset = {
  id: 'live-sidebar',
  surface: 'short-video-panel',
  layout: 'horizontal',
  fields: ['rating', 'badges', 'action'],
  rationale:
    'The side panel is narrow and sits beside a playing video, so the card is a compact row with a buy button and no slogan or sales line.',
}
