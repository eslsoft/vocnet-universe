import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ViewSwitcherProps = {
  value: string
  onChange: (value: "semantic" | "category" | "grammar") => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="pointer-events-auto">
      <Tabs value={value} onValueChange={(v) => onChange(v as any)}>
        <TabsList className="universe-tabs">
          <TabsTrigger value="semantic">Semantic</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
