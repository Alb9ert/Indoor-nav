import { useRef, useState } from "react"

import { useIsMobile } from "#/components/hooks/use-is-mobile"
import { cn } from "#/lib/utils"

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react"

const COLLAPSED_VH = 45
const EXPANDED_VH = 92
const SNAP_MIDPOINT_VH = (COLLAPSED_VH + EXPANDED_VH) / 2

interface PanelProps {
  /** Whether the panel is visible. Animates in/out. */
  open: boolean
  /** Panel content. Should be a flex column with a `flex-1 min-h-0 overflow-y-auto` body so headers/footers stay pinned while the middle scrolls. */
  children: ReactNode
  /** Extra classes applied to the outer container. */
  className?: string
}

/**
 * Shared overlay panel used across the map UI.
 *
 * - **Desktop (≥ md):** anchored to the right edge, full viewport height,
 *   slides in from the right.
 * - **Mobile (< md):** bottom sheet with a drag handle. Defaults to ~45vh,
 *   drag the handle up toward ~92vh.
 *
 * The container is `overflow-hidden` and `flex-col`, so the consumer's body
 * region can claim `flex-1 min-h-0 overflow-y-auto` and have headers/footers
 * pinned without escaping the panel.
 */
export const Panel = ({ open, children, className }: PanelProps) => {
  const isMobile = useIsMobile()
  const [heightVh, setHeightVh] = useState(COLLAPSED_VH)
  const [dragging, setDragging] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)

  // Reset to collapsed each time the sheet re-opens, so it doesn't reappear
  // at whatever height the user last left it. Derived-state pattern (rather
  // than an effect) keeps the reset in sync with the same render.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setHeightVh(COLLAPSED_VH)
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startHeight: heightVh }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = e.clientY - drag.startY
    const dvh = drag.startHeight - (dy / globalThis.innerHeight) * 100
    setHeightVh(Math.max(20, Math.min(95, dvh)))
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
    setHeightVh((h) => (h > SNAP_MIDPOINT_VH ? EXPANDED_VH : COLLAPSED_VH))
  }

  return (
    <aside
      aria-hidden={!open}
      style={isMobile ? { height: `${heightVh}dvh` } : undefined}
      className={cn(
        "fixed z-30 flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        !dragging && "transition-[transform,height]",
        // mobile: bottom sheet
        "inset-x-0 bottom-0 rounded-t-2xl border-t border-border",
        // desktop: right-anchored full-height
        "md:inset-x-auto md:bottom-auto md:top-0 md:right-0 md:h-full md:w-88 md:rounded-t-none md:border-t-0 md:border-l",
        open
          ? "translate-y-0 md:translate-x-0"
          : "pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full",
        className,
      )}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2 active:cursor-grabbing md:hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
      </div>
      {children}
    </aside>
  )
}
