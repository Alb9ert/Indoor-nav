import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import {
  FLOOR_HEIGHT,
  LERP_SPEED,
  NEIGHBOUR_MAX_OPACITY,
  TILT_FADE_END,
  TILT_FADE_START,
} from "./constants"

interface OrbitControlsLike {
  target: THREE.Vector3
  getPolarAngle: () => number
}

interface CameraRigProps {
  activeFloor: number
  controlsRef: React.RefObject<OrbitControlsLike | null>
  neighbourOpacityRef: React.RefObject<number>
}

/**
 * Runs every frame to:
 * 1. Smoothly re-centre the orbit target on the active floor
 * 2. Compute neighbour floor opacity from the camera tilt angle
 */
export const CameraRig = ({ activeFloor, controlsRef, neighbourOpacityRef }: CameraRigProps) => {
  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    // Smoothly re-centre on the active floor
    const targetY = activeFloor * FLOOR_HEIGHT
    controls.target.y = THREE.MathUtils.lerp(controls.target.y, targetY, LERP_SPEED)

    // Compute neighbour opacity from tilt angle
    const polarAngle = controls.getPolarAngle()
    const t = THREE.MathUtils.smoothstep(polarAngle, TILT_FADE_START, TILT_FADE_END)
    neighbourOpacityRef.current = t * NEIGHBOUR_MAX_OPACITY
  })

  return null
}
