# Glossary

This file is the single source of vocabulary for code, docs, and commits.
Use the term in the first column. Do not use the words in the "Avoid" column.
If you need a new term, add it here in the same commit that introduces it.

## Core terms

| Term | Definition | Code identifier | Avoid |
|------|------------|-----------------|-------|
| Card | One product tile that a shopper sees. | `Card` | tile, item, product box |
| Card Data | The data that describes one card. A Zod schema defines it. | `CardData` | card model, card props |
| Card Variant | A named kind of card that is made for one surface. | `CardVariant` | card type, card kind |
| Surface | The place in the product where a card appears. | `Surface` | page, context, scene |
| Layout | The direction in which a card arranges its content. Allowed values: `vertical`, `horizontal`. | `Layout` | template, orientation |
| Field | One named piece of data in Card Data. | `CardData` keys | attribute, property |
| Required Core | The fields that every card must have: `id`, `title`, `price`, `image`. | `cardDataSchema` | mandatory fields |
| Card Record | Card Data plus the Card Variant that renders it. The Repository returns Card Records. | `CardRecord` | card entry, listing |
| Optional Group | A set of optional fields that belong together, such as `pricing` or `rating`. | `pricing`, `rating` | extras |

## Configuration terms

| Term | Definition | Code identifier | Avoid |
|------|------------|-----------------|-------|
| Preset | The configuration of one Card Variant. It lives in the repo and Git tracks it. | `CardPreset` | default values, template |
| Rationale | One sentence in a Preset that explains why the card is configured this way. | `preset.rationale` | comment, note |
| Override | A change that an Operator makes in the browser. It patches the Card Data of one card and never edits a Preset. | `CardOverride` | edit, user change |
| Operator | A business user who edits Overrides in the Showroom without a code release. An Operator cannot change a Preset. | `operator` (docs and comments) | admin, merchant, editor |
| Catalog | The set of all Presets. | `catalog/` | registry of cards |

## Extension terms

| Term | Definition | Code identifier | Avoid |
|------|------------|-----------------|-------|
| Badge | A small marker on a card, such as an event tag or a coupon label. | `Badge` | tag, label, sticker |
| Badge Placement | Where a badge appears: `overlay` (on the image), `ribbon` (image corner), `chip` (below the title). | `BadgePlacement` | position, slot |
| Flag | A name in the `flags` list of Card Data. A plugin can read it, for example `sponsored`. | `flags` | switch, toggle |
| Plugin | A module that adds a badge type without a change to the core. | `BadgeDefinition` | extension, add-on |
| Registry | The lookup table that maps a badge type to its renderer. | `badgeRegistry` | plugin map |

## Delivery terms

| Term | Definition | Code identifier | Avoid |
|------|------------|-----------------|-------|
| Showroom | The app that lists cards, shows one card, and edits card details. | `features/showroom` | demo app, gallery |
| Embed | The Custom Element that lets any HTML page use a card. | `<momo-card>` | widget, web component (use only as a general term) |
| Store | The browser-side state that holds Overrides and syncs across tabs. | `cardStore` | cache, state |
| Repository | The interface that returns Card Data. Mock data sits behind it. | `CardRepository` | API, service |

## Card Variants in scope

| Variant id | Surface | Layout | Where it appears |
|------------|---------|--------|------------------|
| `search-result` | Search results | `vertical` | Search page, route `/search/<keyword>` |
| `home-feed` | Home page feed | `vertical` | Recommendation feed at the bottom of the home page |
| `live-sidebar` | Short video side panel | `horizontal` | Route `/live/highlight/<id>` |

## Naming rules

1. Name a Card Variant after its Surface, never after its look. Use `live-sidebar`, not `horizontal-card`.
2. One word has one meaning. If two words mean the same thing, keep the one in this file.
3. A Preset is the only source of truth for a variant. Browser changes are Overrides.
4. A commit that changes one variant uses its id as the scope, for example `feat(catalog/live-sidebar): add ribbon badge`.
