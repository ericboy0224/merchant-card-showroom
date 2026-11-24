# PRD: momo Product Card Analysis

> **Start here: [Interactive card analysis](https://claude.ai/artifact/MuYREgBwqw1SA5CPEn254z)**
> The page shows the 3 card variants, a clickable anatomy view, the field comparison, and the shared data model. The page text is in Traditional Chinese.

Status: draft. Source: manual inspection of momoshop.com.tw (desktop, 2026-11-24).
Scope: analysis only. No real momo API is called by the showroom.

## 1. Goal

Find the card variants on momo, compare them, and extract one shared card model.
The model drives the Merchant Card Showroom (list cards, show one card, adjust card details, persist in the browser, embed through a sample HTML page).

## 2. Card Variants Observed

| ID | Variant | Where | Layout | Primary action |
|----|---------|-------|--------|----------------|
| V1 | Search result card | `/search/<keyword>` | Vertical: image, slogan, title, price, rating, badges | Open product page |
| V2 | Feed card | Home page, bottom recommendation feed | Vertical, same shape as V1, plus original price and video preview | Open product page |
| V3 | Short video product card | `/live/highlight/<id>` side panel | Horizontal compact: thumbnail left, text right | Buy now, or play video |

V1 and V2 share most fields. V3 is a different layout with a call-to-action button inside the card.

## 3. Field Comparison

Legend: Y = always, S = sometimes, N = never.

| Field | V1 Search | V2 Feed | V3 Video |
|-------|-----------|---------|----------|
| Image | Y (carousel, multiple images) | Y (carousel, S video preview) | Y (single thumbnail) |
| Title | Y | Y | Y |
| Slogan or promo line (red text above title) | S | Y | N |
| Price (current) | Y | Y | Y |
| Original price (strikethrough) | S | S | N |
| Price note, for example "price already discounted" | S | N | N |
| Rating score and review count | S | S | S |
| Total sales text, for example ">3,000" | Y | Y | N |
| Promo badges on image (event tags) | S | S | N |
| Ribbon on thumbnail (curation label) | N | N | S |
| Sponsored marker ("Ad") | S | N | N |
| Store marker (mo store+) | S | N | N |
| Fast delivery marker | S | S | N |
| Coupon, register, gift chips | S | S | S |
| Call-to-action button | N | N | Y |

## 4. Key Differences

1. Layout: V1 and V2 are vertical. V3 is horizontal. One card model needs at least two layouts.
2. Optional data: most fields are optional. If any optional field is missing, the card must still render. A digital voucher with no rating is an example.
3. Media: image carousel, video preview, and single thumbnail all exist. Media is a union type, not one URL.
4. Overlay layers: tags appear on top of the image (event badge, sponsored marker, ribbon) and below the title (chips). Placement is part of the schema.
5. Action: V1 and V2 are whole-card links. V3 has an explicit button.
6. Sponsored cards look the same as normal cards except for the "Ad" marker. Treat sponsored as a flag, not as a separate variant.

## 5. Proposed Shared Model (input for design)

One `CardData` object with required core fields (`id`, `title`, `price`, `image`) and optional groups: `pricing`, `rating`, `sales`, `badges`, `media`, `action`.
A `layout` value selects the template (`vertical`, `horizontal`).
Rationale and alternatives go in `docs/DESIGN.md`.

## 6. Requirements Mapping

| Take-home requirement | How the model serves it |
|-----------------------|-------------------------|
| List all cards, show one card | Same card element, list and detail pages |
| Adjust card details in the UI, persist in the browser | Edit form built from the schema, saved in `localStorage` |
| Sample HTML that embeds the card | Card as a Custom Element, loaded by one script tag |
| Reusable card architecture | One element, layout chosen by data |
| Schema and plugin extensibility | Registry of layouts and badge types |
| State consistency | Cross-tab sync with the browser `storage` event |

## 7. Out of Scope

- Real momo API, login, cart, checkout.
- Pixel-perfect styling and real brand assets.
- Live stream room, store pages, and search filters.

## 8. Decisions

- Variants in scope: V1, V2, and V3. V2 reuses the vertical template of V1, so the extra cost is small. If time runs short, drop V2 first.
- The sponsored marker is a plugin example. It is an external badge type registered in the badge registry.
- Editable fields in the UI: title, price, original price, rating, and badges. All edits persist in the browser.

## 9. Not Verified

- Mobile web layout. Only desktop was inspected.
- Product detail page card (`/goods/...`) and discover page were not inspected.
- Field names are inferred from visible text and CSS class names, not from an official API.
