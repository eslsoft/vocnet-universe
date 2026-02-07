import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Orbit } from "lucide-react"
import type { UniverseConfig } from "@/types/universe"

type TopbarProps = {
  selectedId: string | null
  stats: { nodes: number; links: number }
  multiverse: string
  universes: UniverseConfig[]
  onMultiverseChange: (value: string) => void
}

export function Topbar({
  stats,
  multiverse,
  universes,
  onMultiverseChange,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-border/40 bg-background/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-900/40">
          <Orbit className="h-6 w-6 text-white" />
        </span>
        <div>
          <div className="text-lg font-semibold text-foreground">Vocab Verse</div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Immersive Vocabulary Universe
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-900/50 border-slate-800 text-slate-400">
            {stats.nodes} nodes
          </Badge>
          <Badge variant="outline" className="bg-slate-900/50 border-slate-800 text-slate-400">
            {stats.links} links
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Multiverse
          </div>
          <Select
            value={multiverse}
            onValueChange={onMultiverseChange}
          >
            <SelectTrigger className="w-[140px] h-8 bg-slate-950/50 border-slate-800 text-xs">
              <SelectValue placeholder="Select Universe" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800">
              {universes.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}