import "./App.css"
import { useCallback, useState, useMemo, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Topbar } from "./features/ui/Topbar"
import { UniverseView } from "./features/universe/UniverseView"
import { UniverseMapper } from "./features/universe/universeMapper"
import { Inspector } from "./features/ui/Inspector"
import type { UniverseData, UniverseConfig, CelestialNode, CelestialLink } from "@/types/universe"

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [universes, setUniverses] = useState<UniverseConfig[]>([])
  const [datasetMode, setDatasetMode] = useState<string>("")
  const [rawContent, setRawContent] = useState<UniverseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Load universe list
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    fetch("/universes.json", { signal: controller.signal })
      .then(res => res.json())
      .then((data: UniverseConfig[]) => {
        if (!active) return
        setUniverses(data)
        if (data.length > 0) setDatasetMode(data[0].id)
      })
      .catch(err => {
        if (err?.name !== "AbortError") {
          console.error("Failed to load universes:", err)
        }
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [])

  // 2. Load selected universe data
  useEffect(() => {
    const config = universes.find(u => u.id === datasetMode)
    if (!config) return

    setIsLoading(true)
    let active = true
    const controller = new AbortController()
    fetch(config.url, { signal: controller.signal })
      .then(res => res.json())
      .then((data: UniverseData) => {
        if (!active) return
        setRawContent(data)
        setIsLoading(false)
      })
      .catch(err => {
        if (err?.name !== "AbortError") {
          console.error("Failed to load universe data:", err)
        }
        setIsLoading(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [datasetMode, universes])

  // 3. Map data
  const { nodes, links } = useMemo(() => {
    if (!rawContent) return { nodes: [], links: [] }
    const mapper = new UniverseMapper()
    return mapper.mapDataset(rawContent.words)
  }, [rawContent])

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null

  const handleSelectNode = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleMultiverseChange = useCallback((value: string) => {
    setSelectedId(null)
    setDatasetMode(value)
  }, [])

  const stats = { nodes: nodes.length, links: links.length }

  if (isLoading && !rawContent) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-sm font-medium tracking-widest uppercase">Initializing Universe...</div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="app-shell">
        <Topbar
          selectedId={selectedId}
          stats={stats}
          multiverse={datasetMode}
          universes={universes}
          onMultiverseChange={handleMultiverseChange}
        />

        <div className="app-body">
          <main className="app-main">
            <UniverseView
              key={datasetMode}
              nodes={nodes as CelestialNode[]}
              links={links as CelestialLink[]}
              galaxies={rawContent?.galaxies}
              onSelectNode={handleSelectNode}
              onBackgroundClick={handleBackgroundClick}
              selectedId={selectedId}
            />

            {selectedNode && (
              <div className="inspector-float">
                <Inspector
                  node={selectedNode}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
