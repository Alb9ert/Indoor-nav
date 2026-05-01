import * as THREE from "three"

import { DRAWING_LIFT, FLOOR_HEIGHT } from "#/components/threeJS/constants"

/**
 * World-space Y coordinate for a given floor index, with an optional lift
 * above the floor plane (used by drawing primitives and markers to avoid
 * z-fighting with the floor texture).
 */
export const floorToY = (floor: number, lift = 0): number => floor * FLOOR_HEIGHT + lift

/**
 * Centroid of a polygon expressed as `(x, z)` points. The floor-plane axes
 * are kept on input/output so callers can drop the result into a three.js
 * position alongside a separate `y` (= `floorToY(floor)`).
 */
export const polygonCentroid = (
  vertices: readonly { x: number; z: number }[],
): { x: number; z: number } => {
  if (vertices.length === 0) return { x: 0, z: 0 }
  let sumX = 0
  let sumZ = 0
  for (const v of vertices) {
    sumX += v.x
    sumZ += v.z
  }
  return { x: sumX / vertices.length, z: sumZ / vertices.length }
}

/** Lift a world-space point above the floor by `amount` to avoid z-fighting. */
export const lift = (v: THREE.Vector3, amount = DRAWING_LIFT): [number, number, number] => [
  v.x,
  v.y + amount,
  v.z,
]

/** Snap a world point to the nearest grid intersection on the floor at `floorY`. */
export const snapPointToGrid = (
  point: THREE.Vector3,
  spacing: number,
  floorY: number,
): THREE.Vector3 =>
  new THREE.Vector3(
    Math.round(point.x / spacing) * spacing,
    floorY,
    Math.round(point.z / spacing) * spacing,
  )

/**
 * Convert a graph-node-style point in *map* coordinates `(x, y, floor)` into
 * a three.js position tuple. Map `y` is the floor-plane forward axis, which
 * three.js represents as `-z`; floor index is lifted into world `y`.
 */
export const mapPointToThree = (
  point: { x: number; y: number; floor: number },
  liftAmount = DRAWING_LIFT,
): [number, number, number] => [point.x, floorToY(point.floor, liftAmount), -point.y]
