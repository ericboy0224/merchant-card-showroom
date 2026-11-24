// A small logger for storage reads, writes, sync messages, and dropped values.
export type LogEvent = 'read' | 'write' | 'sync' | 'drop'

export interface Logger {
  log(event: LogEvent, detail?: Record<string, unknown>): void
}

export const consoleLogger: Logger = {
  log(event, detail) {
    const write = event === 'drop' ? console.warn : console.debug
    write('[momo-showroom]', event, detail ?? '')
  },
}

export const silentLogger: Logger = { log() {} }
