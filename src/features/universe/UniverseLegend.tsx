import { cn } from "@/lib/utils"

type LegendProps = {
  viewMode: "semantic" | "category" | "grammar"
  activeFilters: Set<string>
  onToggleFilter: (id: string) => void
}

export function UniverseLegend({ viewMode, activeFilters, onToggleFilter }: LegendProps) {
  const renderItem = (id: string, label: string, sublabel: string, color: string, type: "dot" | "line") => {
    const isActive = activeFilters.has(id)
    return (
      <button 
        onClick={() => onToggleFilter(id)}
        className={cn(
          "universe-legend__item flex flex-col items-start transition-all hover:opacity-100",
          !isActive && "opacity-30 grayscale"
        )}
      >
        <div className="flex items-center gap-2">
          {type === "dot" ? (
            <div className="universe-legend__dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
          ) : (
            <div className="universe-legend__line" style={{ background: color, height: '3px', boxShadow: `0 0 5px ${color}` }} />
          )}
          <span className="text-[12px] font-bold text-slate-100">{label}</span>
        </div>
        <span className="text-[9px] text-slate-500 ml-5 uppercase tracking-tighter">{sublabel}</span>
      </button>
    )
  }

  return (
    <div className="universe-legend flex-row items-center gap-6 px-8">
      <div className="universe-legend__section flex items-center gap-4">
        <div className="universe-legend__title">Levels</div>
        {viewMode === "semantic" ? (
          <>
            {renderItem("l1", "Hubs", "Root", "#a855f7", "dot")}
            {renderItem("l2", "Groups", "Category", "#38bdf8", "dot")}
            {renderItem("l3", "Words", "Standard", "#f59e0b", "dot")}
          </>
        ) : (
          <>{renderItem("l1", "Galaxy", "Main Hub", "#a855f7", "dot")}{renderItem("l2", "Nebula", "Cluster", "#38bdf8", "dot")}</>
        )}
      </div>
      
      <div className="w-px h-8 bg-white/10" />
      
      <div className="universe-legend__section flex items-center gap-4 overflow-x-auto max-w-[65vw]">
        <div className="universe-legend__title">Relations</div>
        {viewMode === "semantic" ? (
          <>
            {renderItem("is_a", "Is a...", "PARENT", "#f472b6", "line")}
            {renderItem("has_kind", "Has types...", "CHILDREN", "#38bdf8", "line")}
            {renderItem("has_part", "Anatomy", "PARTS", "#f97316", "line")}
            {renderItem("action", "Actions", "VERBS", "#10b981", "line")}
            {renderItem("context", "Context", "PLACE", "#38bdf8", "line")}
            {renderItem("property", "Property", "ADJ", "#fbbf24", "line")}
            {renderItem("origin", "Origin", "SOURCE", "#a78bfa", "line")}
            {renderItem("synonym", "Synonym", "SAME", "#10b981", "line")}
          </>
        ) : (
          renderItem("hierarchy", "Parent-Child", "FOLDER", "#1e293b", "line")
        )}
      </div>
    </div>
  )
}