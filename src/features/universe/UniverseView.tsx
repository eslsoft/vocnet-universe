import { useEffect, useMemo, useRef, useCallback, useState } from "react"
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d"
import * as THREE from "three"
import * as d3 from "d3-force-3d"
import { UniverseSearch } from "./UniverseSearch"
import { ViewSwitcher } from "./ViewSwitcher"
import { UniverseLegend } from "./UniverseLegend"
import { buildMockUniverse, UniverseGraph } from "./mock"
import "./universe.css"

const VISUAL_THEME = {
  nodes: { l1: "#a855f7", l2: "#38bdf8", l3: "#f59e0b", l4: "#22c55e", selected: "#ffffff" },
  links: {
    is_a: "#f472b6",
    has_kind: "#38bdf8",
    has_part: "#f97316",
    action: "#10b981", 
    property: "#fbbf24", 
    context: "#38bdf8", 
    origin: "#a78bfa", 
    synonym: "#10b981",
    hierarchy: "#1e293b",
    default: "#1e293b"
  }
}

type UniverseViewProps = {
  onSelectNode: (id: string) => void
  onStatsChange: (stats: { nodes: number; links: number }) => void
  onBackgroundClick: () => void
  selectedId: string | null
}

export function UniverseView({
  onSelectNode,
  onStatsChange,
  onBackgroundClick,
  selectedId,
}: UniverseViewProps) {
  const graphRef = useRef<ForceGraphMethods | null>(null)
  const [viewMode, setViewMode] = useState<"semantic" | "category" | "grammar">("semantic")
  const [masterData, setMasterData] = useState<UniverseGraph>({ nodes: [], links: [] })
  
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set([
    "l1", "l2", "l3", "l4", "is_a", "has_kind", "has_part", "action", "property", "context", "origin", "synonym", "hierarchy"
  ]))

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next
    })
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const fileName = viewMode === "semantic" ? "semantic_graph.json" : "category_graph.json"
        const response = await fetch(`/data/${fileName}?t=${Date.now()}`)
        const raw = await response.json()
        if (active) setMasterData(raw)
      } catch (err) {
        if (active) setMasterData(buildMockUniverse())
      }
    }
    void load()
    return () => { active = false }
  }, [viewMode])

  const masterAdjacency = useMemo(() => {
    const map = new Map<string, Set<any>>()
    masterData.nodes.forEach(n => map.set(n.id, new Set()))
    masterData.links.forEach(l => {
      if (!activeFilters.has(l.type)) return
      const s = typeof l.source === "string" ? l.source : (l.source as any).id
      const t = typeof l.target === "string" ? l.target : (l.target as any).id
      if (map.has(s) && map.has(t)) {
        map.get(s)?.add(l); map.get(t)?.add(l)
      }
    })
    return map
  }, [masterData, activeFilters])

  const graphData = useMemo(() => {
    if (masterData.nodes.length === 0) return { nodes: [], links: [] }
    let finalNodeIds = new Set<string>()
    let finalLinks = new Set<any>()

    if (!selectedId) {
      masterData.nodes.forEach(n => { if (n.level <= 3 && activeFilters.has(`l${n.level}`)) finalNodeIds.add(n.id) })
      masterData.links.forEach(l => {
        if (!activeFilters.has(l.type)) return
        const s = typeof l.source === "string" ? l.source : (l.source as any).id
        const t = typeof l.target === "string" ? l.target : (l.target as any).id
        if (finalNodeIds.has(s) && finalNodeIds.has(t)) finalLinks.add(l)
      })
    } else {
      finalNodeIds.add(selectedId)
      masterAdjacency.get(selectedId)?.forEach(link => {
        const s = typeof link.source === "string" ? link.source : (link.source as any).id
        const t = typeof link.target === "string" ? link.target : (link.target as any).id
        finalNodeIds.add(s === selectedId ? t : s); finalLinks.add(link)
      })
    }
    return { nodes: masterData.nodes.filter(n => finalNodeIds.has(n.id)), links: Array.from(finalLinks) }
  }, [masterData, selectedId, activeFilters, masterAdjacency])

  const distanceMap = useMemo(() => {
    if (!selectedId) return null
    const distances = new Map<string, number>(); distances.set(selectedId, 0)
    graphData.links.forEach(l => {
      const s = typeof l.source === "string" ? l.source : (l.source as any).id
      const t = typeof l.target === "string" ? l.target : (l.target as any).id
      if (s === selectedId) distances.set(t, 1)
      else if (t === selectedId) distances.set(s, 1)
    })
    return distances
  }, [graphData, selectedId])

  useEffect(() => {
    const fg = graphRef.current
    if (!fg || !graphData.nodes.length) return
    const timeoutId = setTimeout(() => {
      const sim = graphRef.current
      if (!sim) return
      sim.d3Force("x", null); sim.d3Force("y", null); sim.d3Force("z", null); 
      sim.d3Force("center", null); sim.d3Force("radial", null); sim.d3Force("collide", null);

      if (selectedId) {
        const parentIds = new Set(); const childIds = new Set(); const contextIds = new Set()
        graphData.links.forEach((l: any) => {
          const s = l.source.id || l.source; const t = l.target.id || l.target
          if (s === selectedId) {
            if (l.type === "is_a") parentIds.add(t);
            else if (l.type === "has_kind" || l.type === "has_part") childIds.add(t);
            else contextIds.add(t)
          } else if (t === selectedId) {
            if (l.type === "is_a") childIds.add(s);
            else if (l.type === "has_kind" || l.type === "has_part") parentIds.add(s);
            else contextIds.add(s)
          }
        })
        sim.d3Force("x", d3.forceX(0).strength((n: any) => n.id === selectedId ? 2 : (parentIds.has(n.id) || childIds.has(n.id) ? 0.8 : 0)))
        sim.d3Force("x_flow", d3.forceX((n: any) => { if (n.id === selectedId) return 0; if (parentIds.has(n.id)) return -500; if (childIds.has(n.id)) return 500; return 0 }).strength((n: any) => n.id === selectedId ? 0 : 1))
        sim.d3Force("y_flow", d3.forceY((n: any) => contextIds.has(n.id) ? 300 : 0).strength(0.5))
        sim.d3Force("z", d3.forceZ(0).strength(1))
        sim.d3Force("link")?.distance(150).strength(1)
        sim.d3Force("charge")?.strength(-300)
        sim.d3Force("collide", d3.forceCollide().radius(40))
      } else {
        sim.d3Force("link")?.distance((l: any) => l.distance || 150).strength(0.6)
        sim.d3Force("charge")?.strength(-400).distanceMax(1500)
        sim.d3Force("center", d3.forceCenter(0, 0, 0))
        sim.d3Force("collide", d3.forceCollide().radius((n: any) => (n.val || 5) + 10))
      }
      sim.d3ReheatSimulation()
    }, 50)
    return () => clearTimeout(timeoutId)
  }, [graphData, selectedId])

  const materialCache = useRef<Map<string, THREE.MeshPhongMaterial>>(new Map())
  const geometryCache = useRef<Map<number, THREE.SphereGeometry>>(new Map())
  const getMaterial = (color: string, opacity = 1) => {
    const key = `${color}:${opacity}`
    let mat = materialCache.current.get(key)
    if (!mat) { mat = new THREE.MeshPhongMaterial({ color, transparent: opacity < 1, opacity, emissive: color, emissiveIntensity: 0.25, shininess: 30 }); materialCache.current.set(key, mat) }
    return mat
  }
  const getGeometry = (level: number) => {
    let geo = geometryCache.current.get(level)
    if (!geo) { geo = new THREE.SphereGeometry(1, 24, 24); geometryCache.current.set(level, geo) }
    return geo
  }

  const createLabelSprite = (text: string, sizeScale = 1, isHighlighted = false) => {
    const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d")!
    const fontSize = 48; ctx.font = `600 ${fontSize}px sans-serif`
    const width = ctx.measureText(text).width + 40; canvas.width = width; canvas.height = fontSize + 40
    ctx.fillStyle = isHighlighted ? "rgba(244, 63, 94, 0.95)" : "rgba(15, 23, 42, 0.85)"
    ctx.roundRect(0, 0, width, canvas.height, 8); ctx.fill()
    ctx.font = `600 ${fontSize}px sans-serif`; ctx.fillStyle = "white"; ctx.textBaseline = "middle"; ctx.fillText(text, 20, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas); const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(material); sprite.renderOrder = 999
    sprite.scale.set(width/15 * sizeScale, canvas.height/15 * sizeScale, 1); return sprite
  }

  const resetCamera = useCallback(() => { if (graphRef.current) graphRef.current.cameraPosition({ x: 0, y: 0, z: 2500 }, { x: 0, y: 0, z: 0 }, 1000) }, [])

  useEffect(() => { onStatsChange({ nodes: graphData.nodes.length, links: graphData.links.length }) }, [graphData.links.length, graphData.nodes.length, onStatsChange])

  return (
    <div className="universe">
      <div className="universe-hud">
        <div className="universe-hud__top">
          <UniverseSearch nodes={masterData.nodes} onSelect={(node) => { onSelectNode(node.id); if(graphRef.current) graphRef.current.cameraPosition({x:0,y:0,z:800}, {x:0,y:0,z:0}, 1000) }} />
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
        <UniverseLegend viewMode={viewMode} activeFilters={activeFilters} onToggleFilter={toggleFilter} />
      </div>

      <ForceGraph3D ref={graphRef} graphData={graphData} backgroundColor="#020617" showNavInfo={false} d3VelocityDecay={0.4} warmupTicks={50}
        linkVisibility={(link: any) => {
          if (!activeFilters.has(link.type)) return false;
          if (!selectedId) return true;
          const s = typeof link.source === "object" ? link.source.id : link.source;
          const t = typeof link.target === "object" ? link.target.id : link.target;
          return s === selectedId || t === selectedId;
        }}
        linkColor={(link: any) => {
          if (!selectedId) return "#1e293b"
          const type = link.type || "is_a"
          return VISUAL_THEME.links[type as keyof typeof VISUAL_THEME.links] || VISUAL_THEME.links.default
        }}
        linkWidth={(link: any) => selectedId ? 1.5 : 0.4} 
        linkDirectionalParticles={(link: any) => {
          if (!selectedId) return 0;
          const s = typeof link.source === "object" ? link.source.id : link.source;
          const t = typeof link.target === "object" ? link.target.id : link.target;
          return (s === selectedId || t === selectedId) ? 4 : 0;
        }} 
        nodeThreeObject={(node: any) => {
          const isSelected = selectedId === node.id; const dist = distanceMap?.get(node.id); const isNeighbor = dist !== undefined
          const radius = Math.min(15, Math.max(3, (node.val || 10) / 2))
          let color = VISUAL_THEME.nodes[`l${node.level as 1|2|3|4}`] || VISUAL_THEME.nodes.l3
          if (isSelected) color = VISUAL_THEME.nodes.selected
          const mesh = new THREE.Mesh(getGeometry(4), getMaterial(color, 0.95))
          mesh.scale.setScalar(radius * (isSelected ? 1.2 : 1))
          const group = new THREE.Group(); group.add(mesh)
          if (isSelected || dist === 1 || (!selectedId && node.level <= 2)) {
            const label = createLabelSprite(node.label, (radius/15 + 0.8) * (isSelected ? 1.2 : 1), isSelected)
            label.position.set(0, radius + 10, 0); group.add(label)
          }
          return group
        }}
        onNodeClick={(node) => { onSelectNode(node.id); if(graphRef.current) graphRef.current.cameraPosition({x:0,y:0,z:800}, {x:0,y:0,z:0}, 1000) }}
        onBackgroundClick={() => { onBackgroundClick(); resetCamera() }}
      />
    </div>
  )
}
