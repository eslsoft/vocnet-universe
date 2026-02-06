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
  source: string | { id: string }
  target: string | { id: string }
  type: "hierarchy" | "semantic"
}

export type UniverseGraph = {
  nodes: UniverseNode[]
  links: UniverseLink[]
}

export const levelColor = (level: number) => {
  switch (level) {
    case 1:
      return "#a855f7" // Purple (Galaxy)
    case 2:
      return "#38bdf8" // Cyan (Nebula)
    case 3:
      return "#f59e0b" // Amber (Star)
    case 4:
      return "#22c55e" // Green (Planet)
    default:
      return "#64748b"
  }
}

// Updated mock to match backend v4.3 logic
export const buildMockUniverse = (): UniverseGraph => {
  const nodes: UniverseNode[] = []
  const links: UniverseLink[] = []

  const categories = ["human", "nature", "space", "time", "action"]
  
  categories.forEach((cat, idx) => {
    const gId = `g_${cat}`
    nodes.push({
      id: gId,
      label: cat.toUpperCase(),
      level: 1,
      val: 20,
      x: Math.cos(idx) * 500,
      y: Math.sin(idx) * 500,
      z: 0,
      grouping: { semantic: "Galaxy", category: cat, pos: "Noun" }
    })

    // Mock 2 nebulae per galaxy
    for (let n = 0; n < 2; n++) {
      const nId = `n_${cat}_${n}`
      nodes.push({
        id: nId,
        label: `Cluster ${n}`,
        level: 2,
        val: 12,
        x: Math.cos(idx) * 500 + (n - 0.5) * 200,
        y: Math.sin(idx) * 500 + (n - 0.5) * 200,
        z: 50,
        grouping: { semantic: "Nebula", category: cat, pos: "Noun" }
      })
      links.push({ source: gId, target: nId, type: "hierarchy" })

      // Mock 5 words per nebula
      for (let w = 0; w < 5; w++) {
        const wId = `w_${cat}_${n}_${w}`
        nodes.push({
          id: wId,
          label: `Word ${w}`,
          level: 3,
          val: 6,
          x: Math.cos(idx) * 500 + (n - 0.5) * 200 + (Math.random() - 0.5) * 50,
          y: Math.sin(idx) * 500 + (n - 0.5) * 200 + (Math.random() - 0.5) * 50,
          z: 50 + (Math.random() - 0.5) * 50,
          grouping: { semantic: "Word", category: cat, pos: "Noun" }
        })
        links.push({ source: nId, target: wId, type: "hierarchy" })
      }
    }
  })

  return { nodes, links }
}