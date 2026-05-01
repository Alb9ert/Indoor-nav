import { Html } from "@react-three/drei"
import { useMemo } from "react"

import { useMap } from "#/lib/map-context"
import { useNavigation } from "#/lib/navigation-context"
import { floorToY, mapPointToThree, polygonCentroid } from "#/lib/three-utils"

import { MARKER_LIFT } from "./constants"
import { RingMarker } from "./draw-primitives"

import type { NavigationStart } from "#/types/navigation"
import type { Room } from "#/types/room"

const START_COLOR = "#3b82f6"
const DESTINATION_COLOR = "#f97316"
const LABEL_LIFT = MARKER_LIFT + 0.8

interface MarkerPlacement {
  position: [number, number, number]
  floor: number
}

/**
 * Convert a navigation value into a three.js position + the floor it lives
 * on (so the caller can decide whether to render it under the current view).
 *
 * - **Room**: centroid of the polygon vertices (already in `(x, z)` floor
 *   axes), lifted to the room's floor.
 * - **Node** / **map-picked point**: standard map → three conversion
 *   (`-y` → three.z), lifted to the floor.
 */
const navigationValueToPlacement = (value: NavigationStart | Room): MarkerPlacement => {
  if ("roomNumber" in value) {
    const c = polygonCentroid(value.vertices)
    return { position: [c.x, floorToY(value.floor, MARKER_LIFT), c.z], floor: value.floor }
  }
  return { position: mapPointToThree(value, MARKER_LIFT), floor: value.floor }
}

interface MarkerProps {
  placement: MarkerPlacement
  color: string
  label: string
}

const Marker = ({ placement, color, label }: MarkerProps) => {
  const labelPosition: [number, number, number] = [
    placement.position[0],
    placement.position[1] + LABEL_LIFT,
    placement.position[2],
  ]
  return (
    <>
      <RingMarker position={placement.position} color={color} />
      <Html position={labelPosition} center zIndexRange={[0, 0]} pointerEvents="none">
        <div
          className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      </Html>
    </>
  )
}

/**
 * Always-on visual cues for the active navigation request.
 *
 * - Start: blue ring + "Start" label at the picked coordinate / chosen
 *   room centroid.
 * - Destination: orange ring + "Destination" label at the destination
 *   room centroid.
 *
 * In 3D mode both markers render regardless of which floor the camera is
 * focused on (the floor stacking makes them visible). In 2D top-down mode
 * a marker is only rendered when its floor matches `currentFloor`, so the
 * ring doesn't project onto an unrelated floor's plan.
 */
export const NavigationMarkers = () => {
  const { start, destination } = useNavigation()
  const { renderMode, currentFloor } = useMap()

  const startPlacement = useMemo(() => (start ? navigationValueToPlacement(start) : null), [start])
  const destinationPlacement = useMemo(
    () => (destination ? navigationValueToPlacement(destination) : null),
    [destination],
  )

  const isVisibleOnCurrentView = (placement: MarkerPlacement) =>
    renderMode === "3d" || placement.floor === currentFloor

  return (
    <>
      {startPlacement && isVisibleOnCurrentView(startPlacement) && (
        <Marker placement={startPlacement} color={START_COLOR} label="Start" />
      )}
      {destinationPlacement && isVisibleOnCurrentView(destinationPlacement) && (
        <Marker placement={destinationPlacement} color={DESTINATION_COLOR} label="Destination" />
      )}
    </>
  )
}
