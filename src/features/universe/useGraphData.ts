import { useMemo } from "react"
import type { UniverseGraphData, UniverseNode, UniverseLink, LinkSourceTarget } from "@/types/universe"
import { linkId, buildNodeMap, buildAdjacencyMap } from "./linkHelpers"

export function useGraphData(
  masterData: UniverseGraphData,
  selectedId: string | null,
  activeFilters: Set<string>,
) {
  const nodeMap = useMemo(
    () => buildNodeMap(masterData.nodes),
    [masterData.nodes],
  )

  const adjacencyMap = useMemo(
    () => buildAdjacencyMap(nodeMap, masterData.links),
    [nodeMap, masterData.links],
  )

  const graphData = useMemo(() => {
    if (masterData.nodes.length === 0) return { nodes: [] as UniverseNode[], links: [] as UniverseLink[] }

    const finalNodeIds = new Set<string>()
    const finalLinks: UniverseLink[] = []

    if (!selectedId) {
      // Explore mode: apply level + link type filters
      for (const n of masterData.nodes) {
        if (activeFilters.has(`l${n.level}`)) finalNodeIds.add(n.id)
      }
      for (const l of masterData.links) {
        if (!activeFilters.has(l.type)) continue
        const s = linkId(l.source as LinkSourceTarget)
        const t = linkId(l.target as LinkSourceTarget)
        if (finalNodeIds.has(s) && finalNodeIds.has(t)) finalLinks.push(l)
      }
    } else {
      // Focus mode: selected node + 1-hop neighbors
      finalNodeIds.add(selectedId)
      const adj = adjacencyMap.get(selectedId)
      if (adj) {
        for (const link of adj) {
          const s = linkId(link.source as LinkSourceTarget)
          const t = linkId(link.target as LinkSourceTarget)
          finalNodeIds.add(s === selectedId ? t : s)
          finalLinks.push(link)
        }
      }
    }

    return {
      nodes: masterData.nodes.filter(n => finalNodeIds.has(n.id)),
      links: finalLinks,
    }
  }, [masterData, selectedId, activeFilters, adjacencyMap])

  const distanceMap = useMemo(() => {
    if (!selectedId) return null
    const distances = new Map<string, number>()
    distances.set(selectedId, 0)
    for (const l of graphData.links) {
      const s = linkId(l.source as LinkSourceTarget)
      const t = linkId(l.target as LinkSourceTarget)
      if (s === selectedId) distances.set(t, 1)
      else if (t === selectedId) distances.set(s, 1)
    }
    return distances
  }, [graphData.links, selectedId])

  return { nodeMap, adjacencyMap, graphData, distanceMap }
}
