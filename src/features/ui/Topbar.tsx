import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type TopbarProps = {
  selectedId: string | null
  stats: { nodes: number; links: number }
  version?: string
}

export function Topbar({ selectedId, stats, version }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-border/40 bg-background/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-900/40" />
        <div>
          <div className="text-lg font-semibold text-foreground">Vocab Verse</div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Immersive Vocabulary Universe
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2">
        {version && <Badge variant="secondary">{version}</Badge>}
        <Badge variant="secondary">{stats.nodes} nodes</Badge>
        <Badge variant="secondary">{stats.links} links</Badge>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Selected
          </div>
          <div className="text-sm font-semibold text-foreground">
            {selectedId ?? "None"}
          </div>
        </div>
        <Separator className="hidden h-10 w-px md:block" />
      </div>
    </header>
  )
}
