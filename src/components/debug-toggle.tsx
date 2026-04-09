import { useMap } from "#/lib/map-context"
import { cn } from "@/lib/utils"

interface DebugToggleProps {
  className?: string
}

export const DebugToggle = ({ className }: DebugToggleProps) => {
  const { debugMode, setDebugMode } = useMap()

  return (
    <button
      className={cn(
        "w-14 h-14 rounded-2xl cursor-pointer bg-primary backdrop-blur-sm flex items-center justify-center",
        "transition-all duration-200 shadow-xl border border-slate-700/50",
        "hover:bg-secondary",
        debugMode && "ring-2 ring-red-400",
        className,
      )}
      onClick={() => {
        setDebugMode(!debugMode)
      }}
    >
      <span className="text-white font-semibold text-sm">
        {debugMode ? "Debug: ON" : "Debug: OFF"}
      </span>
    </button>
  )
}
