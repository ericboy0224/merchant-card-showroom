import type {
  CardData,
  CardOverride,
  CardPreset,
  CardVariant,
  EditableFields,
  Layout,
  OptionalGroup,
  OverridePatch,
} from './card'
import { optionalGroupSchema } from './card'

export type ResolvedCard = { variant: CardVariant; layout: Layout; card: CardData }

/** Apply the patch of an Override to Card Data. The input is not changed. */
export function applyOverride(data: CardData, override?: CardOverride): CardData {
  if (!override) return data
  const { title, price, pricing, rating, badges } = override.patch
  const out: CardData = { ...data }
  if (title !== undefined) out.title = title
  if (price !== undefined) out.price = price
  if (badges !== undefined) out.badges = badges
  if (rating === null) delete out.rating
  else if (rating) out.rating = rating
  if (pricing) {
    const next = { ...data.pricing }
    if (pricing.original === null) delete next.original
    else next.original = pricing.original
    if (Object.keys(next).length > 0) out.pricing = next
    else delete out.pricing
  }
  return out
}

/** Make the card to render from Card Data, a Preset, and an optional Override. */
export function resolveCard(data: CardData, preset: CardPreset, override?: CardOverride): ResolvedCard {
  const card = { ...applyOverride(data, override) }
  const used = new Set<OptionalGroup>(preset.fields)
  for (const group of optionalGroupSchema.options) {
    if (!used.has(group)) delete card[group]
  }
  return { variant: preset.id, layout: preset.layout, card }
}

/** The editable fields of a card, as the editor form shows them. */
export function toEditable(card: CardData): EditableFields {
  return {
    title: card.title,
    price: card.price,
    originalPrice: card.pricing?.original ?? null,
    rating: card.rating ?? null,
    badges: card.badges ?? [],
  }
}

/** Compare edited fields with the base card. Return only the fields that differ. */
export function buildPatch(base: CardData, edited: EditableFields): OverridePatch {
  const from = toEditable(base)
  const patch: OverridePatch = {}
  if (edited.title !== from.title) patch.title = edited.title
  if (edited.price !== from.price) patch.price = edited.price
  if (edited.originalPrice !== from.originalPrice) patch.pricing = { original: edited.originalPrice }
  if (JSON.stringify(edited.rating) !== JSON.stringify(from.rating)) patch.rating = edited.rating
  if (JSON.stringify(edited.badges) !== JSON.stringify(from.badges)) patch.badges = edited.badges
  return patch
}
