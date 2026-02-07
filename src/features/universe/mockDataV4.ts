/**
 * Mock Data Generator for V4
 * Generates realistic vocab data for testing
 */

import type { UniverseDataV4, VocabWord } from "@/types/universe-v4"

// Sample vocabulary with realistic attributes
const SAMPLE_WORDS = [
  // Level 0: Abstract concepts (Supergiants)
  {
    word: "entity",
    freq: 3200,
    year: 1596,
    level: 0,
    pos: "noun",
    def: "something that exists as a discrete unit",
    theme: "abstract",
  },
  {
    word: "concept",
    freq: 4500,
    year: 1550,
    level: 0,
    pos: "noun",
    def: "an abstract idea or general notion",
    theme: "abstract",
  },

  // Level 1-2: Core vocabulary (Giants/Main Sequence)
  {
    word: "speak",
    freq: 8520,
    year: 1200,
    level: 2,
    pos: "verb",
    def: "to say words orally",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "write",
    freq: 7200,
    year: 900,
    level: 2,
    pos: "verb",
    def: "to mark coherent words on paper or screen",
    theme: "communication",
    sub: "written",
  },
  {
    word: "communicate",
    freq: 5800,
    year: 1530,
    level: 1,
    pos: "verb",
    def: "to share or exchange information",
    theme: "communication",
  },
  {
    word: "learn",
    freq: 9200,
    year: 825,
    level: 2,
    pos: "verb",
    def: "to gain knowledge or skill",
    theme: "education",
  },
  {
    word: "study",
    freq: 6800,
    year: 1300,
    level: 2,
    pos: "verb",
    def: "to devote time to gaining knowledge",
    theme: "education",
  },
  {
    word: "teach",
    freq: 7500,
    year: 1050,
    level: 2,
    pos: "verb",
    def: "to impart knowledge or skill",
    theme: "education",
  },
  {
    word: "code",
    freq: 4200,
    year: 1980,
    level: 2,
    pos: "noun/verb",
    def: "instructions for computers",
    theme: "technology",
    sub: "software",
  },
  {
    word: "algorithm",
    freq: 2800,
    year: 1950,
    level: 3,
    pos: "noun",
    def: "step-by-step problem-solving procedure",
    theme: "technology",
    sub: "software",
  },

  // Level 3-5: Specific vocabulary (Dwarfs/Planets)
  {
    word: "talk",
    freq: 9800,
    year: 1250,
    level: 3,
    pos: "verb",
    def: "informal spoken communication",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "say",
    freq: 12000,
    year: 900,
    level: 3,
    pos: "verb",
    def: "to express in words",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "whisper",
    freq: 1200,
    year: 1400,
    level: 4,
    pos: "verb",
    def: "to speak very softly",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "shout",
    freq: 1500,
    year: 1350,
    level: 4,
    pos: "verb",
    def: "to say something very loudly",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "compose",
    freq: 2200,
    year: 1450,
    level: 3,
    pos: "verb",
    def: "to create written or musical work",
    theme: "communication",
    sub: "written",
  },
  {
    word: "text",
    freq: 8500,
    year: 1369,
    level: 3,
    pos: "noun/verb",
    def: "written words; to send a message",
    theme: "communication",
    sub: "written",
  },
  {
    word: "email",
    freq: 6200,
    year: 1982,
    level: 4,
    pos: "noun/verb",
    def: "electronic mail message",
    theme: "communication",
    sub: "written",
  },
  {
    word: "memorize",
    freq: 1800,
    year: 1591,
    level: 4,
    pos: "verb",
    def: "to commit to memory",
    theme: "education",
  },
  {
    word: "practice",
    freq: 5200,
    year: 1400,
    level: 3,
    pos: "noun/verb",
    def: "repeated exercise to improve skill",
    theme: "education",
  },
  {
    word: "school",
    freq: 8900,
    year: 1050,
    level: 2,
    pos: "noun",
    def: "institution for education",
    theme: "education",
    sub: "institution",
  },
  {
    word: "university",
    freq: 5500,
    year: 1300,
    level: 3,
    pos: "noun",
    def: "higher education institution",
    theme: "education",
    sub: "institution",
  },
  {
    word: "classroom",
    freq: 2800,
    year: 1870,
    level: 4,
    pos: "noun",
    def: "room where teaching takes place",
    theme: "education",
    sub: "institution",
  },
  {
    word: "program",
    freq: 6500,
    year: 1945,
    level: 3,
    pos: "noun/verb",
    def: "set of instructions for a computer",
    theme: "technology",
    sub: "software",
  },
  {
    word: "software",
    freq: 5800,
    year: 1958,
    level: 3,
    pos: "noun",
    def: "programs and operating systems",
    theme: "technology",
    sub: "software",
  },
  {
    word: "debug",
    freq: 1200,
    year: 1947,
    level: 5,
    pos: "verb",
    def: "to find and fix errors in code",
    theme: "technology",
    sub: "software",
  },
  {
    word: "compile",
    freq: 1500,
    year: 1960,
    level: 5,
    pos: "verb",
    def: "to translate source code to machine code",
    theme: "technology",
    sub: "software",
  },

  // Level 6+: Very specific (Moons)
  {
    word: "murmur",
    freq: 800,
    year: 1380,
    level: 6,
    pos: "verb",
    def: "to say something in a low voice",
    theme: "communication",
    sub: "verbal",
  },
  {
    word: "scribble",
    freq: 600,
    year: 1450,
    level: 6,
    pos: "verb",
    def: "to write carelessly or hurriedly",
    theme: "communication",
    sub: "written",
  },
  {
    word: "cram",
    freq: 900,
    year: 1810,
    level: 6,
    pos: "verb",
    def: "to study intensively over a short time",
    theme: "education",
  },
  {
    word: "refactor",
    freq: 800,
    year: 1990,
    level: 7,
    pos: "verb",
    def: "to restructure code without changing behavior",
    theme: "technology",
    sub: "software",
  },
]

