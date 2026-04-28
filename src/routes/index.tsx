import { createFileRoute, Link } from "@tanstack/react-router"

import { useIsMobile } from "#/components/hooks/use-is-mobile"
import { ActionBar } from "#/components/map/action-bar/action-bar"
import { FuzzySearchBar } from "#/components/map/search/fuzzy-search-bar"
import { ToolPalette } from "#/components/map/tool-palette/tool-palette"
import { Compass } from "#/components/map/user-tools/compass"
import { DebugToggle } from "#/components/map/user-tools/debug-toggle"
import { FloorSelector } from "#/components/map/user-tools/floor-selector"
import { RenderModeToggle } from "#/components/map/user-tools/render-mode-toggle"
import { RoomOverlayToggle } from "#/components/map/user-tools/room-overlay-toggle"
import { EdgeMetadataPanel } from "#/components/panels/edge-metadata-panel"
import { NodeMetadataPanel } from "#/components/panels/node-metadata-panel"
import { RoomInfoPanel } from "#/components/panels/room-info-panel"
import { RoomMetadataPanel } from "#/components/panels/room-metadata-panel"
import { MapScene } from "#/components/threeJS/map-scene"
import { buttonVariants } from "#/components/ui/button"
import { TooltipProvider } from "#/components/ui/tooltip"
import { useIsLoggedIn } from "#/lib/auth-hooks"
import { MapProvider } from "#/lib/map-context"

/**
 * Layout structure (z-stack from bottom to top):
 *
 * 1. `<MapScene>` — the 3D canvas, fills `<main>` exactly. Static base layer.
 * 2. Overlay layer (z-10) — `pointer-events-none` so the canvas receives drags
 *    in the gaps; each interactive child opts in with `pointer-events-auto`.
 * 3. Panels (z-30, inside `<Panel>`) — own their own `position: fixed`,
 *    responsive shape (right side on desktop, bottom sheet on mobile).
 *
 * `<main>` uses `h-dvh` so the bottom of the viewport tracks the dynamic
 * viewport (mobile URL bar collapse), and `relative` so all overlay children
 * anchor to it.
 *
 * Admin-only UI (Manage link, ToolPalette, ActionBar, edit/draw panels) is
 * desktop-only — there's no editing flow on mobile.
 */
const App = () => {
  const { isLoggedIn, isPending } = useIsLoggedIn()
  const isMobile = useIsMobile()
  const showAdminUI = !isPending && isLoggedIn && !isMobile

  return (
    <TooltipProvider>
      <MapProvider>
        <main className="relative h-dvh w-full overflow-hidden bg-background">
          <MapScene />

          <div className="pointer-events-none absolute inset-0 z-10">
            <FuzzySearchBar className="pointer-events-auto absolute top-4 right-4 left-4 w-auto sm:right-auto sm:left-30 sm:w-90" />

            <div className="pointer-events-auto absolute right-6 bottom-6 flex flex-col gap-2">
              {showAdminUI && <DebugToggle />}
              <RoomOverlayToggle />
              <RenderModeToggle />
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
                <ActionBar className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2" />
              </>
            )}
          </div>

          {showAdminUI && (
            <>
              <RoomMetadataPanel />
              <NodeMetadataPanel />
              <EdgeMetadataPanel />
            </>
          )}
          <RoomInfoPanel />
        </main>
      </MapProvider>
    </TooltipProvider>
  )
}

export const Route = createFileRoute("/")({ component: App })
