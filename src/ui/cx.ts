/** Join class names. A falsy value is skipped. */
export const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ')
