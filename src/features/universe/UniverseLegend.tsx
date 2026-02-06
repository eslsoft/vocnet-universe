import { cn } from "@/lib/utils"
import type { UniverseSchema } from "@/types/universe"

type LegendProps = {
  schema: UniverseSchema
  activeFilters: Set<string>
  onToggleFilter: (id: string) => void
}

export function UniverseLegend({ schema, activeFilters, onToggleFilter }: LegendProps) {
  const renderItem = (id: string, label: string, color: string, type: "dot" | "line") => {
    const isActive = activeFilters.has(id)
    return (
      <button
        key={id}
        onClick={() => onToggleFilter(id)}
        className={cn(
          "universe-legend__item flex items-center gap-2 transition-all hover:opacity-100",
          !isActive && "opacity-30 grayscale"
        )}
      >
        {type === "dot" ? (
          <div className="universe-legend__dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        ) : (
          <div className="universe-legend__line" style={{ background: color, height: '3px', boxShadow: `0 0 5px ${color}` }} />
        )}
        <span className="text-[12px] font-bold text-slate-100">{label}</span>
      </button>
    )
  }

  return (
    <div className="universe-legend flex-row items-center gap-6 px-8">
      <div className="universe-legend__section flex items-center gap-4">
        <div className="universe-legend__title">Levels</div>
        {Object.entries(schema.levels).map(([level, def]) =>
          renderItem(`l${level}`, def.name, def.color, "dot")
        )}
      </div>

      <div className="w-px h-8 bg-white/10" />

      <div className="universe-legend__section flex items-center gap-4 overflow-x-auto max-w-[65vw]">
        <div className="universe-legend__title">Relations</div>
        {Object.entries(schema.linkTypes).map(([type, def]) =>
          renderItem(type, def.label, def.color, "line")
        )}
      </div>
    </div>
  )
}
