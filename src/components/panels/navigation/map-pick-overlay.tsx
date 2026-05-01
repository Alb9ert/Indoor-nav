import { Check, X } from "lucide-react"

import { Button } from "#/components/ui/button"
import { mapFromWorld } from "#/lib/coordinates"
import { useMap } from "#/lib/map-context"
import { useNavigation } from "#/lib/navigation-context"

/**
 * Overlay shown while the user is picking a start coordinate on the map.
 *
 * Two pieces:
 * - Centered bullseye crosshair that the user pans the map under.
 * - Bottom action bar containing the hint copy + Cancel / Confirm.
 *   On mobile this fills the bottom edge (replacing the navigation panel,
 *   which is hidden while picking). On desktop it's a centered pill.
 *
 * Confirm reads `OrbitControls.target` — the world point under viewport
 * center — and writes it to the navigation context as `{ x, y, z, floor }`.
 * Accurate in 2D top-down (the default). In 3D the target may not lie on
 * the floor plane but it's still the camera's focal point — coarse but
 * reasonable.
 */
export const MapPickOverlay = () => {
  const { pickingStart, setPickingStart, controlsRef, currentFloor } = useMap()
  const { setStart } = useNavigation()

  if (!pickingStart) return null

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
    <>
      {/* Bullseye at viewport center */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/40 ring-2 ring-primary">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Action bar — full-width bottom on mobile, centered pill on desktop */}
      <div
        className={
          "pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 " +
          "border-t border-border bg-popover p-4 text-popover-foreground shadow-2xl " +
          "md:inset-x-auto md:right-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2 " +
          "md:flex-row md:items-center md:rounded-full md:border md:px-4 md:py-2"
        }
      >
        <p className="text-sm md:max-w-xs md:text-center">
          Drag the map to position the bullseye, then confirm.
        </p>
        <div className="flex gap-2 md:ml-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 gap-2 md:flex-none"
          >
            <X className="size-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} className="flex-1 gap-2 md:flex-none">
            <Check className="size-4" />
            Confirm location
          </Button>
        </div>
      </div>
    </>
  )
}
