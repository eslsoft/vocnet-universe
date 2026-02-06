import type { UniverseSchema } from "@/types/universe"

// ==========================================
// Fallback defaults (used when schema is missing an entry)
// ==========================================

const FALLBACK_LEVEL_COLOR = "#cccccc"
const FALLBACK_LINK_COLOR = "#475569"

/** Deterministic color from string hash — stable across renders */
function hashColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  const hue = ((h >>> 0) % 360)
  return `hsl(${hue}, 60%, 55%)`
}

// ==========================================
// Schema Resolvers
// ==========================================

export function resolveNodeColor(schema: UniverseSchema | undefined, level: number): string {
  return schema?.levels[level]?.color ?? FALLBACK_LEVEL_COLOR
}

export function resolveLinkColor(schema: UniverseSchema | undefined, type: string): string {
  if (schema?.linkTypes[type]?.color) return schema.linkTypes[type].color
  return hashColor(type) ?? FALLBACK_LINK_COLOR
}

export function resolveLevelName(schema: UniverseSchema | undefined, level: number): string {
  return schema?.levels[level]?.name ?? `Level ${level}`
}
