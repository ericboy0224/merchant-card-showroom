import { editableFieldsSchema, toEditable, type Badge, type CardData, type EditableFields } from '@/domain'

/** The editor form keeps numbers as text, so an empty or half-typed input stays visible. */
export type FormValues = {
  title: string
  price: string
  original: string
  ratingScore: string
  ratingCount: string
  badges: Badge[]
}

export type FormResult =
  | { ok: true; data: EditableFields }
  | { ok: false; errors: Partial<Record<keyof EditableFields, string>> }

export function toForm(card: CardData): FormValues {
  const e = toEditable(card)
  return {
    title: e.title,
    price: String(e.price),
    original: e.originalPrice === null ? '' : String(e.originalPrice),
    ratingScore: e.rating ? String(e.rating.score) : '',
    ratingCount: e.rating ? String(e.rating.count) : '',
    badges: e.badges,
  }
}

const MESSAGES: Record<keyof EditableFields, string> = {
  title: 'Enter a title.',
  price: 'Enter a price of 0 or more.',
  originalPrice: 'Enter a price of 0 or more, or leave it empty.',
  rating: 'Fill in both rating fields, or clear both. The score must be 0 to 5.',
  badges: 'Check the badges.',
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

/** Validate the form with the same schema that the Card Data uses. */
export function parseForm(v: FormValues): FormResult {
  const noRating = v.ratingScore.trim() === '' && v.ratingCount.trim() === ''
  const parsed = editableFieldsSchema.safeParse({
    title: v.title,
    price: num(v.price),
    originalPrice: v.original.trim() === '' ? null : num(v.original),
    rating: noRating ? null : { score: num(v.ratingScore), count: num(v.ratingCount) },
    badges: v.badges,
  })
  if (parsed.success) return { ok: true, data: parsed.data }
  const errors: Partial<Record<keyof EditableFields, string>> = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof EditableFields
    errors[key] ??= MESSAGES[key]
  }
  return { ok: false, errors }
}
