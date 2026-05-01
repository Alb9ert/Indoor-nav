import { useMap } from "#/lib/map-context"

/**
 * Bullseye crosshair shown at viewport center while the user is picking a
 * start coordinate on the map. The accompanying Cancel / Confirm action bar
 * is owned by `<ActionBar />` (admin tools and pick-start share that shell).
 */
export const MapPickOverlay = () => {
  const { pickingStart } = useMap()

  if (!pickingStart) return null

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/40 ring-2 ring-primary">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
