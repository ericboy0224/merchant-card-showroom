// Schemas and types for Card Data, Presets, and Overrides.
// Every other type comes from z.infer. See docs/DESIGN.md section 5.
import { z } from 'zod'

export const layoutSchema = z.enum(['vertical', 'horizontal'])
export type Layout = z.infer<typeof layoutSchema>

export const surfaceSchema = z.enum(['search-results', 'home-feed', 'short-video-panel'])
export type Surface = z.infer<typeof surfaceSchema>

export const cardVariantSchema = z.enum(['search-result', 'home-feed', 'live-sidebar'])
export type CardVariant = z.infer<typeof cardVariantSchema>

export const badgePlacementSchema = z.enum(['overlay', 'ribbon', 'chip'])
export type BadgePlacement = z.infer<typeof badgePlacementSchema>

/** The Optional Groups of Card Data. A Preset lists the groups that its variant uses. */
export const optionalGroupSchema = z.enum([
  'pricing',
  'rating',
  'sales',
  'slogan',
  'badges',
  'action',
  'media',
])
export type OptionalGroup = z.infer<typeof optionalGroupSchema>

const money = z.number().nonnegative()

export const badgeSchema = z.object({
  type: z.string().min(1),
  placement: badgePlacementSchema,
  label: z.string().optional(),
})
export type Badge = z.infer<typeof badgeSchema>

export const ratingSchema = z.object({
  score: z.number().min(0).max(5),
  count: z.number().int().nonnegative(),
})
export type Rating = z.infer<typeof ratingSchema>

const mediaSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('carousel'), images: z.array(z.string().min(1)).min(1) }),
  z.object({ kind: z.literal('video'), src: z.string().min(1) }),
])

export const cardDataSchema = z.object({
  // Required Core
  id: z.string().min(1),
  title: z.string().trim().min(1),
  price: money,
  image: z.string().min(1),
  // Optional Groups
  pricing: z.object({ original: money.optional(), note: z.string().optional() }).optional(),
  rating: ratingSchema.optional(),
  sales: z.object({ text: z.string().min(1) }).optional(),
  slogan: z.string().optional(),
  badges: z.array(badgeSchema).optional(),
  action: z.object({ label: z.string().min(1), href: z.string().optional() }).optional(),
  media: mediaSchema.optional(),
  // A Flag is a name in this list. A plugin reads it, for example `sponsored`.
  flags: z.array(z.string()).optional(),
})
export type CardData = z.infer<typeof cardDataSchema>

/** The configuration of one Card Variant. The schema rejects a Preset without `surface` or `rationale`. */
export const cardPresetSchema = z.object({
  id: cardVariantSchema,
  surface: surfaceSchema,
  layout: layoutSchema,
  fields: z.array(optionalGroupSchema),
  rationale: z.string().trim().min(1),
})
export type CardPreset = z.infer<typeof cardPresetSchema>

/** A card as the Repository returns it: Card Data plus the Card Variant that renders it. */
export const cardRecordSchema = z.object({ variant: cardVariantSchema, data: cardDataSchema })
export type CardRecord = z.infer<typeof cardRecordSchema>

/**
 * The fields an Operator can edit. The editor form validates against this schema.
 * `null` means "no value": the Operator cleared the field.
 */
export const editableFieldsSchema = z.object({
  title: cardDataSchema.shape.title,
  price: cardDataSchema.shape.price,
  originalPrice: money.nullable(),
  rating: ratingSchema.nullable(),
  badges: z.array(badgeSchema),
})
export type EditableFields = z.infer<typeof editableFieldsSchema>

/** The part of an Override that patches Card Data. Only the changed fields are present. */
export const overridePatchSchema = z.object({
  title: editableFieldsSchema.shape.title.optional(),
  price: editableFieldsSchema.shape.price.optional(),
  pricing: z.object({ original: money.nullable() }).optional(),
  rating: ratingSchema.nullable().optional(),
  badges: z.array(badgeSchema).optional(),
})
export type OverridePatch = z.infer<typeof overridePatchSchema>

export const cardOverrideSchema = z.object({
  cardId: z.string().min(1),
  updatedAt: z.number().int().nonnegative(),
  patch: overridePatchSchema,
})
export type CardOverride = z.infer<typeof cardOverrideSchema>
