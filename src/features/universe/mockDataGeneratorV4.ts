/**
 * Large-scale Mock Data Generator for V4
 * Generates realistic vocabulary datasets of various sizes
 */

import type { UniverseDataV4, VocabWord, VocabRelation } from "@/types/universe-v4"

// Word templates with realistic attributes
interface WordTemplate {
  word: string
  baseFreq: number
  year: number
  level: number
  pos: string
  def: string
  theme: string
  sub?: string
  related?: string[] // Words this one relates to
}

// Comprehensive word database
const WORD_DATABASE: WordTemplate[] = [
  // === ABSTRACT CONCEPTS (Level 0-1) ===
  { word: "entity", baseFreq: 3200, year: 1596, level: 0, pos: "noun", def: "something that exists as a discrete unit", theme: "abstract" },
  { word: "concept", baseFreq: 4500, year: 1550, level: 0, pos: "noun", def: "an abstract idea or general notion", theme: "abstract" },
  { word: "thing", baseFreq: 15000, year: 900, level: 0, pos: "noun", def: "an object or entity", theme: "abstract" },
  { word: "idea", baseFreq: 8200, year: 1400, level: 0, pos: "noun", def: "a thought or suggestion", theme: "abstract" },
  { word: "notion", baseFreq: 2800, year: 1530, level: 1, pos: "noun", def: "a conception or belief", theme: "abstract" },

  // === COMMUNICATION (Level 1-7) ===
  { word: "communicate", baseFreq: 5800, year: 1530, level: 1, pos: "verb", def: "to share or exchange information", theme: "communication", related: ["speak", "write", "signal"] },
  { word: "express", baseFreq: 6200, year: 1400, level: 1, pos: "verb", def: "to convey thoughts or feelings", theme: "communication", related: ["communicate", "speak"] },

  { word: "speak", baseFreq: 8520, year: 1200, level: 2, pos: "verb", def: "to say words orally", theme: "communication", sub: "verbal", related: ["talk", "say", "tell"] },
  { word: "write", baseFreq: 7200, year: 900, level: 2, pos: "verb", def: "to mark coherent words", theme: "communication", sub: "written", related: ["compose", "text", "inscribe"] },
  { word: "listen", baseFreq: 6800, year: 1200, level: 2, pos: "verb", def: "to give attention with the ear", theme: "communication", sub: "verbal", related: ["hear", "attend"] },
  { word: "read", baseFreq: 9500, year: 900, level: 2, pos: "verb", def: "to look at and comprehend written words", theme: "communication", sub: "written", related: ["study", "scan"] },

  { word: "talk", baseFreq: 9800, year: 1250, level: 3, pos: "verb", def: "informal spoken communication", theme: "communication", sub: "verbal", related: ["speak", "converse", "chat"] },
  { word: "say", baseFreq: 12000, year: 900, level: 3, pos: "verb", def: "to express in words", theme: "communication", sub: "verbal", related: ["speak", "utter", "state"] },
  { word: "tell", baseFreq: 10500, year: 1000, level: 3, pos: "verb", def: "to communicate information", theme: "communication", sub: "verbal", related: ["say", "inform", "narrate"] },
  { word: "compose", baseFreq: 2200, year: 1450, level: 3, pos: "verb", def: "to create written or musical work", theme: "communication", sub: "written", related: ["write", "author", "draft"] },
  { word: "text", baseFreq: 8500, year: 1369, level: 3, pos: "noun/verb", def: "written words; to send a message", theme: "communication", sub: "written", related: ["message", "write"] },

  { word: "whisper", baseFreq: 1200, year: 1400, level: 4, pos: "verb", def: "to speak very softly", theme: "communication", sub: "verbal", related: ["murmur", "talk"] },
  { word: "shout", baseFreq: 1500, year: 1350, level: 4, pos: "verb", def: "to say something very loudly", theme: "communication", sub: "verbal", related: ["yell", "scream", "talk"] },
  { word: "chat", baseFreq: 3200, year: 1530, level: 4, pos: "verb", def: "to talk in a friendly way", theme: "communication", sub: "verbal", related: ["talk", "converse"] },
  { word: "email", baseFreq: 6200, year: 1982, level: 4, pos: "noun/verb", def: "electronic mail message", theme: "communication", sub: "written", related: ["message", "text"] },
  { word: "message", baseFreq: 5800, year: 1300, level: 4, pos: "noun", def: "a communication sent", theme: "communication", sub: "written", related: ["text", "note"] },

  { word: "murmur", baseFreq: 800, year: 1380, level: 5, pos: "verb", def: "to say something in a low voice", theme: "communication", sub: "verbal", related: ["whisper", "mutter"] },
  { word: "yell", baseFreq: 1800, year: 1300, level: 5, pos: "verb", def: "to shout loudly", theme: "communication", sub: "verbal", related: ["shout", "scream"] },
  { word: "scream", baseFreq: 1500, year: 1200, level: 5, pos: "verb", def: "to cry out loudly", theme: "communication", sub: "verbal", related: ["yell", "shriek"] },

  { word: "scribble", baseFreq: 600, year: 1450, level: 6, pos: "verb", def: "to write carelessly", theme: "communication", sub: "written", related: ["write", "scratch"] },
  { word: "gossip", baseFreq: 1200, year: 1400, level: 6, pos: "verb/noun", def: "to chat about others", theme: "communication", sub: "verbal", related: ["chat", "rumor"] },

  // === EDUCATION (Level 1-7) ===
  { word: "educate", baseFreq: 3500, year: 1450, level: 1, pos: "verb", def: "to give intellectual instruction", theme: "education", related: ["teach", "train", "instruct"] },
  { word: "knowledge", baseFreq: 7800, year: 1300, level: 1, pos: "noun", def: "facts and information", theme: "education", related: ["learning", "wisdom"] },

  { word: "learn", baseFreq: 9200, year: 825, level: 2, pos: "verb", def: "to gain knowledge or skill", theme: "education", related: ["study", "acquire", "master"] },
  { word: "teach", baseFreq: 7500, year: 1050, level: 2, pos: "verb", def: "to impart knowledge", theme: "education", related: ["instruct", "educate", "train"] },
  { word: "study", baseFreq: 6800, year: 1300, level: 2, pos: "verb", def: "to devote time to learning", theme: "education", related: ["learn", "research", "examine"] },
  { word: "school", baseFreq: 8900, year: 1050, level: 2, pos: "noun", def: "institution for education", theme: "education", sub: "institution", related: ["college", "university"] },

  { word: "practice", baseFreq: 5200, year: 1400, level: 3, pos: "noun/verb", def: "repeated exercise to improve", theme: "education", related: ["rehearse", "drill", "exercise"] },
  { word: "memorize", baseFreq: 1800, year: 1591, level: 3, pos: "verb", def: "to commit to memory", theme: "education", related: ["remember", "learn"] },
  { word: "university", baseFreq: 5500, year: 1300, level: 3, pos: "noun", def: "higher education institution", theme: "education", sub: "institution", related: ["college", "school"] },
  { word: "college", baseFreq: 6200, year: 1380, level: 3, pos: "noun", def: "educational institution", theme: "education", sub: "institution", related: ["university", "school"] },

  { word: "classroom", baseFreq: 2800, year: 1870, level: 4, pos: "noun", def: "room for teaching", theme: "education", sub: "institution", related: ["school", "lecture"] },
  { word: "homework", baseFreq: 2200, year: 1680, level: 4, pos: "noun", def: "schoolwork done at home", theme: "education", related: ["assignment", "study"] },
  { word: "exam", baseFreq: 3500, year: 1850, level: 4, pos: "noun", def: "formal test", theme: "education", related: ["test", "quiz", "assessment"] },
  { word: "lecture", baseFreq: 2500, year: 1450, level: 4, pos: "noun", def: "educational talk", theme: "education", related: ["teach", "lesson"] },

  { word: "quiz", baseFreq: 1500, year: 1780, level: 5, pos: "noun", def: "short test", theme: "education", related: ["exam", "test"] },
  { word: "cram", baseFreq: 900, year: 1810, level: 5, pos: "verb", def: "to study intensively", theme: "education", related: ["study", "memorize"] },
  { word: "tutor", baseFreq: 1800, year: 1400, level: 5, pos: "noun/verb", def: "private teacher", theme: "education", related: ["teach", "instruct"] },

  // === TECHNOLOGY (Level 1-7) ===
  { word: "technology", baseFreq: 6500, year: 1615, level: 1, pos: "noun", def: "application of scientific knowledge", theme: "technology", related: ["science", "innovation"] },
  { word: "compute", baseFreq: 2800, year: 1630, level: 1, pos: "verb", def: "to calculate or reckon", theme: "technology", related: ["calculate", "process"] },

  { word: "code", baseFreq: 4200, year: 1980, level: 2, pos: "noun/verb", def: "computer instructions", theme: "technology", sub: "software", related: ["program", "software"] },
  { word: "data", baseFreq: 7500, year: 1640, level: 2, pos: "noun", def: "facts and statistics", theme: "technology", related: ["information", "records"] },
  { word: "computer", baseFreq: 8200, year: 1640, level: 2, pos: "noun", def: "electronic device for processing data", theme: "technology", related: ["machine", "device"] },

  { word: "program", baseFreq: 6500, year: 1945, level: 3, pos: "noun/verb", def: "set of computer instructions", theme: "technology", sub: "software", related: ["code", "software", "application"] },
  { word: "software", baseFreq: 5800, year: 1958, level: 3, pos: "noun", def: "programs and operating systems", theme: "technology", sub: "software", related: ["program", "application"] },
  { word: "algorithm", baseFreq: 2800, year: 1950, level: 3, pos: "noun", def: "step-by-step procedure", theme: "technology", sub: "software", related: ["code", "method"] },
  { word: "internet", baseFreq: 7200, year: 1974, level: 3, pos: "noun", def: "global computer network", theme: "technology", sub: "network", related: ["web", "network"] },

  { word: "debug", baseFreq: 1200, year: 1947, level: 4, pos: "verb", def: "to find and fix errors", theme: "technology", sub: "software", related: ["code", "fix"] },
  { word: "compile", baseFreq: 1500, year: 1960, level: 4, pos: "verb", def: "to translate source code", theme: "technology", sub: "software", related: ["code", "build"] },
  { word: "database", baseFreq: 3500, year: 1962, level: 4, pos: "noun", def: "organized data collection", theme: "technology", related: ["data", "storage"] },
  { word: "website", baseFreq: 6800, year: 1994, level: 4, pos: "noun", def: "collection of web pages", theme: "technology", sub: "network", related: ["internet", "web"] },

  { word: "refactor", baseFreq: 800, year: 1990, level: 5, pos: "verb", def: "to restructure code", theme: "technology", sub: "software", related: ["code", "improve"] },
  { word: "deploy", baseFreq: 2200, year: 1785, level: 5, pos: "verb", def: "to put into operation", theme: "technology", sub: "software", related: ["release", "launch"] },
  { word: "cache", baseFreq: 1500, year: 1967, level: 5, pos: "noun", def: "temporary data storage", theme: "technology", related: ["memory", "storage"] },

  // === SCIENCE (Level 1-5) ===
  { word: "science", baseFreq: 8500, year: 1340, level: 1, pos: "noun", def: "systematic knowledge", theme: "science", related: ["knowledge", "research"] },
  { word: "research", baseFreq: 6800, year: 1577, level: 2, pos: "noun/verb", def: "systematic investigation", theme: "science", related: ["study", "investigate"] },
  { word: "experiment", baseFreq: 4200, year: 1362, level: 2, pos: "noun/verb", def: "scientific test", theme: "science", related: ["test", "trial"] },
  { word: "theory", baseFreq: 5500, year: 1592, level: 2, pos: "noun", def: "system of ideas", theme: "science", related: ["hypothesis", "concept"] },
  { word: "hypothesis", baseFreq: 2200, year: 1596, level: 3, pos: "noun", def: "proposed explanation", theme: "science", related: ["theory", "idea"] },
  { word: "analyze", baseFreq: 4800, year: 1598, level: 3, pos: "verb", def: "to examine in detail", theme: "science", related: ["study", "examine"] },
  { word: "observe", baseFreq: 4500, year: 1374, level: 3, pos: "verb", def: "to watch carefully", theme: "science", related: ["watch", "notice"] },
  { word: "measure", baseFreq: 5200, year: 1300, level: 3, pos: "verb", def: "to determine size or quantity", theme: "science", related: ["calculate", "assess"] },

  // === EMOTION (Level 2-6) ===
  { word: "emotion", baseFreq: 4500, year: 1579, level: 1, pos: "noun", def: "feeling or sentiment", theme: "emotion", related: ["feeling", "sentiment"] },
  { word: "feel", baseFreq: 9500, year: 900, level: 2, pos: "verb", def: "to experience emotion", theme: "emotion", related: ["sense", "perceive"] },
  { word: "love", baseFreq: 10500, year: 900, level: 2, pos: "noun/verb", def: "deep affection", theme: "emotion", related: ["adore", "cherish"] },
  { word: "hate", baseFreq: 4200, year: 900, level: 2, pos: "verb", def: "intense dislike", theme: "emotion", related: ["detest", "loathe"] },
  { word: "happy", baseFreq: 6800, year: 1380, level: 3, pos: "adj", def: "feeling pleasure", theme: "emotion", related: ["joyful", "glad"] },
  { word: "sad", baseFreq: 5200, year: 900, level: 3, pos: "adj", def: "feeling sorrow", theme: "emotion", related: ["unhappy", "sorrowful"] },
  { word: "angry", baseFreq: 3800, year: 1250, level: 3, pos: "adj", def: "feeling rage", theme: "emotion", related: ["mad", "furious"] },
  { word: "fear", baseFreq: 5500, year: 900, level: 3, pos: "noun/verb", def: "anxiety caused by danger", theme: "emotion", related: ["dread", "terror"] },
  { word: "joy", baseFreq: 4200, year: 1200, level: 3, pos: "noun", def: "great pleasure", theme: "emotion", related: ["happiness", "delight"] },
  { word: "excited", baseFreq: 3200, year: 1374, level: 4, pos: "adj", def: "enthusiastic", theme: "emotion", related: ["thrilled", "eager"] },
  { word: "nervous", baseFreq: 2800, year: 1400, level: 4, pos: "adj", def: "anxious or worried", theme: "emotion", related: ["anxious", "tense"] },

  // === ACTION (Level 2-5) ===
  { word: "action", baseFreq: 7500, year: 1300, level: 1, pos: "noun", def: "process of doing", theme: "action", related: ["act", "deed"] },
  { word: "move", baseFreq: 9200, year: 1300, level: 2, pos: "verb", def: "to change position", theme: "action", related: ["go", "travel"] },
  { word: "work", baseFreq: 11000, year: 900, level: 2, pos: "verb/noun", def: "to perform labor", theme: "action", related: ["labor", "toil"] },
  { word: "create", baseFreq: 6500, year: 1430, level: 2, pos: "verb", def: "to bring into existence", theme: "action", related: ["make", "produce"] },
  { word: "build", baseFreq: 6800, year: 900, level: 2, pos: "verb", def: "to construct", theme: "action", related: ["construct", "erect"] },
  { word: "run", baseFreq: 9800, year: 900, level: 3, pos: "verb", def: "to move quickly", theme: "action", related: ["sprint", "jog"] },
  { word: "walk", baseFreq: 8500, year: 1200, level: 3, pos: "verb", def: "to move on foot", theme: "action", related: ["stroll", "stride"] },
  { word: "jump", baseFreq: 4200, year: 1530, level: 3, pos: "verb", def: "to leap", theme: "action", related: ["leap", "hop"] },
  { word: "dance", baseFreq: 3800, year: 1300, level: 3, pos: "verb", def: "to move rhythmically", theme: "action", related: ["boogie", "sway"] },
  { word: "sprint", baseFreq: 1200, year: 1560, level: 4, pos: "verb", def: "to run very fast", theme: "action", related: ["run", "dash"] },
  { word: "stroll", baseFreq: 1500, year: 1600, level: 4, pos: "verb", def: "to walk leisurely", theme: "action", related: ["walk", "amble"] },
]

