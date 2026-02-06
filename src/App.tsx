import "./App.css"
import { useCallback, useState, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Topbar } from "./features/ui/Topbar"
import { Inspector } from "./features/ui/Inspector"
import { UniverseView } from "./features/universe/UniverseView"
import type { UniverseGraphData } from "./types/universe"

function App() {
  const [masterData, setMasterData] = useState<UniverseGraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [stats, setStats] = useState<{ nodes: number; links: number }>({ nodes: 0, links: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/data/universe_v2.json?t=${Date.now()}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const raw = await response.json()
        setMasterData(raw)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load universe data")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const selectedNode = masterData?.nodes.find(n => n.id === selectedId) ?? null

  const handleSelectNode = useCallback((id: string) => {
    setSelectedId(id)
    setIsInspectorOpen(true)
  }, [])

  const handleStatsChange = useCallback((next: { nodes: number; links: number }) => {
    setStats(next)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setIsInspectorOpen(false)
    setSelectedId(null)
  }, [])

  const handleCloseInspector = useCallback(() => {
    setIsInspectorOpen(false)
    setSelectedId(null)
  }, [])

  return (
    <TooltipProvider>
      <div className="app-shell">
        <Topbar selectedId={selectedId} stats={stats} version={masterData?.version} />
        <div className="app-body">
          <main className="app-main">
            {loading && (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Loading universe data...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-red-950/80 border border-red-800 rounded-lg p-6 text-center max-w-sm">
                  <div className="text-red-400 font-semibold mb-2">Failed to load data</div>
                  <div className="text-red-300/70 text-sm">{error}</div>
                </div>
              </div>
            )}
            {masterData && !loading && !error && (
              <>
                <UniverseView
                  masterData={masterData}
                  onSelectNode={handleSelectNode}
                  onStatsChange={handleStatsChange}
                  onBackgroundClick={handleBackgroundClick}
                  selectedId={selectedId}
                />
                {isInspectorOpen && (
                  <div className="inspector-float">
                    <Inspector
                      node={selectedNode}
                      schema={masterData.schema}
                      onClose={handleCloseInspector}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
