# Agent guide

Read [docs/GLOSSARY.md](docs/GLOSSARY.md) and [docs/DESIGN.md](docs/DESIGN.md) before you change code.
This repo is public. Human and AI contributors follow the same rules.

## Rules

- Write code, comments, docs, and commit messages in English.
- Use the terms in the glossary. Add a new term to the glossary in the same commit that introduces it.
- Import across layers with the `@/` alias. A layer imports only from the layers below it. `src/architecture.test.ts` enforces this.
- Do not run `npm run dev` or `npm run build` until all steps are committed and `npm run verify` passes. Run them only in the final QA step. CI also runs the build.
- Before each QA iteration, stop every dev server and preview process that an earlier iteration started, and delete `dist`. Run one server at a time. After each iteration, stop the server and confirm that no process listens on its port, for example with `lsof -i :5173`.
- Do not add a dependency without a reason in DESIGN.md sections 3 and 12.
- Do not change a Preset without an update to its `rationale`.
- Do not change a recorded decision in DESIGN.md without approval from the maintainer. Propose the change first.
- Never commit secrets, `.env` files, or local settings.

## Definition of done

1. `npm run verify` passes. It runs `typecheck`, `oxlint`, and `vitest`.
2. The acceptance criteria of the step in DESIGN.md section 11 are met.
3. One step makes one commit.

## Commits

- Use Conventional Commits: `type(scope): subject`. The subject has 72 characters or fewer.
- Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`.
- Use a layer name or a Card Variant id as the scope, for example `feat(catalog/live-sidebar): add ribbon badge`.
- Make one commit for one complete change that passes `npm run verify` on its own. Do not split one change into small test commits. Do not mix unrelated changes.
- Write the reason for the change in the body of the message. The history must let a reviewer follow the work.
- End a commit that AI produced with a `Co-Authored-By` trailer.
- A Git hook enforces the format and runs `npm run verify` before each commit.

## Docs style

- Write short sentences. Use one word for one meaning.
- Do not leave traces of a chat or a discussion in a doc. A doc records the decision and the reason.
