import "./App.css"
import { useCallback, useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Topbar } from "./features/ui/Topbar"
import { Inspector } from "./features/ui/Inspector"
import { UniverseView } from "./features/universe/UniverseView"

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [stats, setStats] = useState<{ nodes: number; links: number }>({
    nodes: 0,
    links: 0,
  })

  const handleSelectNode = useCallback((id: string) => {
    setSelectedId(id)
    setIsInspectorOpen(true)
  }, [])

  const handleStatsChange = useCallback(
    (next: { nodes: number; links: number }) => {
      setStats(next)
    },
    [],
  )

  const handleBackgroundClick = useCallback(() => {
    setIsInspectorOpen(false)
  }, [])

  const handleCloseInspector = useCallback(() => {
    setIsInspectorOpen(false)
  }, [])

  return (
    <TooltipProvider>
      <div className="app-shell">
        <Topbar selectedId={selectedId} stats={stats} />
        <div className="app-body">
          <main className="app-main">
            <UniverseView
              onSelectNode={handleSelectNode}
              onStatsChange={handleStatsChange}
              onBackgroundClick={handleBackgroundClick}
            />
            {isInspectorOpen ? (
              <div className="inspector-float">
                <Inspector
                  selectedId={selectedId}
                  onClose={handleCloseInspector}
                />
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
