import { X } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

import { useIsMobile } from "#/components/hooks/use-is-mobile"
import { Button } from "#/components/ui/button"
import { cn } from "#/lib/utils"

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react"

const MAX_HEIGHT_DVH = 92

interface PanelProps {
  /** Whether the panel is visible. Animates in/out. */
  open: boolean
  /** Sticky header. Always visible while the panel is open. */
  header?: ReactNode
  /** Sticky footer. Always visible while the panel is open. */
  footer?: ReactNode
  /** Scrollable body content. */
  children: ReactNode
  /** Called when the user clicks the built-in close button. Omit to hide it. */
  onClose?: () => void
  /**
   * When true, the panel always fills the entire viewport height — no drag
   * handle, no collapsed/expanded snaps. The body scrolls if it overflows.
   * Use for panels (like navigation) where partial height adds friction
   * rather than discoverability.
   */
  fullHeight?: boolean
}

/**
 * Shared overlay panel used across the map UI.
 *
 * Layout (header + body + footer always rendered in that order):
 * - **Desktop (≥ md):** anchored to the right edge, full viewport height.
 *   Header pinned top, footer pinned bottom, body scrolls if it overflows.
 * - **Mobile (< md):** bottom sheet. Collapsed by default to just header +
 *   footer (body hidden). Drag the handle up to grow toward the natural
 *   content height; if content exceeds 92dvh the sheet caps there and the
 *   body scrolls.
 *
 * Snap points: collapsed (header + footer only) and expanded (full content,
 * up to the viewport cap). Releasing the drag picks the nearest.
 */
export const Panel = ({
  open,
  header,
  footer,
  children,
  onClose,
  fullHeight = false,
}: PanelProps) => {
  const isMobile = useIsMobile()
  const handleRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const [chromePx, setChromePx] = useState(0)
  const [contentPx, setContentPx] = useState(0)
  const [heightPx, setHeightPx] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const handleH = handleRef.current?.offsetHeight ?? 0
      const headerH = headerRef.current?.offsetHeight ?? 0
      const footerH = footerRef.current?.offsetHeight ?? 0
      const contentH = bodyRef.current?.scrollHeight ?? 0
      setChromePx(handleH + headerH + footerH)
      setContentPx(contentH)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (handleRef.current) ro.observe(handleRef.current)
    if (headerRef.current) ro.observe(headerRef.current)
    if (footerRef.current) ro.observe(footerRef.current)
    if (bodyRef.current) ro.observe(bodyRef.current)
    return () => {
      ro.disconnect()
    }
  }, [header, footer, children])

  const maxPx =
    typeof globalThis.innerHeight === "number" ? (globalThis.innerHeight * MAX_HEIGHT_DVH) / 100 : 0
  const collapsedPx = chromePx
  const expandedPx = Math.min(chromePx + contentPx, maxPx)
  const snapMidPx = (collapsedPx + expandedPx) / 2

  // Reset to collapsed each time the sheet re-opens (derived-state pattern).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setHeightPx(null)
  }

  const currentHeight = heightPx ?? collapsedPx
  const useDragSheet = isMobile && !fullHeight

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startHeight: currentHeight }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = e.clientY - drag.startY
    setHeightPx(Math.max(collapsedPx, Math.min(drag.startHeight - dy, expandedPx)))
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
    setHeightPx(currentHeight > snapMidPx ? expandedPx : collapsedPx)
  }

  return (
    <aside
      aria-hidden={!open}
      style={useDragSheet ? { height: `${currentHeight}px` } : undefined}
      className={cn(
        "fixed z-30 flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        !dragging && "transition-[transform,height]",
        // mobile shape — drag-sheet anchors to the bottom; full-height covers the viewport
        useDragSheet ? "inset-x-0 bottom-0 rounded-t-2xl border-t border-border" : "inset-0",
        // desktop: right-anchored full-height (overrides the mobile shape)
        "md:inset-x-auto md:bottom-auto md:top-0 md:right-0 md:h-full md:w-88 md:rounded-none md:border-l",
        open
          ? "translate-y-0 md:translate-x-0"
          : "pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full",
      )}
    >
      {useDragSheet && (
        <div
          ref={handleRef}
          className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2 active:cursor-grabbing md:hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
      )}
      <div ref={headerRef} className="relative shrink-0">
        {header}
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 text-popover-foreground hover:bg-white/10 hover:text-popover-foreground"
          >
            <X />
          </Button>
        )}
      </div>
      <div
        ref={bodyRef}
        className={cn(
          "min-h-0 flex-1",
          // Only enable scroll when the visible body area is actually shorter
          // than its content. Otherwise touch jitter can scroll a panel that
          // already fits perfectly.
          useDragSheet && currentHeight - chromePx >= contentPx
            ? "overflow-hidden"
            : "overflow-y-auto",
        )}
      >
        {children}
      </div>
      <div ref={footerRef} className="shrink-0">
        {footer}
      </div>
    </aside>
  )
}
