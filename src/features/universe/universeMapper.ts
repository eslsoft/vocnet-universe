/**
 * Universe Mapper
 * Converts simple vocab data to celestial nodes with full visual properties
 */

import type {
  VocabWord,
  CelestialNode,
  CelestialType,
  SpectralClass,
  CelestialLink,
} from "@/types/universe-v4"
import { VISUAL_CONFIG, getSpectralColor, getBaseSize, getPlanetColor } from "./visualConfig"

export class UniverseMapper {
  /**
   * Map hierarchy level + frequency to celestial type
   * KEY: Level 0-2 = Stars (central bodies)
   *      Level 3-5 = Planets (orbit stars)
   *      Level 6+ = Moons (orbit planets)
   */
  mapToCelestialType(level: number, frequency: number): CelestialType {
    // Level 0: Abstract concepts = Supergiants (very few, central)
    if (level === 0) return "supergiant"

    // Level 1: High-level concepts = Giants (few, central stars)
    if (level === 1) {
      return frequency > 6000 ? "giant" : "main_sequence"
    }

    // Level 2: Core vocabulary = Main sequence stars (central bodies)
    if (level === 2) {
      return frequency > 7000 ? "giant" : "main_sequence"
    }

    // Level 3-4: Specific words = Planets (orbit stars)
    if (level <= 4) {
      return "planet"
    }

    // Level 5-6: Very specific = Dwarf planets / Large moons
    if (level <= 6) {
      return "dwarf"
    }

    // Level 7+: Extremely specific = Moons (orbit planets)
    return "moon"
  }

  /**
   * Map year to spectral class (age → temperature → color)
   */
  mapYearToSpectral(year: number): SpectralClass {
    const age = 2024 - year
    const { ancient, old, mature, modern, recent } = VISUAL_CONFIG.ageThresholds

    if (age > ancient) return "M" // Ancient → red
    if (age > old) return "K" // Old → orange
    if (age > mature) return "G" // Mature → yellow
    if (age > modern) return "F" // Modern → white-yellow
    if (age > recent) return "A" // Recent → white
    return "O" // New → blue
  }

  /**
   * Map frequency to size (with celestial type base)
   */
  mapToSize(frequency: number, type: CelestialType): number {
    const baseSize = getBaseSize(type)

    // Frequency influences size (±30%)
    const frequencyFactor = Math.log10(Math.max(frequency, 1)) / 4
    return baseSize * (0.7 + frequencyFactor * 0.6)
  }

  /**
   * Calculate luminosity (brightness) from frequency + hierarchy
   */
  mapToLuminosity(frequency: number, level: number): number {
    // Higher frequency + higher in hierarchy = brighter
    const freqScore = Math.min(frequency / 10000, 1)
    const levelScore = Math.max(0, (10 - level) / 10)
    return (freqScore * 0.6 + levelScore * 0.4) * 100
  }

  /**
   * Convert vocab word to celestial node
   */
  vocabToCelestial(word: VocabWord): CelestialNode {
    const celestialType = this.mapToCelestialType(
      word.hierarchyLevel,
      word.frequency
    )

    // Stars: colored by age (red → yellow → blue)
    // Planets/Moons: colored by theme
    const isStar =
      celestialType === "supergiant" ||
      celestialType === "giant" ||
      celestialType === "main_sequence"

    let color: string
    let spectralClass: SpectralClass

    if (isStar) {
      // Stars use age-based spectral colors
      spectralClass = this.mapYearToSpectral(word.firstRecordedYear)
      color = getSpectralColor(spectralClass)
    } else {
      // Planets use theme-based colors
      color = getPlanetColor(word.themeId)
      spectralClass = "G" // Placeholder, not used for planets
    }

    const radius = this.mapToSize(word.frequency, celestialType)
    const luminosity = this.mapToLuminosity(word.frequency, word.hierarchyLevel)
    const mass = word.frequency / 10

    return {
      id: word.id,
      word: word.word,
      pos: word.pos,
      definition: word.definition,
      frequency: word.frequency,
      firstRecordedYear: word.firstRecordedYear,
      hierarchyLevel: word.hierarchyLevel,
      celestialType,
      spectralClass,
      color,
      radius,
      luminosity,
      mass,
      themeId: word.themeId,
      subThemeId: word.subThemeId,
      relations: word.relations,
    }
  }

  /**
   * Build links from vocab words
   */
  buildLinks(words: VocabWord[]): CelestialLink[] {
    const links: CelestialLink[] = []

    words.forEach((word) => {
      word.relations.forEach((rel) => {
        links.push({
          source: word.id,
          target: rel.targetId,
          type: rel.type,
          strength: rel.strength ?? 0.5,
        })
      })
    })

    return links
  }

  /**
   * Convert full dataset
   */
  mapDataset(words: VocabWord[]): {
    nodes: CelestialNode[]
    links: CelestialLink[]
  } {
    const nodes = words.map((w) => this.vocabToCelestial(w))
    const links = this.buildLinks(words)
    return { nodes, links }
  }
}
