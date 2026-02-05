import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col gap-4">
      <Card className="border-border/40 bg-card/80">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search word..."
            className="border-border/40 bg-background/60 text-foreground"
          />
          <div className="text-xs text-muted-foreground">
            Semantic jump across the universe.
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/80">
        <CardHeader>
          <CardTitle>Views</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="semantic">
            <TabsList className="grid w-full grid-cols-3 bg-background/40">
              <TabsTrigger value="semantic">Semantic</TabsTrigger>
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="grammar">Grammar</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/80">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Location</Badge>
          <Badge>People</Badge>
          <Badge>Emotion</Badge>
          <Badge>Nature</Badge>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/80">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" className="justify-start">
                Focus Selected
              </Button>
            </TooltipTrigger>
            <TooltipContent>Press F</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" className="justify-start">
                Reset Camera
              </Button>
            </TooltipTrigger>
            <TooltipContent>Press R</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <ScrollArea className="h-[140px] rounded-xl border border-border/40 bg-card/80">
        <div className="p-4 text-xs text-muted-foreground">
          Tip: Zoom in until planet labels appear, then toggle Category view to
          see semantic drift.
        </div>
      </ScrollArea>
    </aside>
  )
}
