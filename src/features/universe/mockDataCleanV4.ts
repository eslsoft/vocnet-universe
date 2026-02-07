/**
 * Clean Mock Data with EXPLICIT hierarchy
 * Each planet knows exactly which star to orbit
 */

import type { UniverseDataV4, VocabWord } from "@/types/universe-v4"

// Star Systems - explicit parent-child relationships
const STAR_SYSTEMS = [
  // Communication Theme
  {
    star: {
      word: "communicate",
      freq: 5800,
      year: 1530,
      level: 1,
      pos: "verb",
      def: "to share or exchange information",
      theme: "communication",
    },
    planets: [
      // NOTE: speak, write removed - they are stars themselves with their own systems
      { word: "listen", freq: 6800, year: 1200, level: 3, pos: "verb", def: "to give attention with the ear", sub: "verbal" },
    ],
  },
  {
    star: {
      word: "speak",
      freq: 8520,
      year: 1200,
      level: 2,
      pos: "verb",
      def: "to say words orally",
      theme: "communication",
      sub: "verbal",
    },
    planets: [
      { word: "talk", freq: 9800, year: 1250, level: 4, pos: "verb", def: "informal spoken communication" },
      { word: "say", freq: 12000, year: 900, level: 4, pos: "verb", def: "to express in words" },
      { word: "whisper", freq: 1200, year: 1400, level: 4, pos: "verb", def: "to speak very softly" },
      { word: "shout", freq: 1500, year: 1350, level: 4, pos: "verb", def: "to say loudly" },
    ],
  },
  {
    star: {
      word: "write",
      freq: 7200,
      year: 900,
      level: 2,
      pos: "verb",
      def: "to mark words",
      theme: "communication",
      sub: "written",
    },
    planets: [
      { word: "compose", freq: 2200, year: 1450, level: 4, pos: "verb", def: "to create written work" },
      { word: "text", freq: 8500, year: 1369, level: 4, pos: "verb", def: "to send a message" },
      { word: "email", freq: 6200, year: 1982, level: 4, pos: "verb", def: "to send electronic mail" },
    ],
  },

  // Education Theme
  {
    star: {
      word: "educate",
      freq: 3500,
      year: 1450,
      level: 1,
      pos: "verb",
      def: "to give intellectual instruction",
      theme: "education",
    },
    planets: [
      // NOTE: learn removed - it's a star itself
      { word: "teach", freq: 7500, year: 1050, level: 3, pos: "verb", def: "to impart knowledge" },
      { word: "study", freq: 6800, year: 1300, level: 3, pos: "verb", def: "to devote time to learning" },
    ],
  },
  {
    star: {
      word: "learn",
      freq: 9200,
      year: 825,
      level: 2,
      pos: "verb",
      def: "to gain knowledge or skill",
      theme: "education",
    },
    planets: [
      { word: "memorize", freq: 1800, year: 1591, level: 4, pos: "verb", def: "to commit to memory" },
      { word: "practice", freq: 5200, year: 1400, level: 4, pos: "verb", def: "repeated exercise" },
      { word: "understand", freq: 6500, year: 1300, level: 4, pos: "verb", def: "to comprehend" },
    ],
  },
  {
    star: {
      word: "school",
      freq: 8900,
      year: 1050,
      level: 2,
      pos: "noun",
      def: "institution for education",
      theme: "education",
      sub: "institution",
    },
    planets: [
      { word: "university", freq: 5500, year: 1300, level: 4, pos: "noun", def: "higher education institution" },
      { word: "classroom", freq: 2800, year: 1870, level: 4, pos: "noun", def: "room for teaching" },
      { word: "college", freq: 6200, year: 1380, level: 4, pos: "noun", def: "educational institution" },
    ],
  },

  // Technology Theme
  {
    star: {
      word: "technology",
      freq: 6500,
      year: 1615,
      level: 1,
      pos: "noun",
      def: "application of science",
      theme: "technology",
    },
    planets: [
      { word: "computer", freq: 8200, year: 1640, level: 3, pos: "noun", def: "electronic device" },
      // NOTE: software removed - it's a star itself
      { word: "internet", freq: 7200, year: 1974, level: 3, pos: "noun", def: "global network" },
    ],
  },
  {
    star: {
      word: "code",
      freq: 4200,
      year: 1980,
      level: 2,
      pos: "verb",
      def: "computer instructions",
      theme: "technology",
      sub: "software",
    },
    planets: [
      { word: "program", freq: 6500, year: 1945, level: 4, pos: "verb", def: "to write code" },
      { word: "debug", freq: 1200, year: 1947, level: 4, pos: "verb", def: "to fix errors" },
      { word: "compile", freq: 1500, year: 1960, level: 4, pos: "verb", def: "to translate code" },
    ],
  },
  {
    star: {
      word: "software",
      freq: 5800,
      year: 1958,
      level: 2,
      pos: "noun",
      def: "programs and systems",
      theme: "technology",
      sub: "software",
    },
    planets: [
      { word: "algorithm", freq: 2800, year: 1950, level: 4, pos: "noun", def: "step-by-step procedure" },
      { word: "database", freq: 3500, year: 1962, level: 4, pos: "noun", def: "organized data" },
      { word: "application", freq: 5200, year: 1985, level: 4, pos: "noun", def: "software program" },
    ],
  },

  // Science Theme
  {
    star: {
      word: "science",
      freq: 8500,
      year: 1340,
      level: 1,
      pos: "noun",
      def: "systematic knowledge",
      theme: "science",
    },
    planets: [
      // NOTE: research removed - it's a star itself
      { word: "experiment", freq: 4200, year: 1362, level: 3, pos: "verb", def: "scientific test" },
      { word: "theory", freq: 5500, year: 1592, level: 3, pos: "noun", def: "system of ideas" },
    ],
  },
  {
    star: {
      word: "research",
      freq: 6800,
      year: 1577,
      level: 2,
      pos: "verb",
      def: "systematic investigation",
      theme: "science",
    },
    planets: [
      { word: "analyze", freq: 4800, year: 1598, level: 4, pos: "verb", def: "to examine in detail" },
      { word: "observe", freq: 4500, year: 1374, level: 4, pos: "verb", def: "to watch carefully" },
      { word: "measure", freq: 5200, year: 1300, level: 4, pos: "verb", def: "to determine size" },
    ],
  },

  // Emotion Theme
  {
    star: {
      word: "emotion",
      freq: 4500,
      year: 1579,
      level: 1,
      pos: "noun",
      def: "feeling or sentiment",
      theme: "emotion",
    },
    planets: [
      { word: "love", freq: 10500, year: 900, level: 3, pos: "verb", def: "deep affection" },
      { word: "fear", freq: 5500, year: 900, level: 3, pos: "noun", def: "anxiety from danger" },
      { word: "joy", freq: 4200, year: 1200, level: 3, pos: "noun", def: "great pleasure" },
    ],
  },
  {
    star: {
      word: "feel",
      freq: 9500,
      year: 900,
      level: 2,
      pos: "verb",
      def: "to experience emotion",
      theme: "emotion",
    },
    planets: [
      { word: "happy", freq: 6800, year: 1380, level: 4, pos: "adj", def: "feeling pleasure" },
      { word: "sad", freq: 5200, year: 900, level: 4, pos: "adj", def: "feeling sorrow" },
      { word: "angry", freq: 3800, year: 1250, level: 4, pos: "adj", def: "feeling rage" },
    ],
  },

  // Action Theme
  {
    star: {
      word: "action",
      freq: 7500,
      year: 1300,
      level: 1,
      pos: "noun",
      def: "process of doing",
      theme: "action",
    },
    planets: [
      // NOTE: move removed - it's a star itself
      { word: "work", freq: 11000, year: 900, level: 3, pos: "verb", def: "to perform labor" },
      { word: "create", freq: 6500, year: 1430, level: 3, pos: "verb", def: "to bring into existence" },
    ],
  },
  {
    star: {
      word: "move",
      freq: 9200,
      year: 1300,
      level: 2,
      pos: "verb",
      def: "to change position",
      theme: "action",
    },
    planets: [
      { word: "run", freq: 9800, year: 900, level: 4, pos: "verb", def: "to move quickly" },
      { word: "walk", freq: 8500, year: 1200, level: 4, pos: "verb", def: "to move on foot" },
      { word: "jump", freq: 4200, year: 1530, level: 4, pos: "verb", def: "to leap" },
    ],
  },
]