// Define relations
const RELATIONS = [
  // Communication hierarchy
  { from: "speak", to: "communicate", type: "hypernym" },
  { from: "write", to: "communicate", type: "hypernym" },
  { from: "speak", to: "talk", type: "synonym" },
  { from: "speak", to: "say", type: "synonym" },
  { from: "talk", to: "whisper", type: "hypernym" },
  { from: "talk", to: "shout", type: "hypernym" },
  { from: "talk", to: "murmur", type: "hypernym" },
  { from: "write", to: "compose", type: "synonym" },
  { from: "write", to: "text", type: "hyponym" },
  { from: "write", to: "email", type: "hyponym" },
  { from: "write", to: "scribble", type: "hyponym" },
  { from: "speak", to: "write", type: "antonym" },

  // Education hierarchy
  { from: "learn", to: "study", type: "synonym" },
  { from: "learn", to: "practice", type: "related" },
  { from: "study", to: "memorize", type: "related" },
  { from: "study", to: "cram", type: "hyponym" },
  { from: "teach", to: "learn", type: "antonym" },
  { from: "school", to: "university", type: "hyponym" },
  { from: "school", to: "classroom", type: "related" },

  // Technology hierarchy
  { from: "code", to: "program", type: "synonym" },
  { from: "code", to: "software", type: "related" },
  { from: "program", to: "algorithm", type: "related" },
  { from: "code", to: "debug", type: "related" },
  { from: "code", to: "compile", type: "related" },
  { from: "code", to: "refactor", type: "related" },

  // Cross-theme
  { from: "write", to: "code", type: "related" },
  { from: "learn", to: "study", type: "synonym" },
  { from: "teach", to: "school", type: "related" },
]

export function generateMockDataV4(count: number = 30): UniverseDataV4 {
  const words: VocabWord[] = []

  // Use sample words (limited to available samples)
  const wordsToUse = SAMPLE_WORDS.slice(0, Math.min(count, SAMPLE_WORDS.length))

  wordsToUse.forEach((sample) => {
    const id = `word_${sample.word}`

    // Find relations for this word
    const relations = RELATIONS.filter((r) => r.from === sample.word).map(
      (r) => ({
        targetId: `word_${r.to}`,
        type: r.type as "synonym" | "hypernym" | "hyponym" | "antonym" | "related",
        strength: 0.5,
      })
    )

    words.push({
      id,
      word: sample.word,
      frequency: sample.freq,
      firstRecordedYear: sample.year,
      hierarchyLevel: sample.level,
      pos: sample.pos,
      definition: sample.def,
      relations,
      themeId: `theme_${sample.theme}`,
      subThemeId: sample.sub ? `sub_${sample.sub}` : undefined,
    })
  })

  return {
    version: "v4.0-static",
    meta: {
      generatedAt: Date.now(),
      wordCount: words.length,
    },
    words,
  }
}

// Generate and save mock data
export const MOCK_DATA_V4 = generateMockDataV4(30)
