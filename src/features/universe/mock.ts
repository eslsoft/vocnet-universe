export type UniverseNode = {
  id: string
  label: string
  level: number
  val: number
  x?: number
  y?: number
  z?: number
  color?: string
  grouping: {
    semantic: string
    category: string
    pos: string
  }
}

export type UniverseLink = {
  source: string
  target: string
  type: "hierarchy" | "semantic"
}

export type UniverseGraph = {
  nodes: UniverseNode[]
  links: UniverseLink[]
}

const CATEGORIES = [
  "Location",
  "People",
  "Time",
  "Action",
  "Emotion",
  "Nature",
  "Abstract",
]

export const levelColor = (level: number) => {
  switch (level) {
    case 0:
      return "#f8fafc"
    case 1:
      return "#a855f7"
    case 2:
      return "#38bdf8"
    case 3:
      return "#f59e0b"
    default:
      return "#22c55e"
  }
}

const randomPick = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)]

export const buildMockUniverse = (): UniverseGraph => {
  const nodes: UniverseNode[] = []
  const links: UniverseLink[] = []

  const rootCount = 2
  const galaxyCount = 8
  const nebulaPerGalaxy = 4
  const starsPerNebula = 16
  const planetsPerStar = 4

  for (let i = 0; i < rootCount; i += 1) {
    nodes.push({
      id: `root_${i}`,
      label: `Root ${i + 1}`,
      level: 0,
      val: 12,
      x: (i - 0.5) * 80,
      y: 0,
      z: 0,
      grouping: {
        semantic: "Root",
        category: "Abstract",
        pos: "Noun",
      },
      color: levelColor(0),
    })
  }

  let galaxyIndex = 0
  let nebulaIndex = 0
  let starIndex = 0
  let planetIndex = 0

  for (let g = 0; g < galaxyCount; g += 1) {
    const galaxyId = `galaxy_${galaxyIndex++}`
    const category = randomPick(CATEGORIES)
    nodes.push({
      id: galaxyId,
      label: `Galaxy ${g + 1}`,
      level: 1,
      val: 10,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 240,
      grouping: {
        semantic: "Galaxy",
        category,
        pos: "Noun",
      },
      color: levelColor(1),
    })
    links.push({
      source: `root_${g % rootCount}`,
      target: galaxyId,
      type: "hierarchy",
    })

    for (let n = 0; n < nebulaPerGalaxy; n += 1) {
      const nebulaId = `nebula_${nebulaIndex++}`
      nodes.push({
        id: nebulaId,
        label: `Nebula ${n + 1}`,
        level: 2,
        val: 8,
        x: (Math.random() - 0.5) * 280,
        y: (Math.random() - 0.5) * 280,
        z: (Math.random() - 0.5) * 180,
        grouping: {
          semantic: "Cluster",
          category,
          pos: "Noun",
        },
        color: levelColor(2),
      })
      links.push({ source: galaxyId, target: nebulaId, type: "hierarchy" })

      for (let s = 0; s < starsPerNebula; s += 1) {
        const starId = `star_${starIndex++}`
        nodes.push({
          id: starId,
          label: `Star ${starIndex}`,
          level: 3,
          val: 6,
          x: (Math.random() - 0.5) * 180,
          y: (Math.random() - 0.5) * 180,
          z: (Math.random() - 0.5) * 120,
          grouping: {
            semantic: "Word",
            category,
            pos: "Noun",
          },
          color: levelColor(3),
        })
        links.push({ source: nebulaId, target: starId, type: "hierarchy" })

        for (let p = 0; p < planetsPerStar; p += 1) {
          const planetId = `planet_${planetIndex++}`
          nodes.push({
            id: planetId,
            label: `Planet ${planetIndex}`,
            level: 4,
            val: 3,
            x: (Math.random() - 0.5) * 80,
            y: (Math.random() - 0.5) * 80,
            z: (Math.random() - 0.5) * 60,
            grouping: {
              semantic: "Word",
              category,
              pos: "Noun",
            },
            color: levelColor(4),
          })
          links.push({ source: starId, target: planetId, type: "hierarchy" })
        }
      }
    }
  }

  for (let i = 0; i < 60; i += 1) {
    const source = `star_${Math.floor(Math.random() * starIndex)}`
    const target = `star_${Math.floor(Math.random() * starIndex)}`
    if (source !== target) {
      links.push({ source, target, type: "semantic" })
    }
  }

  return { nodes, links }
}
