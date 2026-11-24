/** A migration turns the stored value of version N into the value of version N + 1. */
export type Migration = (stored: unknown) => unknown
export type MigrationRegistry = Record<number, Migration>

/** Run the migrations from one stored version up to the target version. */
export function migrate(
  stored: unknown,
  from: number,
  to: number,
  registry: MigrationRegistry,
): unknown {
  let value = stored
  for (let v = from; v < to; v++) {
    const step = registry[v]
    if (!step) throw new Error(`No migration from version ${v} to ${v + 1}`)
    value = step(value)
  }
  return value
}
