/* eslint-disable @typescript-eslint/no-explicit-any -- d3-force callbacks are untyped */
import { useEffect } from "react"
import * as d3 from "d3-force-3d"
import type { ForceGraphMethods } from "react-force-graph-3d"
import type { UniverseNode, UniverseLink, LinkSourceTarget, UniverseGroup } from "@/types/universe"
import { linkId } from "./linkHelpers"

export function useForceConfig(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  graphData: { nodes: UniverseNode[]; links: UniverseLink[] },
  selectedId: string | null,
  nodeMap: Map<string, UniverseNode>,
  groups?: UniverseGroup[],
) {
  useEffect(() => {
    const fg = graphRef.current
    if (!fg || !graphData.nodes.length) return

    const timeoutId = setTimeout(() => {
      const sim = graphRef.current
      if (!sim) return

      // Pre-calculate group centers for fast lookup
      const groupMap = new Map<string, UniverseGroup>()
      if (groups) {
        groups.forEach(g => groupMap.set(g.id, g))
      }

      // Fix Theme Nodes (Level 0) positions
      graphData.nodes.forEach((n: any) => {
        if (n.level === 0) {
          const g = groupMap.get(n.id)
          if (g) {
            n.fx = g.center.x
            n.fy = g.center.y
            n.fz = g.center.z
          }
        } else {
          n.fx = undefined
          n.fy = undefined
          n.fz = undefined
        }
      })

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
        // Implement "Thematic Constellations": Pull nodes toward group centers
        if (groups && groups.length > 0) {
          sim.d3Force("x", d3.forceX((n: any) => {
            const g = n.groupId ? groupMap.get(n.groupId) : null
            return g ? g.center.x : 0
          }).strength((n: any) => n.level <= 1 ? 0.1 : 0.05))

          sim.d3Force("y", d3.forceY((n: any) => {
            const g = n.groupId ? groupMap.get(n.groupId) : null
            return g ? g.center.y : 0
          }).strength((n: any) => n.level <= 1 ? 0.1 : 0.05))

          sim.d3Force("z", d3.forceZ((n: any) => {
            const g = n.groupId ? groupMap.get(n.groupId) : null
            return g ? g.center.z : 0
          }).strength((n: any) => n.level <= 1 ? 0.1 : 0.05))
        }

        sim.d3Force("link", d3.forceLink(graphData.links).distance((l: any) => {
          const sNode = nodeMap.get(linkId(l.source as LinkSourceTarget))
          const tNode = nodeMap.get(linkId(l.target as LinkSourceTarget))
          const rS = Math.max(12, (sNode?.val || 10) * 1.5)
          const rT = Math.max(12, (tNode?.val || 10) * 1.5)
          const maxL = Math.min(sNode?.level ?? 4, tNode?.level ?? 4)
          
          // Shorter links for semantic connections to keep them tight
          const isSemantic = l.kind === "semantic"
          const base = isSemantic ? 50 : (maxL <= 1 ? 600 : maxL <= 2 ? 300 : 100)
          
          return base + rS + rT
        }))

        sim.d3Force("charge", d3.forceManyBody()
          .strength((n: any) => n.level <= 1 ? -6000 : -500)
          .distanceMax(3000))
        
        sim.d3Force("center", d3.forceCenter(0, 0, 0))
        sim.d3Force("collide", d3.forceCollide()
          .radius((n: any) => Math.max(12, (n.val || 10) * 1.5) * 1.8))
      }

      sim.d3ReheatSimulation()
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [graphData, selectedId, nodeMap, graphRef, groups])
}

