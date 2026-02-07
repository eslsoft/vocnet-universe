import "./App.css"
import { useCallback, useState, useMemo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Topbar, type MultiverseType } from "./features/ui/Topbar"
import { UniverseView } from "./features/universe/UniverseView"
import { UniverseMapper } from "./features/universe/universeMapper"
import { Inspector } from "./features/ui/Inspector"
import { CLEAN_MOCK_DATA } from "./features/universe/mockDataCleanV4"
import { LARGE_MOCK_DATA } from "./features/universe/mockDataLargeV4"

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [datasetMode, setDatasetMode] = useState<MultiverseType>("clean")

  // Map data based on selected mode
  const { nodes, links } = useMemo(() => {
    const data = datasetMode === "clean" ? CLEAN_MOCK_DATA : LARGE_MOCK_DATA
    const mapper = new UniverseMapper()
    return mapper.mapDataset(data.words)
  }, [datasetMode])

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null

  const handleSelectNode = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleMultiverseChange = useCallback((value: MultiverseType) => {
    setSelectedId(null)
    setDatasetMode(value)
  }, [])

  const stats = { nodes: nodes.length, links: links.length }

  return (
    <TooltipProvider>
      <div className="app-shell">
        <Topbar
          selectedId={selectedId}
          stats={stats}
          multiverse={datasetMode}
          onMultiverseChange={handleMultiverseChange}
        />

        <div className="app-body">
          <main className="app-main">
            <UniverseView
              key={datasetMode}
              nodes={nodes}
              links={links}
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
