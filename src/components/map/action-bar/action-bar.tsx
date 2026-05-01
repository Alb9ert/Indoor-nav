import { Check, Crosshair, LogOut, X } from "lucide-react"

import { mapFromWorld } from "#/lib/coordinates"
import { useMap } from "#/lib/map-context"
import { useNavigation } from "#/lib/navigation-context"
import { getToolMeta } from "#/lib/tool-registry"
import { cn } from "@/lib/utils"

import { DrawNodeActions } from "./draw-node-actions"
import { DrawRoomActions } from "./draw-room-actions"
import { PillButton, PillDivider } from "./pill-button"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface ActionBarProps {
  /** Extra classes for the outer wrapper (positioning is owned by the shell). */
  className?: string
}

interface ToastProps {
  variant?: "error" | "info"
  children: ReactNode
}

const Toast = ({ variant = "info", children }: ToastProps) => (
  <div
    role={variant === "error" ? "alert" : "status"}
    className={cn(
      "pointer-events-none rounded-full border px-4 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-sm",
      variant === "error"
        ? "border-red-500/50 bg-red-600/95 text-white"
        : "border-border/60 bg-popover text-popover-foreground",
    )}
  >
    {children}
  </div>
)

interface ActionBarShellProps {
  ariaLabel: string
  /**
   * Leading content inside the bar. Pass a small icon+label for tool modes,
   * or breakpoint-responsive content for modes that want different copy at
   * different sizes (e.g. an inline hint on mobile).
   */
  modeContent: ReactNode
  /** Optional toast that floats above the bar (tool validation errors). */
  toast?: ReactNode
  toastVariant?: "error" | "info"
  className?: string
  children: ReactNode
}

/**
 * The shared chrome behind every ActionBar variant. Renders full-width along
 * the bottom edge on mobile (matches the navigation pick-start design), and
 * collapses to a centered pill at `md+`.
 */
const ActionBarShell = ({
  ariaLabel,
  modeContent,
  toast,
  toastVariant = "info",
  className,
  children,
}: ActionBarShellProps) => (
  <div
    className={cn(
      "pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2",
      "md:absolute md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2",
      className,
    )}
  >
    {toast && <Toast variant={toastVariant}>{toast}</Toast>}
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(
        // Mobile: full-width bottom bar, popover-styled, stacked content.
        "flex w-full flex-col gap-3 border-t border-border bg-popover p-4 text-popover-foreground shadow-2xl",
        // Desktop: collapse to a centered primary-colored pill.
        "md:w-auto md:flex-row md:items-center md:gap-1 md:rounded-full md:border md:border-slate-700/50 md:bg-primary md:p-0 md:px-3 md:py-2 md:text-white md:shadow-xl md:backdrop-blur-sm",
      )}
    >
      {modeContent}
      <div className="flex flex-row items-center justify-end gap-2 md:contents">{children}</div>
    </div>
  </div>
)

const ModeLabel = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <span className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold md:pr-1">
    <Icon className="size-4" />
    {label}
  </span>
)

/**
 * Contextual action bar shown at the bottom while a tool is active or while
 * the navigation flow is in pick-start mode.
 *
 * - Admin tool mode: mode icon + label, tool-specific actions (e.g. undo /
 *   discard / snap-to-grid), and an "Exit mode" button.
 * - Pick-start mode: a hint toast above, mode icon + label, and Cancel /
 *   Confirm location actions. Reads `OrbitControls.target` on confirm and
 *   writes a `MapPickedPoint` to the navigation context.
 *
 * Validation errors (draw-room only) float above the bar as a red toast.
 */
export const ActionBar = ({ className }: ActionBarProps) => {
  const {
    activeTool,
    drawing,
    setActiveTool,
    pickingStart,
    setPickingStart,
    controlsRef,
    currentFloor,
  } = useMap()
  const { setStart } = useNavigation()

  if (pickingStart) {
    const handleConfirm = () => {
      const target = controlsRef.current?.target
      if (!target || currentFloor === null) return
      // OrbitControls.target is in three.js space; the navigation context
      // stores picks in map coordinates so they share a shape with Node.
      const map = mapFromWorld(target)
      setStart({ x: map.x, y: map.y, floor: currentFloor })
      setPickingStart(false)
    }

    const handleCancel = () => {
      setPickingStart(false)
    }

    return (
      <ActionBarShell
        ariaLabel="Pick start location"
        className={className}
        modeContent={
          <>
            {/* Mobile: actionable hint sits inside the bar (no toast floating
                above the floating controls). Desktop: compact mode label. */}
            <p className="text-sm md:hidden">
              Drag the map to position the bullseye, then confirm.
            </p>
            <span className="hidden md:inline-flex md:items-center md:gap-2 md:pr-1 md:text-xs md:font-semibold md:whitespace-nowrap">
              <Crosshair className="size-4" />
              Picking start location
            </span>
          </>
        }
      >
        <PillButton
          icon={<X className="size-4" />}
          label="Cancel"
          onClick={handleCancel}
          prominentLabel
        />
        <PillDivider />
        <PillButton
          icon={<Check className="size-4" />}
          label="Confirm location"
          onClick={handleConfirm}
          prominentLabel
        />
      </ActionBarShell>
    )
  }

  if (activeTool === "default") return null

  const { icon: Icon, activeLabel } = getToolMeta(activeTool)
  const validationError = activeTool === "draw-room" ? drawing.validationError : null
  const toolActions =
    activeTool === "draw-room" ? (
      <DrawRoomActions drawing={drawing} />
    ) : activeTool === "draw-node" ? (
      <DrawNodeActions />
    ) : null

  return (
    <ActionBarShell
      ariaLabel="Tool actions"
      modeContent={<ModeLabel icon={Icon} label={activeLabel} />}
      toast={validationError ?? undefined}
      toastVariant="error"
      className={className}
    >
      {toolActions && (
        <>
          {toolActions}
          <PillDivider />
        </>
      )}
      <PillButton
        icon={<LogOut className="size-4" />}
        label="Exit mode"
        onClick={() => {
          setActiveTool("default")
        }}
        prominentLabel
      />
    </ActionBarShell>
  )
}
