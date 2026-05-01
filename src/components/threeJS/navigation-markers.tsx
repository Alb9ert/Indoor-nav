import { useMemo } from "react"

import { useNavigation } from "#/lib/navigation-context"
import { floorToY, mapPointToThree, polygonCentroid } from "#/lib/three-utils"

import { MARKER_LIFT } from "./constants"
import { RingMarker } from "./draw-primitives"

import type { NavigationRequest } from "#/lib/navigation-context"

const START_COLOR = "#3b82f6"
const DESTINATION_COLOR = "#f97316"

/**
 * Convert any value carried by NavigationRequest into a three.js position
 * tuple ready to drop into a marker mesh.
 *
 * - **Room**: centroid of the polygon vertices (already in `(x, z)` floor
 *   axes), lifted to the room's floor.
 * - **Node** / **map-picked point**: standard map → three conversion
 *   (`-y` → three.z), lifted to the floor.
 */
const navigationValueToThreePosition = (
  value: NavigationRequest["start"],
): [number, number, number] => {
  if ("roomNumber" in value) {
    const c = polygonCentroid(value.vertices)
    return [c.x, floorToY(value.floor, MARKER_LIFT), c.z]
  }
  return mapPointToThree(value, MARKER_LIFT)
}

/**
 * Always-on visual cues for the active navigation request.
 *
 * - Start: blue ring at the picked coordinate / chosen room centroid.
 * - Destination: orange ring at the destination room centroid.
 *
 * Rendered above the floor texture and with depth testing disabled
 * (see `RingMarker`) so the markers stay visible on top of polygons.
 */
export const NavigationMarkers = () => {
  const { start, destination } = useNavigation()

  const startPosition = useMemo(
    () => (start ? navigationValueToThreePosition(start) : null),
    [start],
  )
  const destinationPosition = useMemo(
    () => (destination ? navigationValueToThreePosition(destination) : null),
    [destination],
  )

  return (
    <>
      {startPosition && <RingMarker position={startPosition} color={START_COLOR} />}
      {destinationPosition && (
        <RingMarker position={destinationPosition} color={DESTINATION_COLOR} />
      )}
    </>
  )
}
