import { Fragment, useMemo } from "react"

import { useMap } from "#/lib/map-context"
import { useNavigation } from "#/lib/navigation-context"
import { mapPointToThree } from "#/lib/three-utils"

import { MARKER_LIFT } from "./constants"
import { AnimatedPathLine, EdgePreview } from "./draw-primitives"

/**
 * Renders the navigation path as a continuous line connecting all nodes
 * in the calculated route. In 3D mode the full path is shown. In 2D mode
 * only the current floor's visible segments are rendered.
 */
export const NavigationPathLayer = () => {
  const { navigationPath } = useNavigation()
  const { renderMode, currentFloor } = useMap()

  const visiblePathSegments = useMemo(() => {
    if (!navigationPath || navigationPath.length < 2) return []

    const toPoint = (node: (typeof navigationPath)[number]) =>
      mapPointToThree({ x: node.x, y: node.y, floor: node.floor }, MARKER_LIFT)

    if (renderMode === "3d") {
      return [navigationPath.map(toPoint)]
    }

    const segments: ReturnType<typeof toPoint>[][] = []
    let currentSegment: ReturnType<typeof toPoint>[] = []

    for (const node of navigationPath) {
      if (node.floor !== currentFloor) {
        if (currentSegment.length >= 2) {
          segments.push(currentSegment)
        }
        currentSegment = []
        continue
      }

      currentSegment.push(toPoint(node))
    }

    if (currentSegment.length >= 2) {
      segments.push(currentSegment)
    }

    return segments
  }, [navigationPath, renderMode, currentFloor])

  if (visiblePathSegments.length === 0) return null

  return (
    <>
      {visiblePathSegments.map((segment, index) => (
        <Fragment key={index}>
          <EdgePreview points={segment} color="#4406e0" lineWidth={6} opacity={0.15} />
          <AnimatedPathLine points={segment} color="#4406e0" lineWidth={5} />
        </Fragment>
      ))}
    </>
  )
}