export function generateCleanMockDataV4(): UniverseDataV4 {
  const words: VocabWord[] = []

  STAR_SYSTEMS.forEach((system) => {
    const { star, planets } = system

    // Add star
    const starWord: VocabWord = {
      id: `word_${star.word}`,
      word: star.word,
      frequency: star.freq,
      firstRecordedYear: star.year,
      hierarchyLevel: star.level,
      pos: star.pos,
      definition: star.def,
      relations: [], // Will be filled below
      themeId: `theme_${star.theme}`,
      subThemeId: star.sub ? `sub_${star.sub}` : undefined,
    }
    words.push(starWord)

    // Add planets with hypernym pointing to star
    planets.forEach((planet) => {
      const planetWord: VocabWord = {
        id: `word_${planet.word}`,
        word: planet.word,
        frequency: planet.freq,
        firstRecordedYear: planet.year,
        hierarchyLevel: planet.level,
        pos: planet.pos,
        definition: planet.def,
        relations: [
          {
            targetId: `word_${star.word}`, // Points to parent star
            type: "hypernym",
            strength: 1.0,
          },
        ],
        themeId: `theme_${star.theme}`,
        subThemeId: planet.sub ? `sub_${planet.sub}` : star.sub ? `sub_${star.sub}` : undefined,
      }
      words.push(planetWord)

      // Add star's hyponym relation back
      starWord.relations.push({
        targetId: `word_${planet.word}`,
        type: "hyponym",
        strength: 1.0,
      })
    })
  })

  console.log(`Generated ${words.length} words in ${STAR_SYSTEMS.length} star systems`)

  return {
    version: "v4.0-static",
    meta: {
      generatedAt: Date.now(),
      wordCount: words.length,
    },
    words,
  }
}

export const CLEAN_MOCK_DATA = generateCleanMockDataV4()
