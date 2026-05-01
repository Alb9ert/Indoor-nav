import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect } from "react"

import { useIsMobile } from "#/components/hooks/use-is-mobile"
import { ActionBar } from "#/components/map/action-bar/action-bar"
import { FuzzySearchBar } from "#/components/map/search/fuzzy-search-bar"
import { ToolPalette } from "#/components/map/tool-palette/tool-palette"
import { Compass } from "#/components/map/user-tools/compass"
import { DebugToggle } from "#/components/map/user-tools/debug-toggle"
import { FloorSelector } from "#/components/map/user-tools/floor-selector"
import { RenderModeToggle } from "#/components/map/user-tools/render-mode-toggle"
import { RoomOverlayToggle } from "#/components/map/user-tools/room-overlay-toggle"
import { EdgePanel } from "#/components/panels/edge/edge-panel"
import { MapPickOverlay } from "#/components/panels/navigation/map-pick-overlay"
import { NavigationPanel } from "#/components/panels/navigation/navigation-panel"
import { NodePanels } from "#/components/panels/node/node-panels"
import { RoomInfoPanel } from "#/components/panels/room/room-info-panel"
import { RoomPanels } from "#/components/panels/room/room-panels"
import { MapScene } from "#/components/threeJS/map-scene"
import { buttonVariants } from "#/components/ui/button"
import { TooltipProvider } from "#/components/ui/tooltip"
import { useIsLoggedIn } from "#/lib/auth-hooks"
import { MapProvider, useMap } from "#/lib/map-context"
import { NavigationProvider, useNavigation } from "#/lib/navigation-context"

/**
 * Layout structure (z-stack from bottom to top):
 *
 * 1. `<MapScene>` — the 3D canvas, fills `<main>` exactly. Static base layer.
 * 2. Overlay layer (z-10) — `pointer-events-none` so the canvas receives drags
 *    in the gaps; each interactive child opts in with `pointer-events-auto`.
 * 3. Panels (z-30, inside `<Panel>`) — own their own `position: fixed`,
 *    responsive shape (right side on desktop, bottom sheet on mobile).
 *
 * Admin UI (Manage / ToolPalette / ActionBar / draw+edit panels) is normally
 * desktop-only, but logged-in admins can toggle Debug on mobile to unlock it
 * for testing.
 */
const Layout = () => {
  const { isLoggedIn, isPending } = useIsLoggedIn()
  const { debugMode, pickingStart, activeTool, setActiveTool } = useMap()
  const { navigationPanelOpen, setNavigationPanelOpen } = useNavigation()
  const isMobile = useIsMobile()
  const isAdmin = !isPending && isLoggedIn
  const showAdminUI = isAdmin && (!isMobile || debugMode)

  // Mutual exclusion: opening the navigation panel exits any admin tool, and
  // activating a tool closes the navigation panel. Two effects with no-op
  // guards converge to a stable state without racing.
  useEffect(() => {
    if (navigationPanelOpen && activeTool !== "default") setActiveTool("default")
  }, [navigationPanelOpen, activeTool, setActiveTool])
  useEffect(() => {
    if (activeTool !== "default" && navigationPanelOpen) setNavigationPanelOpen(false)
  }, [activeTool, navigationPanelOpen, setNavigationPanelOpen])

  // The bottom action bar is on screen on mobile when picking or when an
  // admin tool is active. The right-anchored floating controls shift up
  // to clear it. Desktop pill is short enough that no shift is needed.
  const actionBarVisible = pickingStart || activeTool !== "default"

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <MapScene />

      <div className="pointer-events-none absolute inset-0 z-10">
        {!pickingStart && !navigationPanelOpen && (
          <FuzzySearchBar className="pointer-events-auto absolute top-4 right-4 left-4 w-auto sm:right-auto sm:left-30 sm:w-90" />
        )}

        <div
          className={`pointer-events-auto absolute flex flex-col gap-2 ${
            actionBarVisible ? "right-6 bottom-28" : "right-6 bottom-6"
          } ${
            // Desktop: shift left of the right-anchored navigation panel
            // (md:w-88 = 22rem) so controls stay visible while it's open.
            navigationPanelOpen && !pickingStart
              ? "md:right-96 md:bottom-6"
              : "md:right-6 md:bottom-6"
          }`}
        >
          {isAdmin && <DebugToggle />}
          <RoomOverlayToggle />
          {!pickingStart && <RenderModeToggle />}
          <Compass />
          <FloorSelector />
        </div>

        {showAdminUI && (
          <>
            <Link
              to="/manage-floor"
              className={`${buttonVariants({ variant: "default" })} pointer-events-auto absolute top-6 right-30`}
            >
              Manage
            </Link>
            <ToolPalette className="pointer-events-auto absolute top-1/2 left-6 -translate-y-1/2" />
          </>
        )}
        <ActionBar />
      </div>

      {showAdminUI && (
        <>
          <RoomPanels />
          <NodePanels />
          <EdgePanel />
        </>
      )}
      {!pickingStart && <RoomInfoPanel />}
      <NavigationPanel />
      <MapPickOverlay />
    </main>
  )
}

const App = () => (
  <TooltipProvider>
    <NavigationProvider>
      <MapProvider>
        <Layout />
      </MapProvider>
    </NavigationProvider>
  </TooltipProvider>
)

export const Route = createFileRoute("/")({ component: App })
