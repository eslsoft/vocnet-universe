import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type InspectorProps = {
  selectedId: string | null
  onClose: () => void
}

export function Inspector({ selectedId, onClose }: InspectorProps) {
  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle>Inspector</CardTitle>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Selection
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">
              {selectedId ?? "None"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              AI Summary
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Waiting for selection…
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Mastery
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">Not started</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
