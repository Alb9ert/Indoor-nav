import { useMemo } from "react"

import { useNavigation } from "#/lib/navigation-context"
import { mapPointToThree } from "#/lib/three-utils"

import { MARKER_LIFT } from "./constants"
import { AnimatedPathLine, EdgePreview } from "./draw-primitives"

/**
 * Renders the navigation path as a continuous line connecting all nodes
 * in the calculated route. The line is rendered in the 3D scene and
 * follows the Z-axis elevation of each node, with a lift offset for
 * visibility above ground.
 */
export const NavigationPathLayer = () => {
  const { navigationPath } = useNavigation()

  const pathPoints = useMemo(() => {
    if (!navigationPath || navigationPath.length < 2) return []
    return navigationPath.map((node) =>
      mapPointToThree({ x: node.x, y: node.y, floor: node.floor }, MARKER_LIFT)
    )
  }, [navigationPath])

  if (pathPoints.length < 2) return null

  return (
    <>
      {/* Ghost trail underneath */}
      <EdgePreview points={pathPoints} color="#4406e0" lineWidth={6} opacity={0.15} />
      {/* Animated dash overlay */}
      <AnimatedPathLine points={pathPoints} color="#4406e0" lineWidth={5} />
    </>
  )
}
