/* eslint-disable @typescript-eslint/no-explicit-any -- d3-force callbacks are untyped */
import { useEffect } from "react"
import * as d3 from "d3-force-3d"
import type { ForceGraphMethods } from "react-force-graph-3d"
import type { UniverseNode, UniverseLink, LinkSourceTarget } from "@/types/universe"
import { linkId } from "./linkHelpers"

export function useForceConfig(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  graphData: { nodes: UniverseNode[]; links: UniverseLink[] },
  selectedId: string | null,
  nodeMap: Map<string, UniverseNode>,
) {
  useEffect(() => {
    const fg = graphRef.current
    if (!fg || !graphData.nodes.length) return

    const timeoutId = setTimeout(() => {
      const sim = graphRef.current
      if (!sim) return

      // Full force reset
      sim.d3Force("link", null)
      sim.d3Force("charge", null)
      sim.d3Force("x", null)
      sim.d3Force("y", null)
      sim.d3Force("z", null)
      sim.d3Force("center", null)
      sim.d3Force("collide", null)

      if (selectedId) {
        // --- FOCUS MODE ---
        const selNode = nodeMap.get(selectedId)
        const isLarge = selNode && selNode.level <= 1

        sim.d3Force("x", d3.forceX(0).strength((n: any) => n.id === selectedId ? 2.5 : 0))
        sim.d3Force("y", d3.forceY(0).strength((n: any) => n.id === selectedId ? 2.5 : 0))
        sim.d3Force("z", d3.forceZ(0).strength((n: any) => n.id === selectedId ? 2.5 : 0))

        sim.d3Force("link", d3.forceLink(graphData.links).distance((l: any) => {
          const sNode = nodeMap.get(linkId(l.source as LinkSourceTarget))
          const tNode = nodeMap.get(linkId(l.target as LinkSourceTarget))
          const rS = Math.max(12, (sNode?.val || 10) * 1.5)
          const rT = Math.max(12, (tNode?.val || 10) * 1.5)
          const gap = isLarge ? 1500 : 80
          return gap + rS + rT
        }).strength(1))

        sim.d3Force("charge", d3.forceManyBody().strength(isLarge ? -10000 : -1000).distanceMax(3000))
        sim.d3Force("collide", d3.forceCollide().radius((n: any) => {
          const base = Math.max(12, (n.val || 10) * 1.5)
          const radius = (n.id === selectedId && n.level <= 1) ? base * 0.6 : base
          return radius * 1.5
        }))
      } else {
        // --- EXPLORE MODE ---
        sim.d3Force("link", d3.forceLink(graphData.links).distance((l: any) => {
          const sNode = nodeMap.get(linkId(l.source as LinkSourceTarget))
          const tNode = nodeMap.get(linkId(l.target as LinkSourceTarget))
          const rS = Math.max(12, (sNode?.val || 10) * 1.5)
          const rT = Math.max(12, (tNode?.val || 10) * 1.5)
          const maxL = Math.min(sNode?.level ?? 4, tNode?.level ?? 4)
          const base = maxL <= 1 ? 800 : maxL <= 2 ? 400 : 150
          return base + rS + rT
        }))
        sim.d3Force("charge", d3.forceManyBody()
          .strength((n: any) => n.level <= 1 ? -8000 : -1000)
          .distanceMax(4000))
        sim.d3Force("center", d3.forceCenter(0, 0, 0))
        sim.d3Force("collide", d3.forceCollide()
          .radius((n: any) => Math.max(12, (n.val || 10) * 1.5) * 2.0))
      }

      sim.d3ReheatSimulation()
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [graphData, selectedId, nodeMap, graphRef])
}
