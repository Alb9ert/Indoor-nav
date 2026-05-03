import { Navigation } from "lucide-react"

import { Button } from "#/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip"
import { useMap } from "#/lib/map-context"

export const RoutePlannerToggle = () => {
  const { activeTool, setActiveTool } = useMap()
  const panelOpen = activeTool === "route-plan"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="floating"
            size="icon-xl"
            type="button"
            aria-pressed={panelOpen}
            aria-label="Route planner"
            onClick={() => setActiveTool(panelOpen ? "default" : "route-plan")}
          >
            <Navigation className="size-5" />
          </Button>
        }
      />
      <TooltipContent side="left">Route planner</TooltipContent>
    </Tooltip>
  )
}
