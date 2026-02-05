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
}

export function UniverseView({
  onSelectNode,
  onStatsChange,
  onBackgroundClick,
}: UniverseViewProps) {
  const graphRef = useRef<ForceGraphMethods | null>(null)
  const resetCameraRef = useRef({ x: 0, y: 0, z: 2200 })
  const data = useMemo<UniverseGraph>(() => buildMockUniverse(), [])
  const materialCache = useRef<Map<string, THREE.MeshBasicMaterial>>(new Map())
  const geometryCache = useRef<Map<number, THREE.SphereGeometry>>(new Map())
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const focusNode = useCallback((node: any) => {
    const distance = 80 + (node?.val ?? 6) * 12
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)
    graphRef.current?.cameraPosition(
      {
        x: node.x * distRatio,
        y: node.y * distRatio,
        z: node.z * distRatio,
      },
      node,
      800,
    )
  }, [])

  const resetCamera = useCallback(() => {
    const { x, y, z } = resetCameraRef.current
    graphRef.current?.cameraPosition({ x, y, z }, { x: 0, y: 0, z: 0 }, 900)
  }, [])

  useEffect(() => {
    onStatsChange({ nodes: data.nodes.length, links: data.links.length })
  }, [data.links.length, data.nodes.length, onStatsChange])

  useEffect(() => {
    resetCamera()
  }, [resetCamera])

  useEffect(() => {
    const renderer = graphRef.current?.renderer()
    const canvas = renderer?.domElement
    if (!canvas) return

    const handleDoubleClick = () => {
      resetCamera()
    }
    canvas.addEventListener("dblclick", handleDoubleClick)
    return () => canvas.removeEventListener("dblclick", handleDoubleClick)
  }, [resetCamera])

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

  const getMaterial = (color: string) => {
    const cached = materialCache.current.get(color)
    if (cached) return cached
    const material = new THREE.MeshBasicMaterial({ color })
    materialCache.current.set(color, material)
    return material
  }

  const getGeometry = (level: number, radius: number) => {
    const cached = geometryCache.current.get(level)
    if (cached) return cached
    const geometry =
      level === 0
        ? new THREE.SphereGeometry(radius * 2.4, 18, 18)
        : level === 1
          ? new THREE.SphereGeometry(radius * 1.8, 18, 18)
          : level === 2
            ? new THREE.SphereGeometry(radius * 1.4, 16, 16)
            : new THREE.SphereGeometry(radius, 12, 12)
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
        graphData={data}
        backgroundColor="#0b0f1a"
        showNavInfo={false}
        nodeRelSize={3}
        linkOpacity={0.15}
        linkWidth={0.4}
        nodeLabel={(node) => `${node.label} • ${node.grouping.category}`}
        onNodeClick={(node) => {
          onSelectNode(node.id)
          focusNode(node)
        }}
        onBackgroundClick={onBackgroundClick}
        nodeThreeObject={(node) => {
          const level = node.level ?? 3
          const radius = Math.max(1.5, node.val ?? 6)
          const geometry = getGeometry(level, radius)
          const color = node.color ?? levelColor(level)
          const material = getMaterial(color)
          return new THREE.Mesh(geometry, material)
        }}
      />
      <div className="universe__hint">
        Drag to orbit, scroll to zoom, click to inspect.
      </div>
    </div>
  )
}
