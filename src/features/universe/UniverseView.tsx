import { useEffect, useMemo, useRef, useCallback, useState } from "react"
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d"
import * as THREE from "three"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { buildMockUniverse, levelColor, UniverseGraph } from "./mock"
import "./universe.css"

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
  const resetCameraRef = useRef({ x: 0, y: 0, z: 2200 })
  const rawData = useMemo<UniverseGraph>(() => buildMockUniverse(), [])
  const data = useMemo<UniverseGraph>(() => {
    return {
      nodes: rawData.nodes.map((node) => ({ ...node })),
      links: rawData.links.map((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id
        return { source: sourceId, target: targetId, type: link.type }
      }),
    }
  }, [rawData])
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>()
    data.nodes.forEach((node) => map.set(node.id, new Set()))
    data.links.forEach((link) => {
      const source = typeof link.source === "string" ? link.source : link.source.id
      const target = typeof link.target === "string" ? link.target : link.target.id
      map.get(source)?.add(target)
      map.get(target)?.add(source)
    })
    return map
  }, [data])
  const nodeById = useMemo(() => {
    const map = new Map<string, (typeof data.nodes)[number]>()
    data.nodes.forEach((node) => map.set(node.id, node))
    return map
  }, [data.nodes])
  const materialCache = useRef<Map<string, THREE.MeshBasicMaterial>>(new Map())
  const geometryCache = useRef<Map<number, THREE.SphereGeometry>>(new Map())
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const MAX_DEPTH = 3
  const pendingFocusId = useRef<string | null>(null)
  const focusAttempts = useRef(0)

  const distanceMap = useMemo(() => {
    if (!selectedId) return null
    const distances = new Map<string, number>()
    const queue: Array<{ id: string; depth: number }> = [
      { id: selectedId, depth: 0 },
    ]
    distances.set(selectedId, 0)

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) break
      if (current.depth >= MAX_DEPTH) continue
      const neighbors = adjacency.get(current.id)
      if (!neighbors) continue
      neighbors.forEach((neighborId) => {
        if (!distances.has(neighborId)) {
          const depth = current.depth + 1
          distances.set(neighborId, depth)
          queue.push({ id: neighborId, depth })
        }
      })
    }

    return distances
  }, [adjacency, selectedId])

  const filteredGraph = useMemo<UniverseGraph>(() => {
    if (!distanceMap) return data
    const visibleIds = new Set(distanceMap.keys())
    const nodes = data.nodes.filter((node) => visibleIds.has(node.id))
    const links = data.links.filter((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id
      return visibleIds.has(sourceId) && visibleIds.has(targetId)
    })
    return {
      nodes,
      links: links.map((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id
        return {
          source: sourceId,
          target: targetId,
          type: link.type,
        }
      }),
    }
  }, [data, distanceMap])
  const filteredNodeById = useMemo(() => {
    const map = new Map<string, (typeof filteredGraph.nodes)[number]>()
    filteredGraph.nodes.forEach((node) => map.set(node.id, node))
    return map
  }, [filteredGraph.nodes])

  const focusNode = useCallback(
    (node: any) => {
      if (!node) return
      const neighbors = adjacency.get(node.id) ?? new Set<string>()
      const depthMap = new Map<string, number>()
      const queue: Array<{ id: string; depth: number }> = [
        { id: node.id, depth: 0 },
      ]
      depthMap.set(node.id, 0)

      while (queue.length > 0) {
        const current = queue.shift()
        if (!current) break
        if (current.depth >= MAX_DEPTH) continue
        const next = adjacency.get(current.id)
        if (!next) continue
        next.forEach((id) => {
          if (!depthMap.has(id)) {
            const depth = current.depth + 1
            depthMap.set(id, depth)
            queue.push({ id, depth })
          }
        })
      }
      const points: { x: number; y: number; z: number }[] = []

      points.push({ x: node.x, y: node.y, z: node.z })
      depthMap.forEach((depth, id) => {
        if (depth === 0 || depth > 2) return
        const neighbor = filteredNodeById.get(id) ?? nodeById.get(id)
        if (neighbor && typeof neighbor.x === "number") {
          points.push({ x: neighbor.x, y: neighbor.y, z: neighbor.z })
        }
      })

      let minX = Infinity
      let minY = Infinity
      let minZ = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      let maxZ = -Infinity

      points.forEach((p) => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        minZ = Math.min(minZ, p.z)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
        maxZ = Math.max(maxZ, p.z)
      })

      const center = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: (minZ + maxZ) / 2,
      }

      const radius = Math.max(
        60,
        Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2,
      )
      const distance = radius * 0.6
      const camera = graphRef.current?.camera()
      if (!camera) return
      const dir = new THREE.Vector3()
        .subVectors(camera.position, new THREE.Vector3(node.x, node.y, node.z))
        .normalize()
      const newPos = new THREE.Vector3(
        node.x + dir.x * distance,
        node.y + dir.y * distance,
        node.z + dir.z * distance,
      )

      graphRef.current?.cameraPosition(
        { x: newPos.x, y: newPos.y, z: newPos.z },
        node,
        550,
      )
    },
    [adjacency, filteredNodeById, nodeById],
  )

  const resetCamera = useCallback(() => {
    const { x, y, z } = resetCameraRef.current
    graphRef.current?.cameraPosition({ x, y, z }, { x: 0, y: 0, z: 0 }, 900)
  }, [])

  useEffect(() => {
    onStatsChange({ nodes: data.nodes.length, links: data.links.length })
  }, [data.links.length, data.nodes.length, onStatsChange])


  useEffect(() => {
    if (!selectedId) {
      resetCamera()
    }
  }, [resetCamera, selectedId])

  useEffect(() => {
    if (!selectedId) return
    const node = filteredNodeById.get(selectedId) ?? nodeById.get(selectedId)
    if (!node) return
    pendingFocusId.current = selectedId
    focusAttempts.current = 0
  }, [focusNode, nodeById, selectedId])

  useEffect(() => {
    if (!selectedId) return
    let raf = 0
    const tick = () => {
      const id = pendingFocusId.current
      if (!id) return
      const node = filteredNodeById.get(id) ?? nodeById.get(id)
      if (!node) return
      const moving =
        Math.abs(node.vx ?? 0) > 0.02 ||
        Math.abs(node.vy ?? 0) > 0.02 ||
        Math.abs(node.vz ?? 0) > 0.02
      if (!moving || focusAttempts.current >= 6) {
        pendingFocusId.current = null
        focusNode(node)
        return
      }
      focusAttempts.current += 1
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [filteredNodeById, focusNode, nodeById, selectedId])


  useEffect(() => {
    const controls = graphRef.current?.controls()
    if (!controls) return
    controls.enableRotate = true
    controls.enablePan = true
    controls.enableZoom = true
    // Left drag: rotate, Right drag: pan, Wheel: zoom
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
  }, [])

  useEffect(() => {
    const controls = graphRef.current?.controls()
    if (!controls) return

    const defaultButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
    const panButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault()
        controls.mouseButtons = panButtons
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        controls.mouseButtons = defaultButtons
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const getMaterial = (color: string, opacity = 1) => {
    const key = `${color}:${opacity}`
    const cached = materialCache.current.get(key)
    if (cached) return cached
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
    })
    materialCache.current.set(key, material)
    return material
  }

  const getGeometry = (level: number) => {
    const cached = geometryCache.current.get(level)
    if (cached) return cached
    const geometry =
      level === 0
        ? new THREE.SphereGeometry(1, 18, 18)
        : level === 1
          ? new THREE.SphereGeometry(1, 18, 18)
          : level === 2
            ? new THREE.SphereGeometry(1, 16, 16)
            : new THREE.SphereGeometry(1, 12, 12)
    geometryCache.current.set(level, geometry)
    return geometry
  }

  return (
    <div className="universe">
      <div className="universe-overlay">
        <div
          className={cn(
            "universe-overlay__search",
            isSearchOpen && "is-open",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Toggle search"
                className="universe-search__icon"
              >
                <Search />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
          {isSearchOpen ? (
            <Input
              placeholder="Search word..."
              className="universe-search__input"
            />
          ) : null}
        </div>

        <div className="universe-overlay__views">
          <Tabs defaultValue="semantic">
            <TabsList className="universe-tabs">
              <TabsTrigger value="semantic">Semantic</TabsTrigger>
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="grammar">Grammar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="universe-overlay__filters">
          <div className="universe-overlay__label">Filters</div>
          <Badge variant="outline" className="universe-badge">
            Location
          </Badge>
          <Badge variant="outline" className="universe-badge">
            People
          </Badge>
          <Badge variant="outline" className="universe-badge">
            Emotion
          </Badge>
          <Badge variant="outline" className="universe-badge">
            Nature
          </Badge>
        </div>
      </div>

      <ForceGraph3D
        ref={graphRef}
        graphData={filteredGraph}
        backgroundColor="#0b0f1a"
        showNavInfo={false}
        nodeRelSize={3}
        linkVisibility={(link) => {
          if (!distanceMap) return true
          const sourceId =
            typeof link.source === "string" ? link.source : link.source.id
          const targetId =
            typeof link.target === "string" ? link.target : link.target.id
          return distanceMap.has(sourceId) && distanceMap.has(targetId)
        }}
        linkOpacity={(link) => {
          if (!distanceMap) return 0.15
          const sourceId =
            typeof link.source === "string" ? link.source : link.source.id
          const targetId =
            typeof link.target === "string" ? link.target : link.target.id
          const sourceDepth = distanceMap.get(sourceId)
          const targetDepth = distanceMap.get(targetId)
          if (sourceDepth === undefined || targetDepth === undefined) return 0
          const depth = Math.max(sourceDepth, targetDepth)
          if (depth === 0) return 0.9
          if (depth === 1) return 0.6
          if (depth === 2) return 0.35
          if (depth === 3) return 0.2
          return 0.1
        }}
        linkWidth={0.4}
        nodeLabel={(node) => `${node.label} • ${node.grouping.category}`}
        onNodeClick={(node) => {
          pendingFocusId.current = node.id
          if (node.id === selectedId) {
            focusAttempts.current = 0
            window.requestAnimationFrame(() => {
              focusNode(node)
            })
          } else {
            onSelectNode(node.id)
          }
        }}
        onBackgroundClick={onBackgroundClick}
        nodeVisibility={(node) => {
          if (!distanceMap) return true
          return distanceMap.has(node.id)
        }}
        nodeThreeObject={(node) => {
          const level = node.level ?? 3
          const base = Math.max(1.5, node.val ?? 6)
          const depth = distanceMap?.get(node.id)
          const scale =
            depth === undefined
              ? 1
              : depth === 0
                ? 2.4
                : depth === 1
                  ? 1.7
                  : depth === 2
                    ? 1.35
                    : 1.1
          const radius = base * scale
          const geometry = getGeometry(level)
          const color = node.color ?? levelColor(level)
          const opacity =
            depth === undefined
              ? 1
              : depth === 0
                ? 1
                : depth === 1
                  ? 0.7
                  : depth === 2
                    ? 0.45
                    : depth === 3
                      ? 0.25
                      : 0.12
          const material = getMaterial(color, opacity)
          const mesh = new THREE.Mesh(geometry, material)
          mesh.scale.setScalar(radius)
          return mesh
        }}
      />
      <div className="universe__hint">
        Drag to orbit, scroll to zoom, click to inspect.
      </div>
    </div>
  )
}
