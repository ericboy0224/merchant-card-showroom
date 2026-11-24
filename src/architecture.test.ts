// Enforces the layer rules in docs/DESIGN.md section 4.
// A layer may import only from the layers listed for it below.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

type Layer = 'app' | 'embed' | 'features' | 'ui' | 'plugins' | 'data' | 'domain'

const ALLOWED: Record<Layer, Layer[]> = {
  app: ['features', 'ui', 'plugins', 'data', 'domain'],
  embed: ['ui', 'plugins', 'data', 'domain'],
  features: ['ui', 'plugins', 'data', 'domain'],
  ui: ['plugins', 'domain'],
  plugins: ['domain'],
  data: ['domain'],
  domain: [],
}

// These layers hold no React code.
const NO_REACT: Layer[] = ['domain', 'data']

const SRC = fileURLToPath(new URL('.', import.meta.url))
const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

type SourceFile = { path: string; source: string }

function layerOf(absPath: string): Layer | undefined {
  const first = relative(SRC, absPath).split(sep)[0]
  return first in ALLOWED ? (first as Layer) : undefined
}

function findViolations(files: SourceFile[]): string[] {
  const out: string[] = []
  for (const { path, source } of files) {
    const from = layerOf(path)
    if (!from) continue
    for (const m of source.matchAll(IMPORT_RE)) {
      const spec = m[1] ?? m[2] ?? m[3]
      if (NO_REACT.includes(from) && /^react(-dom)?(\/|$)/.test(spec)) {
        out.push(`${relative(SRC, path)}: layer "${from}" must not import ${spec}`)
        continue
      }
      const target = spec.startsWith('@/')
        ? join(SRC, spec.slice(2))
        : spec.startsWith('.')
          ? resolve(dirname(path), spec)
          : undefined
      const to = target && layerOf(target)
      if (to && to !== from && !ALLOWED[from].includes(to)) {
        out.push(`${relative(SRC, path)}: layer "${from}" must not import layer "${to}" (${spec})`)
      }
    }
  }
  return out
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : []
  })
}

describe('layer rules', () => {
  it('flags an upward import', () => {
    const v = findViolations([
      { path: join(SRC, 'domain/card.ts'), source: `import { x } from '@/ui/Card'` },
    ])
    expect(v).toHaveLength(1)
  })

  it('flags an upward relative import', () => {
    const v = findViolations([
      { path: join(SRC, 'data/store.ts'), source: `import { y } from '../features/showroom'` },
    ])
    expect(v).toHaveLength(1)
  })

  it('flags React in the domain layer', () => {
    const v = findViolations([
      { path: join(SRC, 'domain/card.ts'), source: `import { useState } from 'react'` },
    ])
    expect(v).toHaveLength(1)
  })

  it('allows a downward import and an import inside one layer', () => {
    const v = findViolations([
      { path: join(SRC, 'ui/Card.tsx'), source: `import { z } from '@/domain/schema'\nimport { p } from './parts/Price'` },
    ])
    expect(v).toEqual([])
  })

  it('has no violation in src', () => {
    const files = walk(SRC).map((path) => ({ path, source: readFileSync(path, 'utf8') }))
    expect(findViolations(files)).toEqual([])
  })
})
