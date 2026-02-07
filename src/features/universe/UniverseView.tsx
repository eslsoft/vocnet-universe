import { useEffect, useRef, useCallback, useMemo } from "react"
import ForceGraph3D from "react-force-graph-3d"
import type { ForceGraphMethods, NodeObject } from "react-force-graph-3d"
import * as THREE from "three"
import * as d3 from "d3-force-3d"
import type { CelestialNode, CelestialLink, GalaxyConfig } from "@/types/universe"
import { useLODRenderer } from "./useLODRenderer"
import { useCameraZoom } from "./useCameraZoom"
import "./universe.css"

type D3Node = NodeObject<CelestialNode>;

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
  const graphRef = useRef<ForceGraphMethods<CelestialNode, CelestialLink>>(undefined)
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

  // --- PHYSICS SIMULATION SETUP ---
  useEffect(() => {
    const fg = graphRef.current
    if (!fg || nodes.length === 0) return

    const timeout = setTimeout(() => {
      const galaxyCenters: Record<string, { x: number; y: number; z: number }> = {}
      galaxies.forEach(g => {
        galaxyCenters[g.id] = g.center
      })

      const linkForce = d3.forceLink<D3Node, CelestialLink>(links)
        .id((d: D3Node) => d.id as string)
        .distance((l: CelestialLink) => {
          const s = typeof l.source === 'object' ? l.source : nodes.find(n => n.id === l.source)
          const t = typeof l.target === 'object' ? l.target : nodes.find(n => n.id === l.target)
          if (s?.celestialType.includes('giant') && t?.celestialType === 'supergiant') return 1000
          return 400
        })
        .strength((l: CelestialLink) => l.type === "hypernym" ? 1 : 0.1)
      fg.d3Force("link", linkForce)

      const chargeForce = d3.forceManyBody<D3Node>()
        .strength((node: D3Node) => {
          if (node.celestialType === "supergiant") return -25000
          if (node.celestialType.includes("giant")) return -10000
          return -800 
        })
        .distanceMax(2000)
      fg.d3Force("charge", chargeForce)

      const xForce = d3.forceX<D3Node>()
        .x((node: D3Node) => {
          const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
          return isStar ? (galaxyCenters[node.galaxyId]?.x ?? 0) : (node.x ?? 0)
        })
        .strength((node: D3Node) => node.celestialType.includes("giant") || node.celestialType === "supergiant" ? 0.4 : 0)
      fg.d3Force("x", xForce)

      const yForce = d3.forceY<D3Node>()
        .y((node: D3Node) => {
          const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
          return isStar ? (galaxyCenters[node.galaxyId]?.y ?? 0) : (node.y ?? 0)
        })
        .strength((node: D3Node) => node.celestialType.includes("giant") || node.celestialType === "supergiant" ? 0.4 : 0)
      fg.d3Force("y", yForce)

      const zForce = d3.forceZ<D3Node>()
        .z((node: D3Node) => {
          const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
          return isStar ? (galaxyCenters[node.galaxyId]?.z ?? 0) : (node.z ?? 0)
        })
        .strength((node: D3Node) => node.celestialType.includes("giant") || node.celestialType === "supergiant" ? 0.4 : 0)
      fg.d3Force("z", zForce)

      const collideForce = d3.forceCollide<D3Node>()
        .radius((node: D3Node) => node.radius * 2)
        .strength(0.7)
      fg.d3Force("collide", collideForce)
      
      fg.d3ReheatSimulation()
    }, 100)
    return () => clearTimeout(timeout)
  }, [nodes, links, galaxies])

  const performFocus = useCallback((nodeId: string) => {
    const fg = graphRef.current
    if (!fg) return
    const node = nodes.find((n) => n.id === nodeId)
    if (!node || node.x === undefined || node.y === undefined || node.z === undefined) return
    
    const camera = fg.camera()
    const currentPos = camera.position
    
    const direction = new THREE.Vector3(
      currentPos.x - node.x, 
      currentPos.y - node.y, 
      currentPos.z - node.z
    ).normalize()
    
    const isStar = node.celestialType.includes("giant") || node.celestialType === "supergiant" || node.celestialType === "main_sequence"
    let distance = node.radius * 10
    if (isStar) distance = Math.max(distance, 600)
    else distance = Math.max(distance, 300)

    fg.cameraPosition(
      { 
        x: node.x + direction.x * distance, 
        y: node.y + direction.y * distance + (distance * 0.2), 
        z: node.z + direction.z * distance 
      }, 
      { x: node.x, y: node.y, z: node.z }, 
      1200
    )
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
    const sId = typeof link.source === "object" ? link.source.id : link.source
    const tId = typeof link.target === "object" ? link.target.id : link.target
    
    if (selectedId && (sId === selectedId || tId === selectedId)) return "#fbbf24"
    
    const s = nodes.find(n => n.id === sId)
    const t = nodes.find(n => n.id === tId)
    const isBackbone = (s?.celestialType === 'supergiant' || s?.celestialType?.includes('giant')) && 
                       (t?.celestialType === 'supergiant' || t?.celestialType?.includes('giant'))
    
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
        d3VelocityDecay={0.3}
        nodeThreeObject={nodeThreeObject}
        onNodeClick={(node) => onSelectNode((node as D3Node).id as string)}
        linkVisibility={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "object" ? l.source.id : l.source
          const tId = typeof l.target === "object" ? l.target.id : l.target
          
          if (selectedId) return sId === selectedId || tId === selectedId
          
          const s = nodes.find(n => n.id === sId)
          const t = nodes.find(n => n.id === tId)
          return !!((s?.celestialType === 'supergiant' || s?.celestialType?.includes('giant')) && 
                 (t?.celestialType === 'supergiant' || t?.celestialType?.includes('giant')))
        }}
        linkColor={(link) => getLinkColor(link as CelestialLink)}
        linkWidth={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "object" ? l.source.id : l.source
          const tId = typeof l.target === "object" ? l.target.id : l.target
          return (selectedId && (sId === selectedId || tId === selectedId)) ? 2.5 : 0.8
        }}
        linkDirectionalParticles={(link) => {
          const l = link as CelestialLink
          const sId = typeof l.source === "object" ? l.source.id : l.source
          const tId = typeof l.target === "object" ? l.target.id : l.target
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