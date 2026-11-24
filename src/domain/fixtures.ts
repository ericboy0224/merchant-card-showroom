// Mock Card Data for the Repository. The images are inline SVG placeholders, not brand assets.
import type { CardRecord } from './card'

function placeholder(label: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">` +
    `<rect width="320" height="320" fill="${color}"/>` +
    `<text x="160" y="170" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const cardRecords: CardRecord[] = [
  {
    variant: 'search-result',
    data: {
      id: 'search-result-001',
      title: 'Wireless Earbuds with Noise Cancelling',
      price: 1290,
      image: placeholder('Earbuds', '#3b82f6'),
      pricing: { original: 1990 },
      rating: { score: 4.6, count: 2381 },
      sales: { text: '>3,000 sold' },
      slogan: 'Free shipping this week',
      badges: [
        { type: 'event', placement: 'overlay', label: 'Mega Sale' },
        { type: 'fast-delivery', placement: 'chip', label: 'Fast delivery' },
        { type: 'coupon', placement: 'chip', label: 'Coupon $100' },
      ],
      media: {
        kind: 'carousel',
        images: [placeholder('Earbuds 1', '#3b82f6'), placeholder('Earbuds 2', '#2563eb')],
      },
      flags: ['sponsored'],
    },
  },
  {
    // No rating, no pricing, no badges: the card must still render.
    variant: 'search-result',
    data: {
      id: 'search-result-002',
      title: 'Digital Gift Voucher $500',
      price: 500,
      image: placeholder('Voucher', '#10b981'),
      sales: { text: '>1,000 sold' },
    },
  },
  {
    variant: 'search-result',
    data: {
      id: 'search-result-003',
      title: 'Insulated Stainless Steel Water Bottle 750ml',
      price: 590,
      image: placeholder('Bottle', '#f59e0b'),
      pricing: { original: 790, note: 'Price already discounted' },
      rating: { score: 4.8, count: 512 },
      sales: { text: '>500 sold' },
      badges: [{ type: 'coupon', placement: 'chip', label: 'Coupon $50' }],
    },
  },
  {
    variant: 'home-feed',
    data: {
      id: 'home-feed-001',
      title: 'Air Fryer 5L Digital Touch Screen',
      price: 2380,
      image: placeholder('Air fryer', '#ef4444'),
      pricing: { original: 3280 },
      rating: { score: 4.4, count: 1290 },
      sales: { text: '>2,000 sold' },
      slogan: 'Crispy meals in 15 minutes',
      badges: [{ type: 'event', placement: 'overlay', label: 'Flash Deal' }],
      media: { kind: 'video', src: 'https://example.com/preview.mp4' },
    },
  },
  {
    variant: 'home-feed',
    data: {
      id: 'home-feed-002',
      title: 'Merino Wool Crew Neck Sweater',
      price: 1680,
      image: placeholder('Sweater', '#8b5cf6'),
      sales: { text: '>800 sold' },
      slogan: 'Warm and light',
      badges: [{ type: 'fast-delivery', placement: 'chip', label: 'Fast delivery' }],
    },
  },
  {
    variant: 'live-sidebar',
    data: {
      id: 'live-sidebar-001',
      title: 'Portable Espresso Maker',
      price: 1480,
      image: placeholder('Espresso', '#14b8a6'),
      rating: { score: 4.7, count: 340 },
      badges: [{ type: 'ribbon', placement: 'ribbon', label: 'Curated' }],
      action: { label: 'Buy now' },
    },
  },
  {
    variant: 'live-sidebar',
    data: {
      id: 'live-sidebar-002',
      title: 'Compact Travel Tripod',
      price: 890,
      image: placeholder('Tripod', '#6366f1'),
      badges: [{ type: 'ribbon', placement: 'ribbon', label: 'Editor pick' }],
      action: { label: 'Buy now' },
    },
  },
  {
    variant: 'live-sidebar',
    data: {
      id: 'live-sidebar-003',
      title: 'Ceramic Pour-Over Coffee Set',
      price: 760,
      image: placeholder('Pour-over', '#d97706'),
      rating: { score: 4.9, count: 128 },
      action: { label: 'Play video' },
    },
  },
]
