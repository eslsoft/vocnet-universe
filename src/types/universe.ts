/**
 * VOCNET UNIVERSE V4 - Simplified Backend Contract
 * 
 * Backend provides simple vocab attributes.
 * Frontend handles all celestial mapping & visualization.
 */

export interface UniverseData {
  version: "v4.0-static"
  meta: {
    id?: string
    name?: string
    generatedAt: number
    wordCount: number
  }
  galaxies?: GalaxyConfig[]
  words: VocabWord[]
}

export interface GalaxyConfig {
  id: string
  name: string
  color: string
  center: { x: number; y: number; z: number }
}

export interface VocabWord {
  // Identity
  id: string                    // e.g., "word_speak"
  word: string                  // e.g., "speak"

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
  galaxyId: string              // "galaxy_tech"
  solarSystemId?: string        // Optional sub-group
}

export interface VocabRelation {
  targetId: string
  type: "synonym" | "hypernym" | "hyponym" | "antonym" | "related"
  strength?: number             // 0-1, default 0.5
}

export interface UniverseConfig {
  id: string
  name: string
  url: string
  description?: string
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

  // Visual attributes
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
  galaxyId: string
  solarSystemId?: string

  // Relations (for interaction)
  relations: VocabRelation[]
}

export interface CelestialLink {
  source: string | CelestialNode
  target: string | CelestialNode
  type: string
  strength: number
}
