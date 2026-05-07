import { useFrame } from "@react-three/fiber"

/** Near/far for both perspective and orthographic cameras. Tiny near keeps
 * geometry from clipping at extreme tilt + close-zoom positions; FAR is
 * effectively unbounded — floor plane textures can be huge (mostly
 * transparent padding) and panning moves the camera with the orbit target,
 * so the camera-to-far-corner distance is hard to bound a priori. The
 * Canvas runs with `logarithmicDepthBuffer: true`, so a huge near/far
 * ratio doesn't degrade depth precision. */
const NEAR = 0.001
const FAR = 1e10

/**
 * Enforces camera near/far every frame. R3F's Canvas `camera` prop is only
 * applied at default-camera creation, and toggling `orthographic` recreates
 * the camera with three.js defaults — which puts the far plane (default 2000)
 * well inside this scene's world extents and clips everything past it.
 */
export const CameraConfig = () => {
  useFrame(({ camera }) => {
    if (camera.near !== NEAR || camera.far !== FAR) {
      camera.near = NEAR
      camera.far = FAR
      camera.updateProjectionMatrix()
    }
  })
  return null
}
