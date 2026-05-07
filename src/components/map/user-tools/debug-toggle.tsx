import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip"
import { useMap } from "#/lib/map-context"
import { cn } from "@/lib/utils"

interface DebugToggleProps {
  className?: string
}

export const DebugToggle = ({ className }: DebugToggleProps) => {
  const { debugMode, setDebugMode, isSelectingFloor } = useMap()

  if (isSelectingFloor) return null

  const tooltipLabel = debugMode ? "Hide debug overlay" : "Show debug overlay"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={tooltipLabel}
            className={cn(
              "w-14 h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center",
              "transition-all duration-200 shadow-xl border border-slate-700/50",
              "cursor-pointer bg-primary hover:bg-secondary",
              debugMode && "ring-2 ring-red-400",
              className,
            )}
            onClick={() => {
              setDebugMode(!debugMode)
            }}
          >
            <span className="text-white font-semibold text-xs text-center">
              {debugMode ? "Debug: ON" : "Debug: OFF"}
            </span>
          </button>
        }
      />
      <TooltipContent side="left">{tooltipLabel}</TooltipContent>
    </Tooltip>
  )
}
