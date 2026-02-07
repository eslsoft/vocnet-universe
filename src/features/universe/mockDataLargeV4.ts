/**
 * Large Mock Data (200+ nodes) for LOD testing
 */

import type { UniverseDataV4, VocabWord } from "@/types/universe-v4"

export function generateLargeMockData(): UniverseDataV4 {
  const words: VocabWord[] = []

  // Generate 30 star systems, each with 5-10 planets
  const themes = ["communication", "education", "technology", "science", "emotion", "action", "nature"]
  const suffixes = ["", "tion", "ing", "er", "ed", "ly", "ness", "ment", "ity", "ism"]

  let idCounter = 0

  themes.forEach((theme) => {
    // 3-5 stars per theme
    const starsCount = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < starsCount; i++) {
      const starWord = `${theme}_star_${i}`
      const starId = `word_${idCounter++}`
      const starFreq = 3000 + Math.floor(Math.random() * 5000)
      const starYear = 1200 + Math.floor(Math.random() * 500)

      const star: VocabWord = {
        id: starId,
        word: starWord,
        frequency: starFreq,
        firstRecordedYear: starYear,
        hierarchyLevel: i === 0 ? 1 : 2, // First star is giant, rest are main sequence
        pos: "verb",
        definition: `Core ${theme} concept`,
        relations: [],
        themeId: `theme_${theme}`,
      }
      words.push(star)

      // 6-12 planets per star
      const planetsCount = 6 + Math.floor(Math.random() * 7)

      for (let j = 0; j < planetsCount; j++) {
        const suffix = suffixes[j % suffixes.length]
        const planetWord = `${theme}_${i}_planet_${j}${suffix}`
        const planetId = `word_${idCounter++}`
        const planetFreq = 800 + Math.floor(Math.random() * 3000)
        const planetYear = 1400 + Math.floor(Math.random() * 600)

        const planet: VocabWord = {
          id: planetId,
          word: planetWord,
          frequency: planetFreq,
          firstRecordedYear: planetYear,
          hierarchyLevel: 4,
          pos: j % 2 === 0 ? "verb" : "noun",
          definition: `Specific ${theme} term`,
          relations: [
            {
              targetId: starId,
              type: "hypernym",
              strength: 1.0,
            },
          ],
          themeId: `theme_${theme}`,
        }
        words.push(planet)

        // Star knows about planet
        star.relations.push({
          targetId: planetId,
          type: "hyponym",
          strength: 1.0,
        })
      }
    }
  })

  console.log(`Generated ${words.length} words for LOD testing`)

  return {
    version: "v4.0-large",
    meta: {
      generatedAt: Date.now(),
      wordCount: words.length,
    },
    words,
  }
}

export const LARGE_MOCK_DATA = generateLargeMockData()
