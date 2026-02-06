import { useMemo } from "react"
import type { UniverseGraphData, UniverseNode, UniverseLink, LinkSourceTarget } from "@/types/universe"
import { linkId, buildNodeMap, buildAdjacencyMap } from "./linkHelpers"

export function useGraphData(
  masterData: UniverseGraphData,
  selectedId: string | null,
  activeFilters: Set<string>,
  expandedIds?: Set<string>,
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

    if (!selectedId && (!expandedIds || expandedIds.size === 0)) {
      // Explore mode: level filter + link type filter with orphan pruning
      // Step 1: nodes whose level filter is active OR level 0 (themes)
      const levelPassIds = new Set<string>()
      for (const n of masterData.nodes) {
        if (n.level === 0 || activeFilters.has(`l${n.level}`)) levelPassIds.add(n.id)
      }

      // Step 2: links whose type filter is active & both endpoints pass level filter
      const visibleLinks: UniverseLink[] = []
      const connectedIds = new Set<string>()
      for (const l of masterData.links) {
        if (!activeFilters.has(l.type)) continue
        const s = linkId(l.source as LinkSourceTarget)
        const t = linkId(l.target as LinkSourceTarget)
        if (levelPassIds.has(s) && levelPassIds.has(t)) {
          visibleLinks.push(l)
          connectedIds.add(s)
          connectedIds.add(t)
        }
      }

      // Step 3: keep nodes that have links OR are Level 0
      return {
        nodes: masterData.nodes.filter(n => n.level === 0 || connectedIds.has(n.id)),
        links: visibleLinks,
      }
    }

    // Focus mode: Support multiple expanded nodes (Phase 3)
    const targets = expandedIds && expandedIds.size > 0 ? expandedIds : new Set([selectedId!])
    const finalNodeIds = new Set<string>()
    const finalLinks: UniverseLink[] = []

    for (const id of targets) {
      finalNodeIds.add(id)
      const adj = adjacencyMap.get(id)
      if (adj) {
        for (const link of adj) {
          const s = linkId(link.source as LinkSourceTarget)
          const t = linkId(link.target as LinkSourceTarget)
          finalNodeIds.add(s === id ? t : s)
          finalLinks.push(link)
        }
      }
    }

    return {
      nodes: masterData.nodes.filter(n => finalNodeIds.has(n.id)),
      links: Array.from(new Set(finalLinks)), // Deduplicate links
    }
  }, [masterData, selectedId, activeFilters, adjacencyMap, expandedIds])

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
