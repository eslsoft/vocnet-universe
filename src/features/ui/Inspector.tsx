import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UniverseNode, UniverseSchema, UniverseGroup } from "@/types/universe"
import { Separator } from "@/components/ui/separator"
import { resolveLevelName } from "@/features/universe/config"

type InspectorProps = {
  node: UniverseNode | null
  schema: UniverseSchema | undefined
  groups?: UniverseGroup[]
  onClose: () => void
}

export function Inspector({ node, schema, groups, onClose }: InspectorProps) {
  if (!node) return null

  const levelName = resolveLevelName(schema, node.level)
  const group = groups?.find(g => g.id === node.groupId)

  return (
    <aside className="flex flex-col gap-4 w-80">
      <Card className="bg-slate-950/90 border-slate-800 text-slate-100 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold tracking-tight">
            {node.label}
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 hover:bg-slate-800">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-300">
              {levelName}
            </Badge>
            {node.data?.pos && (
              <Badge className="bg-purple-900/40 text-purple-300 border-purple-800/50">
                {node.data.pos}
              </Badge>
            )}
            {group && (
              <Badge 
                style={{ 
                  backgroundColor: `${group.color}22`, 
                  color: group.color, 
                  borderColor: `${group.color}44` 
                }}
                className="border"
              >
                {group.label}
              </Badge>
            )}
          </div>

          <Separator className="bg-slate-800" />

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Description
            </div>
            <div className="mt-1 text-sm text-slate-300 leading-relaxed">
              {node.data?.definition || `A semantic node representing "${node.label}" in the ${levelName.toLowerCase()} layer.`}
            </div>
          </div>

          {node.data?.context && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Example
              </div>
              <div className="mt-1 text-sm text-slate-400 italic">
                "{node.data.context}"
              </div>
            </div>
          )}

          <Separator className="bg-slate-800" />

          {node.data?.associations && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                AI Semantic Network
              </div>
              <div className="flex flex-wrap gap-2">
                {node.data.associations.map((assoc: any, i: number) => (
                  <div key={i} className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1 gap-2">
                    <span className="text-xs font-bold text-slate-200">{assoc.target}</span>
                    <span className="text-[9px] uppercase text-slate-500">{assoc.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {node.data?.associations && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">
                AI Memory Hack (Beta)
              </div>
              <div className="text-sm text-amber-200/90 italic leading-snug">
                {`Visualize "${node.label}" as linked to "${node.data.associations[0]?.target}" (${node.data.associations[0]?.type}). In the context of ${node.data.associations.find((a: any) => a.type === 'context')?.target || 'its semantic field'}, it acts as a key component.`}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Magnitude
              </div>
              <div className="mt-1 text-sm font-mono text-slate-300">
                {node.val.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                ID
              </div>
              <div className="mt-1 text-sm font-mono text-slate-500 truncate">
                {node.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
