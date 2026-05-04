import { FLOOR_HEIGHT } from "#/components/threeJS/constants"

import type { FloorPlan } from "#/types/floor-plan"
import type * as THREE from "three"

interface WorldCoordinate {
  x: number
  y: number
  z: number
}

/**
 * Converts pixel coordinates from the floor image
 * into ThreeJS world coordinates (meters)
 */
export function worldFromPixel(pixelX: number, pixelY: number, floor: FloorPlan): WorldCoordinate {
  const worldX = pixelX * floor.calibrationScale
  const worldY = pixelY * floor.calibrationScale

  return {
    x: worldX,
    y: worldY,
    z: floor.floor,
  }
}

/**
 * Converts ThreeJS world position into
 * map coordinates (meters)
 */
export function mapFromWorld(position: THREE.Vector3): WorldCoordinate {
  return {
    x: position.x,
    y: -position.z,
    z: position.y / FLOOR_HEIGHT,
  }
}
