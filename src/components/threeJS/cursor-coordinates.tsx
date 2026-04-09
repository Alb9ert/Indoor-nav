import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"

import { mapFromWorld } from "#/lib/coordinates"
import { useMap } from "#/lib/map-context"

import { FLOOR_HEIGHT } from "./constants"

export const CursorCoordinates = () => {
  const { camera, raycaster, pointer } = useThree()

  const { currentFloor, debugMode } = useMap()

  const positionRef = useRef(new THREE.Vector3())

  const [position, setPosition] = useState(new THREE.Vector3())

  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
    z: 0,
  })

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const floorY = (currentFloor ?? 0) * FLOOR_HEIGHT

  useFrame(() => {
    if (!debugMode) return

    plane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, floorY, 0),
    )

    raycaster.setFromCamera(pointer, camera)

    const hit = raycaster.ray.intersectPlane(plane.current, positionRef.current)

    if (hit) {
      const worldPos = positionRef.current.clone()

      setPosition(worldPos)

      setCoords(mapFromWorld(worldPos))
    }
  })

  if (!debugMode) return null

  return (
    <>
      <gridHelper
        // eslint-disable-next-line react/no-unknown-property
        args={[200, 100, 0xff0000, 0x444444]}
        // eslint-disable-next-line react/no-unknown-property
        position={[0, floorY + 0.02, 0]}
        // eslint-disable-next-line react/no-unknown-property
        rotation={[0, 0, 0]}
      />
      <Html position={position} className="pointer-events-none">
        <div className="bg-black text-white px-1.5 py-1 text-[12px] rounded whitespace-nowrap translate-x-[10px] translate-y-[5px]">
          x: {coords.x.toFixed(2)}
          <br />
          y: {coords.y.toFixed(2)}
          <br />
          z: {coords.z.toFixed(0)}
        </div>
      </Html>
    </>
  )
}