/**
 * Generate variations and expand vocabulary
 */
function expandVocabulary(base: WordTemplate[], targetCount: number): WordTemplate[] {
  const result = [...base]

  // Generate related words variations
  const variations: WordTemplate[] = []

  // Add -ing, -ed, -er, -ly variations for verbs/adjectives
  base.forEach(word => {
    if (word.pos.includes("verb") && result.length + variations.length < targetCount) {
      // Add gerund form
      variations.push({
        ...word,
        word: word.word + "ing",
        level: word.level + 1,
        baseFreq: Math.floor(word.baseFreq * 0.6),
        def: `act of ${word.def}`,
      })
    }

    if (word.pos.includes("adj") && result.length + variations.length < targetCount) {
      // Add adverb form
      variations.push({
        ...word,
        word: word.word + "ly",
        level: word.level + 1,
        baseFreq: Math.floor(word.baseFreq * 0.4),
        pos: "adv",
        def: `in a ${word.word} manner`,
      })
    }
  })

  result.push(...variations)

  return result.slice(0, targetCount)
}

/**
 * Build relation network
 */
function buildRelations(words: WordTemplate[]): Map<string, VocabRelation[]> {
  const relationMap = new Map<string, VocabRelation[]>()

  words.forEach(word => {
    const relations: VocabRelation[] = []

    // Add explicit relations from template
    if (word.related) {
      word.related.forEach(relatedWord => {
        const target = words.find(w => w.word === relatedWord)
        if (target) {
          relations.push({
            targetId: `word_${relatedWord}`,
            type: "related",
            strength: 0.6,
          })
        }
      })
    }

    // Add hierarchy relations (hypernym/hyponym)
    words.forEach(other => {
      if (other.word === word.word) return

      // Same theme, adjacent levels
      if (other.theme === word.theme) {
        if (other.level === word.level - 1) {
          relations.push({
            targetId: `word_${other.word}`,
            type: "hypernym",
            strength: 0.8,
          })
        }
        if (other.level === word.level + 1 && relations.length < 5) {
          relations.push({
            targetId: `word_${other.word}`,
            type: "hyponym",
            strength: 0.7,
          })
        }
      }
    })

    relationMap.set(word.word, relations)
  })

  return relationMap
}

