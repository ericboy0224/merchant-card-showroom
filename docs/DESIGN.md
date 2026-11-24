# Design

> **Tradeoffs at a glance: [Interactive tradeoff analysis](https://claude.ai/artifact/UQHDsnLLSwHS6fnVmHsADM)**
> The page lists 14 technical decisions. Each one shows the options, how they work, their pros and cons, and the option that we chose. The page text is in Traditional Chinese. Section 12 below has the short version.

Status: draft. Read [PRD-card-analysis.md](PRD-card-analysis.md) for the research and [GLOSSARY.md](GLOSSARY.md) for the vocabulary.
This file records the decisions and the tradeoffs behind them.

## 1. Goals

- Show three card variants (`search-result`, `home-feed`, `live-sidebar`) from one shared model.
- Let a developer find the right layer for a change without reading the whole codebase.
- Let a developer answer "why is this card configured this way" from the code and from Git.
- Let any HTML page embed a card with one script tag.

## 2. Non-goals

- No real momo API, login, cart, or purchase flow.
- No pixel-perfect styling and no real brand assets.
- No mobile web layout polish. The Showroom only needs to stay usable at 360 px width and up.
- No server-side rendering.

## 3. Stack

| Choice | Decision | Reason |
|--------|----------|--------|
| Build tool | Vite | Fast dev server. Library mode builds the embed bundle. |
| UI | React 19 and TypeScript | Chosen by the author. Strict types support the schema-first design. |
| Schema | Zod | One definition gives the TypeScript type, the runtime validation, and the form rules. |
| Styling | CSS Modules and CSS variables | Class names stay local. Variables cross the Shadow DOM boundary for theming. |
| State | `useSyncExternalStore` over a small store | No extra dependency. The store is plain TypeScript and the embed can reuse it. |
| Routing | Hash routes, no router library | The Showroom has two views, list and detail. A library adds weight for no gain. |
| Tests | Vitest | Same configuration as Vite. |

## 4. Layered architecture

Each layer has one job. A layer can import only from the layers below it in the table.

| Layer | Folder | Job | Can import |
|-------|--------|-----|------------|
| App | `src/app` | Routes, providers, and the composition root of the Showroom. | everything below |
| Embed | `src/embed` | The `<momo-card>` Custom Element and the library entry. | `ui`, `plugins`, `data`, `domain` |
| Features | `src/features` | Showroom list, card detail, and the editor. Each feature binds data to UI. | `ui`, `plugins`, `data`, `domain` |
| UI | `src/ui` | Presentational components. Props in, JSX out. No data access. | `plugins`, `domain` |
| Plugins | `src/plugins` | Registries for badges and layouts, plus the built-in plugins. | `domain` |
| Data | `src/data` | Repository interface, mock source, the store, `localStorage` adapter, cross-tab sync. | `domain` |
| Domain | `src/domain` | Types, Zod schemas, Presets, pure functions. No React and no browser API. | nothing |

`app` and `embed` are two separate entry points. They never import each other.

### Why these layers

- A bug in saved data is a `data` problem. A bug in layout is a `ui` problem. A new badge is a `plugins` change.
- The Repository hides the mock source. A real API replaces one file in `data` and nothing else.
- The `domain` layer has no dependency. A developer can read it first and learn the whole vocabulary.

### Enforcement

An architecture test in `src/architecture.test.ts` encodes the table. It reads every import in `src` and fails on a wrong one.
It resolves both `@/` alias imports and relative imports, so a relative path cannot bypass the rule.
It also blocks React imports in `domain` and `data`.
A path lint rule was rejected. It needs an extra parser and it misses relative paths.

## 5. Card configuration

### Preset and Override

A Preset is the configuration of one Card Variant. It lives in `src/domain/catalog/` as one file per variant, for example `live-sidebar.ts`.
Git tracks every Preset. A Preset must have these fields:

| Field | Meaning |
|-------|---------|
| `id` | Variant id, equal to the file name. |
| `surface` | The place where the card appears. |
| `layout` | `vertical` or `horizontal`. |
| `fields` | The optional groups that the variant uses. |
| `rationale` | One sentence that explains why the card is configured this way. |

The Zod schema rejects a Preset without `surface` or `rationale`. This rule keeps the reason next to the configuration.

An Override is a change that an Operator makes in the browser. It is stored by card id.
It holds only the fields that the Operator changed, plus an `updatedAt` timestamp.
An Operator is a business user who edits content without a code release. Developers change Presets through Git.
The mock `localStorage` store stands in for a database. A real database replaces only the adapter in `src/data`.
An Override never edits a Preset and never edits the Repository data.

Three inputs make the card on screen:

| Input | Source | What it decides |
|-------|--------|-----------------|
| Card Data | Repository (mock source) | The content of one card: title, price, image, and so on. |
| Preset | `src/domain/catalog` | The layout and the field groups of the variant. |
| Override | Browser store | The Operator edits to Card Data fields. |

A pure function, `resolveCard(cardData, preset, override)`, returns the card to render.
To reset a card, the app deletes its Override.

### Card Data

`CardData` has a required core: `id`, `title`, `price`, and `image`.
Optional groups hold the rest: `pricing`, `rating`, `sales`, `slogan`, `badges`, `action`, and `media`.
The optional `flags` field is a list of names. A plugin reads it. It is not an Optional Group, so a Preset does not list it.
The Zod schema in `src/domain` is the only definition. Every other type comes from `z.infer`.

### Editable fields

The editor changes `title`, `price`, `pricing.original`, `rating`, and `badges`. The form comes from the same schema.

## 6. Layout: shared parts, separate templates

The three variants share most fields. The vertical variants and the horizontal variant differ in structure.

- Shared parts live in `src/ui/parts`: `CardMedia`, `CardTitle`, `CardSlogan`, `CardPrice`, `CardRating`, `CardSales`, `CardAction`, and `BadgeList`.
- Two templates compose the parts: `VerticalLayout` and `HorizontalLayout`.
- A layout registry maps the `layout` value to a template.

Rejected alternatives:

| Option | Reason for rejection |
|--------|----------------------|
| One component with `if (layout)` branches | The branches grow with every variant. |
| One component with only a CSS direction change | The DOM differs. The horizontal card has a button and a ribbon. The vertical card has a slogan and a sales line. |
| Two separate card components | Field definitions and the editor repeat. The two copies drift apart. |

## 7. Plugins

A Badge Plugin adds a badge type without a change to the core.

```ts
registerBadge('sponsored', {
  placement: 'overlay',
  appliesTo: (card) => card.flags?.includes('sponsored') === true,
  render: () => <span>Ad</span>,
});
```

- The registry maps a badge type to its renderer. An unknown type renders nothing.
- The built-in badge types are `event`, `ribbon`, `coupon`, `fast-delivery`, and `sponsored`. Only `sponsored` follows a Flag. It is the first example. A store marker can follow.
- `sample.html` registers one badge from outside the bundle to show the extension point.
- Plugin styles use CSS variables, so a card theme still applies inside the Shadow DOM.

## 8. State and persistence

- The store holds Overrides in memory and writes them to `localStorage`.
- The storage key is `momo-showroom:v1:overrides`. The `v1` part is the schema version.
- On load, Zod validates the stored value. The data layer drops each invalid entry, keeps the valid ones, and logs it. It then writes the cleaned map back to `localStorage`. The Preset applies to a dropped card.
- A new schema version needs a migration function. The migration registry sits in `src/data`.
- The browser `storage` event tells other tabs about each write. Those tabs reload the changed Override.
- Components in one page, such as two `<momo-card>` elements, sync through the store subscription. The `storage` event does not fire in the tab that wrote the value.
- Conflict rule: the latest write for one card wins. Each Override carries an `updatedAt` timestamp.

## 9. Embed API

```html
<script type="module" src="./dist/momo-card.js"></script>
<momo-card card-id="live-sidebar-001"></momo-card>
```

- The element reads the card from the Repository and applies the Override from the store.
- The element renders into a Shadow DOM, so page styles do not leak in.
- Vite imports component styles with `?inline`. The element copies them into the shadow root.
- Version 1 supports the `card-id` attribute only. A `data` attribute for external JSON is a future option.
- The bundle exports `registerBadge`, `registerLayout`, and `cardStore`. A host page uses them to add a badge or a layout, or to read the store.
- Vite library mode builds the bundle. The bundle includes React.
- The measured size of `dist/momo-card.js` is 432 kB raw and 110.5 kB gzip. The build writes no CSS file, because the element carries its styles inside the bundle.

## 10. Testing and observability

- Vitest covers the schemas, `resolveCard`, the store, the migration, the registries, card rendering, the editor form, and the layer rules.
- A small logger in `src/data` records storage reads, writes, sync messages, and dropped values.
- No end-to-end test in the first version.

## 11. Delivery plan

Time box for Phase 2 is 120 minutes. Each step is one commit.
Every step ends with passing `typecheck`, `oxlint`, and `vitest`. Steps 4 to 6 add a manual walkthrough in the browser.

| Step | Scope | Acceptance criteria |
|------|-------|---------------------|
| 1 | Project scaffold and the architecture test. | The three commands pass. The architecture test fails on a wrong import. |
| 2 | `domain`: schemas, Presets, fixtures, `resolveCard`. | The schema accepts valid `CardData` and rejects invalid data. All three Presets pass the schema and have `surface` and `rationale`. `resolveCard` applies an Override. |
| 3 | `data`: Repository, store, persistence, sync. | The store saves an Override and reads it back. An invalid stored entry is dropped, the cleaned map is written back, and the Preset applies. A `storage` event updates the store. Reset removes the Override. |
| 4 | `ui` and `plugins`: shared parts, two layouts, badge registry, the sponsored plugin. | Tests render all three variants to a string. A card with missing optional fields still renders. An unknown badge type renders nothing. The sponsored plugin adds the Ad marker. |
| 5 | `features` and `app`: list view, detail view, editor. | In the browser, an Operator opens the list, opens one card, edits the title and price, reloads, and still sees the edit. Reset restores the Preset values. |
| 6 | `embed` and `sample.html`. | `sample.html` loads the bundle with one script tag and shows two cards. Page styles do not change the cards. A new badge registers from outside the bundle. |
| 7 | README. | It has the architecture summary, the run steps, the tradeoff links, the list of cut items, and the next steps. All links open. |

Time can run short. In that case, cut the `home-feed` variant first, then cross-tab sync, then the migration function.

## 12. Tradeoffs

| Decision | Gain | Cost |
|----------|------|------|
| Seven layers for a small app | A change stays inside one layer. A reviewer sees the structure. | More folders and an architecture test to maintain. |
| Preset and Override split | Git history explains each card. An Operator can reset any card. | A merge step for every read. |
| Shared parts and separate layout templates | One field definition and one editor. No layout branches. | One more registry. The part interfaces need care. |
| React inside the embed | One rendering path for the app and the embed. | React and `react-dom` alone are 76.6 KB gzip. The whole bundle is 110.5 KB gzip. |
| CSS Modules and CSS variables | Local class names. Variables cross the Shadow DOM boundary. | The embed build must copy styles into the shadow root. |
| Own store with `useSyncExternalStore` | No dependency. The embed shares the store. | We write the subscribe logic and no devtools exist. |
| `storage` event for tab sync | Native and almost no code. | It works only for `localStorage`. Another medium needs `BroadcastChannel`. |
| Hash routing | No dependency. | No nested routes or route guards. |
| Latest write wins | Simple to explain and test. | An Operator can lose a concurrent change in another tab. |
| Embed takes `card-id` only | The smallest interface. It matches the Preset design. | A host page cannot pass its own data. |
| Unit tests only | Fast tests that guard the core rules. | No test covers user interaction in the browser. |

## 13. Next steps after the take-home

The list is in priority order. A maintainer starts with 13.1 to 13.3. A card that lives on pages that the team does not own gains the most from them.

### 13.1 Make the Embed a contract

The Embed is a distributed product. A host page cannot read our code, so the interface must stay stable and observable.

- Add a version. The element exposes a `version` property, and the bundle name carries the major version. A major change ships as a new file name, so old host pages keep working.
- Emit events: `momo-card:ready` after the first render, `momo-card:action` after a click on the action, and `momo-card:error` after a failed render or invalid data. The events bubble out of the shadow root. A host page uses them for analytics and error reporting.
- Document the public surface: the attributes, the events, the CSS variables for themes, and the badge registration function. Everything else is private and can change.
- Add a `data` attribute for external JSON. The Card Data schema validates it.
- Test the bundle on a page with a strict Content Security Policy. Remove any inline script or style that the policy blocks.
- Replace React with Preact in the Embed build, and set a bundle size budget in CI.

### 13.2 Show the cost of change

The design claims that a change stays inside one layer. The next step is to prove it.

- Write a walkthrough in the README for a fourth Card Variant. List the files that change: one Preset file, the variant and surface lists in `src/domain/card.ts`, `src/domain/catalog/index.ts`, one fixture, and one glossary line. List the files that must not change.
- Back the walkthrough with a test. The test registers a new variant and a new badge, renders them, and touches no core file.
- Add contract tests. A Preset without a `rationale` fails the schema. A plugin with a wrong shape is rejected at registration.
- Write a migration for each schema change. Keep one fixture of stored data per version, and load it in a test.

### 13.3 Set a quality floor

- Accessibility: each image has a text alternative and each card is an `article`. Add a visible focus state and keyboard use of the action. Run axe on the rendered cards in tests, and do one manual keyboard pass.
- Image loading: images already use `loading="lazy"` and a fixed media box. Add `srcset` and `sizes` for real images, and a placeholder that matches each image.
- List performance: measure the Showroom with 1,000 cards. Add windowing after the numbers show a need.
- Observability: send logger output from the `data` layer to an interface that a host page can replace. Report dropped storage values and render errors through it.
- End-to-end tests with Playwright for the edit, reload, and reset flow, and for two tabs.
- Real devices and other browsers. Only Chrome at phone width was checked.

### 13.4 Product and process

These topics belong mostly to backend and product teams. The frontend must still be ready for them.

- Field ownership: mark each field in the schema as system-owned or Operator-owned. System-owned fields (price, original price, rating, and sales) are read-only for an Operator. The editor changes the price today only to demonstrate the form. The server must enforce ownership, because a hidden field does not stop a request.
- Review and publish: give an Override a status (draft, in review, approved, published), a version, an author, and a reviewer. Shoppers see only published versions. A rollback publishes the previous version.
- Campaign timing: add scheduled publish and batch edits for sale periods.
- Measurement: use the Embed events for click and conversion metrics, so that variants and slogans can run in an A/B test.

### 13.5 Other follow-ups

- Replace the mock Repository with a real API client.
- Use `BroadcastChannel` for sync after the store moves from `localStorage` to IndexedDB.
- Replace latest write wins with a version number comparison after several Operators start to edit at once.
