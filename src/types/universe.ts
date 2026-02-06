/**
 * VOCNET UNIVERSE PROTOCOL v2.0
 *
 * Schema-driven contract between Data Pipeline and Visualization Engine.
 * The frontend renders entirely from the schema — no hardcoded level names,
 * relation types, or colors.
 */

// ==========================================
// 1. Schema Definitions (Visual Metadata)
// ==========================================

export interface LevelDef {
  name: string   // "Galaxy", "Nebula", etc.
  color: string  // "#a855f7"
}

export interface LinkTypeDef {
  label: string  // "Is a..."
  color: string  // "#f472b6"
}

export interface UniverseSchema {
  levels: Record<number, LevelDef>
  linkTypes: Record<string, LinkTypeDef>
}

// ==========================================
// 2. Node Definition
// ==========================================

export interface UniverseNode {
  id: string
  label: string

  // Spatial Coordinates
  x: number
  y: number
  z: number

  // Visual Attributes
  val: number    // Size/Mass
  level: number  // 1=Galaxy, 2=Nebula, 3=Star, 4=Planet
  color?: string // Optional override
  groupId?: string // Phase 2: Theme/Group association

  // Semantic Payload
  data?: {
    definition?: string
    pos?: string
    context?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

// ==========================================
// 3. Link Definition
// ==========================================

export interface UniverseLink {
  source: string
  target: string
  type: string    // Matches key in schema.linkTypes
  value?: number  // Strength/Thickness
}

/** After d3-force resolves, source/target become objects */
export type LinkSourceTarget = string | { id: string }

// ==========================================
// 4. Group Definition (Phase 2)
// ==========================================

export interface UniverseGroup {
  id: string
  label: string
  color: string
  center: { x: number; y: number; z: number }
}

// ==========================================
// 5. Master Payload
// ==========================================

export interface UniverseGraphData {
  version: string
  meta: {
    generatedAt: number
    nodeCount: number
    linkCount: number
  }
  schema: UniverseSchema
  nodes: UniverseNode[]
  links: UniverseLink[]
  groups?: UniverseGroup[]
}
