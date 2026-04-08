import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"

import { useMap } from "#/lib/map-context"

import { FLOOR_HEIGHT } from "./constants"

export const CursorCoordinates = () => {
  const { camera, raycaster, pointer } = useThree()
  const { currentFloor } = useMap()

  const [position, setPosition] = useState<THREE.Vector3 | null>(null)

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useFrame(() => {
    // Update plane distance based on current floor
    const floorY = (currentFloor ?? 0) * FLOOR_HEIGHT
    plane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, floorY, 0),
    )

    raycaster.setFromCamera(pointer, camera)

    const intersection = new THREE.Vector3()

    const hit = raycaster.ray.intersectPlane(plane.current, intersection)

    if (hit) {
      setPosition(intersection.clone())
    }
  })

  if (!position) return null

  return (
    <Html position={position} style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "black",
          color: "white",
          padding: "4px 6px",
          fontSize: "12px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          transform: "translate(10px, 5px)",
        }}
      >
        x: {position.x.toFixed(2)}
        <br />
        y: {position.z.toFixed(2)}
        <br />
        z: {currentFloor ?? 0}
      </div>
    </Html>
  )
}
