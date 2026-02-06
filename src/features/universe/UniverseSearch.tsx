import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UniverseNode } from "./mock"

type UniverseSearchProps = {
  nodes: UniverseNode[]
  onSelect: (node: UniverseNode) => void
}

export function UniverseSearch({ nodes, onSelect }: UniverseSearchProps) {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0, 8)
  }, [nodes, query])

  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      <div className="universe-overlay__search">
        <Search className="text-slate-400 mt-2 ml-1" size={18} />
        <Input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search word..." 
          className="universe-search__input" 
        />
        {query && (
          <Button size="icon" variant="ghost" className="mt-1" onClick={() => setQuery("")}>
            <X size={16} />
          </Button>
        )}
      </div>
      {results.length > 0 && (
        <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-1 flex flex-col gap-1 w-full shadow-2xl">
          {results.map(n => (
            <button 
              key={n.id} 
              onClick={() => { onSelect(n); setQuery("") }} 
              className="text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/10 rounded transition-colors flex justify-between"
            >
              <span>{n.label}</span>
              <span className="text-[10px] text-slate-500 uppercase mt-1">L{n.level}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
