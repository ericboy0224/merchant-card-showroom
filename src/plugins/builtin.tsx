// The built-in plugins. A new badge type follows the same shape.
import { registerBadge, type BadgeDefinition } from './badges'

const labelBadge = (placement: BadgeDefinition['placement']): BadgeDefinition => ({
  placement,
  render: ({ badge }) => badge?.label || null,
})

registerBadge('event', labelBadge('overlay'))
registerBadge('ribbon', labelBadge('ribbon'))
registerBadge('coupon', labelBadge('chip'))
registerBadge('fast-delivery', labelBadge('chip'))

// A sponsored card looks like a normal card except for the "Ad" marker. It is a Flag, not a variant.
registerBadge('sponsored', {
  placement: 'overlay',
  appliesTo: (card) => card.flags?.includes('sponsored') === true,
  render: () => <span>Ad</span>,
})
