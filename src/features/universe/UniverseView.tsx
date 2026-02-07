import { useEffect, useRef, useCallback, useMemo } from "react"
import ForceGraph3D from "react-force-graph-3d"
import type { ForceGraphMethods } from "react-force-graph-3d"
import * as THREE from "three"
import * as d3 from "d3-force-3d"
import type { CelestialNode, CelestialLink, GalaxyConfig } from "@/types/universe"
import { useLODRenderer } from "./useLODRenderer"
import { useCameraZoom } from "./useCameraZoom"
import "./universe.css"

type UniverseViewProps = {
  nodes: CelestialNode[]
  links: CelestialLink[]
  galaxies?: GalaxyConfig[]
  onSelectNode: (id: string) => void
  onBackgroundClick: () => void
  selectedId: string | null
}

export function UniverseView({
  nodes,
  links,
  galaxies = [],
  onSelectNode,
  onBackgroundClick,
  selectedId,
}: UniverseViewProps) {
  const graphRef = useRef<ForceGraphMethods>(undefined)
  const zoomRef = useRef<HTMLSpanElement | null>(null)
  const sceneSetupDone = useRef(false)

  const neighborIds = useMemo(() => {
    if (!selectedId) return new Set<string>()
    const neighbors = new Set<string>()
    const selNode = nodes.find(n => n.id === selectedId)
    if (selNode) selNode.relations.forEach(r => neighbors.add(r.targetId))
    nodes.forEach(n => {
      if (n.relations.some(r => r.targetId === selectedId)) neighbors.add(n.id)
    })
    return neighbors
  }, [selectedId, nodes])

  const nodeThreeObject = useLODRenderer(graphRef, selectedId, neighborIds)
  useCameraZoom(graphRef, zoomRef)

  // --- SCENE AMBIANCE & STARFIELD ---
  useEffect(() => {
    if (!graphRef.current || sceneSetupDone.current) return
    const scene = graphRef.current.scene()
    if (!scene) return
    sceneSetupDone.current = true

    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dl = new THREE.DirectionalLight(0xffffff, 0.6)
    dl.position.set(1000, 1000, 1000)
    scene.add(dl)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 6000
    const posArray = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15000 
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    })
    const starField = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(starField)
  }, [])

  useEffect(() => {
    const sim = graphRef.current
    if (!sim || nodes.length === 0) return

    const timeout = setTimeout(() => {
      // 1. Dynamic Galaxy Centers (NO HARDCODED FALLBACKS)
      const galaxyCenters: Record<string, { x: number; y: number; z: number }> = {}
      galaxies.forEach(g => {
        galaxyCenters[g.id] = g.center
      })

      // 2. Physics Rules
      sim.d3Force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance((l: any) => {
          if (l.type === "hypernym") {
            const source = nodes.find(n => n.id === (typeof l.source === 'string' ? l.source : l.source.id))
            const target = nodes.find(n => n.id === (typeof l.target === 'string' ? l.target : l.target.id))
            if (source?.celestialType.includes('giant') && target?.celestialType === 'supergiant') return 1000
            return 400
          }
          return 600
        })
        .strength((l: any) => l.type === "hypernym" ? 1 : 0.1)
      )

      sim.d3Force("charge", d3.forceManyBody().strength((n: any) => {
        const node = n as CelestialNode
        if (node.celestialType === "supergiant") return -25000
        if (node.celestialType.includes("giant")) return -10000
        return -800 
      }).distanceMax(2000))

      sim.d3Force("x", d3.forceX((n: any) => {
        const node = n as CelestialNode
        const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
        // Pull to galaxy center if defined, else stay at current x
        return isStar ? (galaxyCenters[node.galaxyId]?.x ?? 0) : n.x
      }).strength((n: any) => (n as CelestialNode).celestialType.includes("giant") || (n as CelestialNode).celestialType === "supergiant" ? 0.4 : 0))

      sim.d3Force("y", d3.forceY((n: any) => {
        const node = n as CelestialNode
        const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
        return isStar ? (galaxyCenters[node.galaxyId]?.y ?? 0) : n.y
      }).strength((n: any) => (n as CelestialNode).celestialType.includes("giant") || (n as CelestialNode).celestialType === "supergiant" ? 0.4 : 0))

      sim.d3Force("z", d3.forceZ((n: any) => {
        const node = n as CelestialNode
        const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
        return isStar ? (galaxyCenters[node.galaxyId]?.z ?? 0) : n.z
      }).strength((n: any) => (n as CelestialNode).celestialType.includes("giant") || (n as CelestialNode).celestialType === "supergiant" ? 0.4 : 0))

      sim.d3Force("collide", d3.forceCollide().radius((n: any) => (n as CelestialNode).radius * 2).strength(0.7))
      
      if (typeof sim.d3VelocityDecay === 'function') sim.d3VelocityDecay(0.3)
      sim.d3ReheatSimulation()
    }, 100)
    return () => clearTimeout(timeout)
  }, [nodes, links, galaxies])

  const performFocus = useCallback((nodeId: string) => {
    const fg = graphRef.current
    if (!fg) return
    const node = nodes.find((n) => n.id === nodeId)
    if (!node || node.x === undefined) return
    const camera = fg.camera(); const currentPos = camera.position
    const direction = new THREE.Vector3(currentPos.x - node.x, currentPos.y - node.y, currentPos.z - node.z).normalize()
    const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
    let distance = node.radius * 10
    if (isStar) distance = Math.max(distance, 600); else distance = Math.max(distance, 300)
    fg.cameraPosition({ x: node.x + direction.x * distance, y: node.y + direction.y * distance + (distance * 0.2), z: node.z + direction.z * distance }, { x: node.x, y: node.y, z: node.z }, 1200)
  }, [nodes])

  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => performFocus(selectedId), 150)
      return () => clearTimeout(timer)
    }
  }, [selectedId, performFocus])

  useEffect(() => {
    if (graphRef.current) {
      const controls = graphRef.current.controls() as { minDistance: number; maxDistance: number }
      if (controls) { controls.minDistance = 50; controls.maxDistance = 15000 }
    }
  }, [])

  const getLinkColor = useCallback((link: CelestialLink) => {
    const sId = typeof link.source === "string" ? link.source : link.source.id
    const tId = typeof link.target === "string" ? link.target : link.target.id
    if (selectedId && (sId === selectedId || tId === selectedId)) return "#fbbf24"
    
    // Check if it's a "backbone" link (between major stars)
    const s = nodes.find(n => n.id === sId)
    const t = nodes.find(n => n.id === tId)
    const isBackbone = (s?.celestialType === 'supergiant' || s?.celestialType.includes('giant')) && 
                       (t?.celestialType === 'supergiant' || t?.celestialType.includes('giant'))
    
    return isBackbone ? "rgba(71, 85, 105, 0.4)" : "rgba(30, 41, 59, 0.1)"
  }, [selectedId, nodes])

  return (
    <div className="universe">
      <div className="universe-zoom-indicator">
        <span className="universe-zoom-indicator__label">Zoom Level</span>
        <span className="universe-zoom-indicator__value" ref={zoomRef}>100%</span>
      </div>
      <ForceGraph3D
        ref={graphRef}
        graphData={{ nodes, links }}
        backgroundColor="#020617"
        showNavInfo={false}
        nodeThreeObject={nodeThreeObject}
        onNodeClick={(node) => onSelectNode((node as CelestialNode).id)}
        linkVisibility={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "string" ? l.source : l.source.id
          const tId = typeof l.target === "string" ? l.target : l.target.id
          
          if (selectedId) return sId === selectedId || tId === selectedId
          
          // Show only backbone links when nothing is selected
          const s = nodes.find(n => n.id === sId)
          const t = nodes.find(n => n.id === tId)
          return (s?.celestialType === 'supergiant' || s?.celestialType.includes('giant')) && 
                 (t?.celestialType === 'supergiant' || t?.celestialType.includes('giant'))
        }}
        linkColor={(link) => getLinkColor(link as CelestialLink)}
        linkWidth={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "string" ? l.source : l.source.id
          const tId = typeof l.target === "string" ? l.target : l.target.id
          return (selectedId && (sId === selectedId || tId === selectedId)) ? 2.5 : 0.8
        }}
        linkDirectionalParticles={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "string" ? l.source : l.source.id
          const tId = typeof l.target === "string" ? l.target : l.target.id
          return (selectedId && (sId === selectedId || tId === selectedId)) ? 6 : 0
        }}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleSpeed={0.006}
        onBackgroundClick={() => {
          onBackgroundClick()
          graphRef.current?.cameraPosition({ x: 0, y: 0, z: 4000 }, { x: 0, y: 0, z: 0 }, 1500)
        }}
      />
    </div>
  )
}