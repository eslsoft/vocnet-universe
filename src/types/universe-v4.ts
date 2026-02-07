/**
 * VOCNET UNIVERSE V4 - Simplified Backend Contract
 *
 * Backend provides simple vocab attributes.
 * Frontend handles all celestial mapping & visualization.
 */

// ==========================================
// Backend Contract (Simple)
// ==========================================

export interface UniverseDataV4 {
  version: "v4.0-static"
  meta: {
    generatedAt: number
    wordCount: number
  }
  words: VocabWord[]
}

export interface VocabWord {
  // Identity
  id: string                    // "word_speak"
  word: string                  // "speak"

  // Core Attributes (Backend analyzes)
  frequency: number             // Usage frequency (1-10000)
  firstRecordedYear: number     // Etymology year (e.g., 1200)
  hierarchyLevel: number        // Depth in hierarchy (0=top, higher=more specific)

  // Semantic Data
  pos: string                   // Part of speech
  definition: string

  // Relations (for physics, not direct rendering)
  relations: VocabRelation[]

  // Grouping (for spatial clustering)
  themeId: string               // "theme_communication"
  subThemeId?: string           // Optional sub-theme
}

export interface VocabRelation {
  targetId: string
  type: "synonym" | "hypernym" | "hyponym" | "antonym" | "related"
  strength?: number             // 0-1, default 0.5
}

// ==========================================
// Frontend Internal Types
// ==========================================

export type CelestialType =
  | "supergiant"
  | "giant"
  | "main_sequence"
  | "dwarf"
  | "white_dwarf"
  | "planet"
  | "moon"

export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M"

export interface CelestialNode {
  // Original vocab data
  id: string
  word: string
  pos: string
  definition: string
  frequency: number
  firstRecordedYear: number
  hierarchyLevel: number

  // Frontend-computed celestial properties
  celestialType: CelestialType
  spectralClass: SpectralClass

  // Visual attributes (computed by frontend)
  color: string               // Mapped from spectralClass
  radius: number              // Computed from frequency + type
  luminosity: number          // Computed from frequency + level
  mass: number                // For physics engine

  // Physics (d3-force)
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number

  // Grouping
  themeId: string
  subThemeId?: string

  // Relations (for interaction)
  relations: VocabRelation[]
}

export interface CelestialLink {
  source: string | CelestialNode
  target: string | CelestialNode
  type: string
  strength: number
}

// ==========================================
// Schema (for backward compatibility)
// ==========================================

export interface UniverseSchema {
  levels: Record<number, { name: string; color: string }>
  linkTypes: Record<string, { label: string; color: string }>
}
