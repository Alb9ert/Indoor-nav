import { Navigation } from "lucide-react"

import { Button } from "#/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip"
import { setPanelOpen, useRoutePlanner } from "#/lib/route-planner-store"

export const RoutePlannerToggle = () => {
  const { panelOpen } = useRoutePlanner()

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
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <Navigation className="size-5" />
          </Button>
        }
      />
      <TooltipContent side="left">Route planner</TooltipContent>
    </Tooltip>
  )
}
