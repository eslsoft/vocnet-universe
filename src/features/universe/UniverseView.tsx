import { useEffect, useMemo, useRef, useCallback, useState } from "react"
import ForceGraph3D from "react-force-graph-3d"
import type { ForceGraphMethods } from "react-force-graph-3d"
import { UniverseSearch } from "./UniverseSearch"
import { UniverseLegend } from "./UniverseLegend"
import type { UniverseGraphData } from "@/types/universe"
import { resolveLinkColor } from "./config"
import { linkId } from "./linkHelpers"
import { useGraphData } from "./useGraphData"
import { useForceConfig } from "./useForceConfig"
import { useNodeRenderer } from "./useNodeRenderer"
import { useCameraZoom } from "./useCameraZoom"
import "./universe.css"

type UniverseViewProps = {
  masterData: UniverseGraphData
  onSelectNode: (id: string) => void
  onStatsChange: (stats: { nodes: number; links: number }) => void
  onBackgroundClick: () => void
  selectedId: string | null
}

export function UniverseView({
  masterData,
  onSelectNode,
  onStatsChange,
  onBackgroundClick,
  selectedId,
}: UniverseViewProps) {
  const graphRef = useRef<ForceGraphMethods>(undefined)
  const zoomRef = useRef<HTMLSpanElement | null>(null)

  const schema = masterData.schema

  // Build all possible filter IDs from the data
  const allFilterIds = useMemo(() => {
    const set = new Set<string>()
    for (const n of masterData.nodes) set.add(`l${n.level}`)
    for (const l of masterData.links) set.add(l.type)
    return set
  }, [masterData.nodes, masterData.links])

  // Toggled-off filters (inverted set — empty means "all active")
  const [disabledFilters, setDisabledFilters] = useState<Set<string>>(new Set())

  // Derived active filters = allFilterIds minus disabled
  const activeFilters = useMemo(() => {
    if (disabledFilters.size === 0) return allFilterIds
    const set = new Set(allFilterIds)
    for (const id of disabledFilters) set.delete(id)
    return set
  }, [allFilterIds, disabledFilters])

  const toggleFilter = useCallback((id: string) => {
    setDisabledFilters(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  // Data layer
  const { nodeMap, graphData, distanceMap } = useGraphData(masterData, selectedId, activeFilters)

  // Force simulation
  useForceConfig(graphRef, graphData, selectedId, nodeMap)

  // Node rendering (cached)
  const nodeThreeObject = useNodeRenderer(schema, selectedId, distanceMap)

  // Camera zoom (zero React renders)
  useCameraZoom(graphRef, zoomRef)

  // Report stats
  useEffect(() => {
    onStatsChange({ nodes: graphData.nodes.length, links: graphData.links.length })
  }, [graphData, onStatsChange])

  // Focus camera on selection
  const performFocus = useCallback((nodeId: string) => {
    const fg = graphRef.current
    if (!fg) return
    const meta = nodeMap.get(nodeId)
    if (!meta) return
    const isHub = meta.level <= 1
    const distance = isHub ? 1200 : 500
    const lookAtOffset = isHub ? 150 : 60
    fg.cameraPosition(
      { x: 0, y: 0, z: distance },
      { x: lookAtOffset, y: 0, z: 0 },
      1000,
    )
  }, [nodeMap])

  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => performFocus(selectedId), 150)
      return () => clearTimeout(timer)
    }
  }, [selectedId, performFocus])

  // Init camera controls
  useEffect(() => {
    if (graphRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controls = graphRef.current.controls() as any
      if (controls) {
        controls.minDistance = 100
        controls.maxDistance = 10000
      }
    }
  }, [])

  return (
    <div className="universe">
      <div className="universe-hud">
        <div className="universe-hud__top">
          <UniverseSearch nodes={masterData.nodes} schema={schema} onSelect={(node) => onSelectNode(node.id)} />
        </div>
        {schema && (
          <UniverseLegend schema={schema} activeFilters={activeFilters} onToggleFilter={toggleFilter} />
        )}
      </div>

      <div className="universe-zoom-indicator">
        <span className="universe-zoom-indicator__label">Zoom Level</span>
        <span className="universe-zoom-indicator__value" ref={zoomRef}>100%</span>
      </div>

      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="#020617"
        showNavInfo={false}
        d3VelocityDecay={0.4}
        nodeThreeObject={nodeThreeObject}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodeClick={(node: any) => onSelectNode(node.id as string)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkVisibility={(link: any) => activeFilters.has(link.type as string)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkColor={(link: any) => {
          if (selectedId) {
            const s = linkId(link.source)
            const t = linkId(link.target)
            if (s === selectedId || t === selectedId) return resolveLinkColor(schema, link.type)
            return "#0f172a"
          }
          return "#1e293b"
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkWidth={(link: any) => {
          if (selectedId) {
            const s = linkId(link.source)
            const t = linkId(link.target)
            return (s === selectedId || t === selectedId) ? 2 : 0.2
          }
          return 0.5
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkDirectionalParticles={(link: any) => {
          if (!selectedId) return 0
          const s = linkId(link.source)
          const t = linkId(link.target)
          return (s === selectedId || t === selectedId) ? 4 : 0
        }}
        linkDirectionalParticleWidth={2}
        onBackgroundClick={() => {
          onBackgroundClick()
          graphRef.current?.cameraPosition({ x: 0, y: 0, z: 2500 }, { x: 0, y: 0, z: 0 }, 1000)
        }}
      />
    </div>
  )
}
