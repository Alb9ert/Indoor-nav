import { useIsLoggedIn } from "#/lib/auth-hooks"
import { useMap } from "#/lib/map-context"
import { TOOL_REGISTRY } from "#/lib/tool-registry"
import { cn } from "@/lib/utils"

import { ToolButton } from "./tool-button"

import type { ToolId } from "#/lib/tool-registry"

interface ToolPaletteProps {
  className?: string
}

const ADMIN_TOOLS: ToolId[] = ["draw-room", "edit-room", "draw-node", "connect-edge"]
const USER_TOOLS: ToolId[] = ["default", "route-plan"]

export const ToolPalette = ({ className }: ToolPaletteProps) => {
  const { activeTool, setActiveTool } = useMap()
  const { isLoggedIn } = useIsLoggedIn()

  const visibleToolIds: ToolId[] = isLoggedIn ? [...USER_TOOLS, ...ADMIN_TOOLS] : USER_TOOLS
  const visibleTools = TOOL_REGISTRY.filter((t) => visibleToolIds.includes(t.id))

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="toolbar"
      aria-label="Map editing tools"
    >
      {visibleTools.map((tool) => {
        const Icon = tool.icon
        const isActive = activeTool === tool.id
        const displayLabel = isActive && tool.id === "default" ? tool.activeLabel : tool.label
        return (
          <ToolButton
            key={tool.id}
            icon={<Icon className="size-6 text-white" />}
            label={displayLabel}
            active={isActive}
            isDefault={tool.id === "default"}
            onClick={() => {
              setActiveTool(isActive ? "default" : tool.id)
            }}
          />
        )
      })}
    </div>
  )
}