/**
 * Generate dataset of specified size
 */
export function generateMockDataV4(size: 50 | 100 | 500 | 1000): UniverseDataV4 {
  console.log(`Generating ${size} vocab nodes...`)

  const wordTemplates = expandVocabulary(WORD_DATABASE, size)
  const relationMap = buildRelations(wordTemplates)

  const words: VocabWord[] = wordTemplates.map(template => ({
    id: `word_${template.word}`,
    word: template.word,
    frequency: Math.floor(template.baseFreq * (0.8 + Math.random() * 0.4)), // Add variance
    firstRecordedYear: template.year,
    hierarchyLevel: template.level,
    pos: template.pos,
    definition: template.def,
    relations: relationMap.get(template.word) || [],
    themeId: `theme_${template.theme}`,
    subThemeId: template.sub ? `sub_${template.sub}` : undefined,
  }))

  console.log(`Generated ${words.length} words with ${words.reduce((sum, w) => sum + w.relations.length, 0)} relations`)

  return {
    version: "v4.0-static",
    meta: {
      generatedAt: Date.now(),
      wordCount: words.length,
    },
    words,
  }
}

// Export pre-generated datasets
export const MOCK_DATA_50 = generateMockDataV4(50)
export const MOCK_DATA_100 = generateMockDataV4(100)
export const MOCK_DATA_500 = generateMockDataV4(500)
export const MOCK_DATA_1000 = generateMockDataV4(1000)
