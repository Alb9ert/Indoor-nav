import { Button } from "#/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type { ReactNode } from "react"

interface PillButtonProps {
  icon: ReactNode
  label: string
  disabled?: boolean
  onClick: () => void
  /**
   * When true, renders the label inline next to the icon on mobile so
   * touch users get a readable button. Reverts to the icon-round shape on
   * `md+` (with the tooltip still attached). Use for primary actions like
   * Cancel / Confirm / Exit, where tooltip-only is poor on touch.
   */
  prominentLabel?: boolean
}

/**
 * Icon button rendered inside the ActionBar pill. Uses the shared `toolbar`
 * button variant so hover / pressed styling stays consistent with any other
 * toolbar-style buttons the app adds later.
 */
export const PillButton = ({
  icon,
  label,
  disabled,
  onClick,
  prominentLabel,
}: PillButtonProps) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <Button
          variant="toolbar"
          size="icon-round"
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            prominentLabel &&
              "h-10 w-auto gap-2 rounded-full px-4 text-sm font-semibold md:size-9 md:gap-0 md:px-0",
          )}
        >
          {icon}
          {prominentLabel && <span className="md:hidden">{label}</span>}
        </Button>
      }
    />
    <TooltipContent side="top">{label}</TooltipContent>
  </Tooltip>
)

export const PillDivider = () => (
  <div className="hidden h-6 w-px bg-slate-600/60 md:block" aria-hidden />
)
