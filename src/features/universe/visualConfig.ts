/**
 * Visual Configuration
 * Frontend-owned rules for mapping vocab attributes to celestial properties
 */

import type { CelestialType, SpectralClass } from "@/types/universe"

export const VISUAL_CONFIG = {
  // Spectral class color mapping (VIVID stellar colors for better contrast)
  spectralColors: {
    O: "#4d9fff", // Brilliant blue (hottest, newest words like "algorithm", "refactor")
    B: "#7db4ff", // Blue-white (recent tech words like "email", "website")
    A: "#d4e4ff", // White (modern words 20-50 years)
    F: "#fffacd", // Pale yellow (50-100 years)
    G: "#ffdd55", // Bright yellow (100-300 years, like our Sun)
    K: "#ff8c42", // Bright orange (300-500 years old)
    M: "#ff4757", // Deep red (ancient words 500+ years, like "speak", "learn")
  } as Record<SpectralClass, string>,

  // Base sizes for each celestial type
  // Stars (central bodies) are LARGE, planets/moons are SMALL
  baseSizes: {
    supergiant: 100,    // 超大恒星（极少数顶层词）
    giant: 70,          // 大恒星（少数核心词）
    main_sequence: 45,  // 主序星（常用核心词）
    dwarf: 20,          // 矮行星（具体词）
    white_dwarf: 18,    // 白矮星
    planet: 18,         // 行星（围绕恒星）
    moon: 10,           // 卫星（围绕行星）
  } as Record<CelestialType, number>,

  // Age thresholds (years ago)
  ageThresholds: {
    ancient: 500, // >500 years → M-class (red)
    old: 300, // 300-500 → K-class (orange)
    mature: 100, // 100-300 → G-class (yellow)
    modern: 50, // 50-100 → F-class (white-yellow)
    recent: 20, // 20-50 → A-class (white)
    new: 0, // <20 → O/B-class (blue)
  },

  // Hierarchy to celestial type mapping rules
  hierarchyRules: [
    { maxLevel: 0, minFreq: 0, type: "supergiant" as CelestialType },
    { maxLevel: 1, minFreq: 5000, type: "giant" as CelestialType },
    { maxLevel: 1, minFreq: 2000, type: "main_sequence" as CelestialType },
    { maxLevel: 3, minFreq: 0, type: "main_sequence" as CelestialType },
    { maxLevel: 5, minFreq: 0, type: "dwarf" as CelestialType },
    { maxLevel: 7, minFreq: 0, type: "planet" as CelestialType },
    { maxLevel: Infinity, minFreq: 0, type: "moon" as CelestialType },
  ],

  // Physics engine parameters
  physics: {
    linkDistance: 150, // Default link length
    linkStrength: 0.3, // Link strength (for drag interaction)
    chargeStrength: -300, // Repulsion force
    centerStrength: 0.05, // Attraction to center
    collideRadiusMultiplier: 1.5, // Collision radius multiplier
  },

  // Label visibility rules
  labels: {
    alwaysShow: ["supergiant", "giant"], // Always show these types
    showOnHover: true,
    showOnSelect: true,
    showNeighborsOnSelect: true,
  },
} as const

export function getSpectralColor(spectralClass: SpectralClass): string {
  return VISUAL_CONFIG.spectralColors[spectralClass]
}

export function getBaseSize(celestialType: CelestialType): number {
  return VISUAL_CONFIG.baseSizes[celestialType]
}

// Planet colors by theme (not by age)
export const PLANET_COLORS: Record<string, string> = {
  theme_abstract: "#9ca3af",      // Gray - neutral
  theme_communication: "#60a5fa", // Blue - talking
  theme_education: "#34d399",     // Green - growth
  theme_technology: "#a78bfa",    // Purple - tech
  theme_science: "#fbbf24",       // Amber - discovery
  theme_emotion: "#f472b6",       // Pink - feelings
  theme_action: "#fb923c",        // Orange - energy
}

export function getGalaxyColor(galaxyId: string): string {
  return PLANET_COLORS[galaxyId] || "#9ca3af"
}
