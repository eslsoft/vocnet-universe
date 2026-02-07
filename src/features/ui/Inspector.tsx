import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CelestialNode } from "@/types/universe"
import { Separator } from "@/components/ui/separator"

type InspectorProps = {
  node: CelestialNode | null
  onClose: () => void
}

export function Inspector({ node, onClose }: InspectorProps) {
  if (!node) return null

  return (
    <aside className="flex flex-col gap-4 w-80">
      <Card className="bg-slate-950/90 border-slate-800 text-slate-100 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold tracking-tight">
            {node.word}
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 hover:bg-slate-800 text-slate-400"
          >
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-slate-900 border-slate-700 text-slate-300"
            >
              {node.celestialType}
            </Badge>
            <Badge
              className="font-mono font-bold"
              style={{
                backgroundColor: `${node.color}22`,
                color: node.color,
                borderColor: `${node.color}44`,
              }}
            >
              {node.spectralClass}-class
            </Badge>
            <Badge className="bg-purple-900/40 text-purple-300 border-purple-800/50">
              {node.pos}
            </Badge>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  First Recorded
                </span>
                <div className="text-slate-300">{node.firstRecordedYear}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  Frequency
                </span>
                <div className="text-slate-300">
                  {node.frequency.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">
                Definition
              </div>
              <div className="text-slate-300 leading-relaxed italic">
                "{node.definition}"
              </div>
            </div>

            {node.relations.length > 0 && (
              <div className="pt-2">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-2">
                  Semantic Relations ({node.relations.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.relations.map((rel, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400"
                    >
                      {rel.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-slate-800" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Mass
              </div>
              <div className="mt-1 text-sm font-mono text-slate-300">
                {node.mass.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Radius
              </div>
              <div className="mt-1 text-sm font-mono text-slate-300">
                {node.radius.toFixed(1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
