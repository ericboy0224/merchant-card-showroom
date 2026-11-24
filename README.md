# Merchant Card Showroom

A small app that shows three momo-style product cards from one shared model. An Operator can edit a card in the browser. Any HTML page can embed a card with one script tag.

Watch the [demo video](https://drive.google.com/file/d/1Nei7cqElZrc9LUGrX0ckT36800objsQD/view?usp=drivesdk). It runs 38 seconds. It shows the list, an edit that survives a reload, a reset, and the Embed on a sample page.

Read [docs/GLOSSARY.md](docs/GLOSSARY.md) for the terms. Read [docs/DESIGN.md](docs/DESIGN.md) for the decisions. Read [docs/PRD-card-analysis.md](docs/PRD-card-analysis.md) for the research.

## Run

You need Node.js 22 or newer.

1. Run `npm install`.
2. Run `npm run dev` and open the address that Vite prints. The Showroom shows all cards. Click a card to edit it.
3. Run `npm run verify` to run the type check, the linter, and the tests.

To try the Embed:

1. Run `npm run build`. It writes the app and `dist/momo-card.js`.
2. Run `npm run dev`, then open `/sample.html` on the dev server address.

`sample.html` loads the bundle with one script tag. It shows two cards on a page with hostile styles. It also registers a new badge from outside the bundle.

## Architecture

The code has seven layers. A layer imports only from the layers below it. `src/architecture.test.ts` enforces this.

| Layer | Folder | Job |
|-------|--------|-----|
| App | `src/app` | Routes and the composition root of the Showroom. |
| Embed | `src/embed` | The `<momo-card>` Custom Element and the library entry. |
| Features | `src/features` | Showroom list, card detail, and the editor. |
| UI | `src/ui` | Presentational components: shared parts and two layouts. |
| Plugins | `src/plugins` | Registries for badges and layouts, and the built-in badges. |
| Data | `src/data` | Repository, Store, `localStorage` adapter, migrations, tab sync. |
| Domain | `src/domain` | Zod schemas, Presets, fixtures, and `resolveCard`. No React. |

Three inputs make a card on screen:

- Card Data comes from the Repository. A mock source sits behind it.
- A Preset sets the layout and the field groups of one Card Variant. It lives in `src/domain/catalog`, and Git tracks it. Each Preset has a `rationale` that explains why.
- An Override holds the edits of an Operator. The Store keeps it in `localStorage`.

The pure function `resolveCard(cardData, preset, override)` merges the three. Reset deletes the Override.

## Tradeoffs

- [Design document](docs/DESIGN.md) records each decision. Section 12 lists the gain and the cost of each one.
- [Interactive tradeoff analysis](https://claude.ai/artifact/UQHDsnLLSwHS6fnVmHsADM) shows 14 decisions with their options. The page text is in Traditional Chinese.
- [Interactive card analysis](https://claude.ai/artifact/MuYREgBwqw1SA5CPEn254z) shows the three card variants and the shared data model. The page text is in Traditional Chinese.

## What we did not build

- No real momo API, login, cart, or purchase flow.
- No pixel-perfect styling and no real brand assets. Images are inline SVG placeholders.
- No mobile layout work and no server-side rendering.
- No end-to-end test. Unit tests cover the domain, the data layer, the registries, and card rendering.
- The Embed takes `card-id` only. It has no `data` attribute for external JSON.
- Sync between tabs uses the `storage` event. The latest write for one card wins.
- The migration registry is empty. Version 1 is the first schema version.

## Next steps

Three things come first. [Design document section 13](docs/DESIGN.md) has the detail and the other follow-ups.

- Make the Embed a contract: a version, events for the host page, a documented public surface, and a `data` attribute.
- Show the cost of change: a walkthrough and a test that add a fourth Card Variant without a change to the core.
- Set a quality floor: accessibility tests, responsive images, list performance, and end-to-end tests.
