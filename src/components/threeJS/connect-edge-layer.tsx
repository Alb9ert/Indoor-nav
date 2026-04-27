/* eslint-disable react/no-unknown-property */
import { useFrame } from "@react-three/fiber"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { useMap } from "#/lib/map-context"
import { addEdgeData, getAllEdgesData, getAllNodesData } from "#/server/graph.functions"

import { useCanvasPointer } from "../hooks/use-canvas-pointer"

import { DRAWING_LIFT, FLOOR_HEIGHT } from "./constants"
import { EdgePreview, VertexMarker } from "./draw-primitives"
import { RaycastPlane } from "./raycast-plane"

import type { FloorPlan } from "#/types/floor-plan"

interface ConnectEdgeLayerProps {
  floor: FloorPlan
}

const NODE_COLOR = "#3b82f6"
const NODE_DOOR_COLOR = "#a855f7"
const NODE_INACTIVE_COLOR = "#ef4444"
const NODE_SOURCE_COLOR = "#22c55e"
const NODE_HIGHLIGHT_COLOR = "#f97316"
const EDGE_COLOR = "#60a5fa"
const EDGE_INACTIVE_COLOR = "#ef4444"
const EDGE_SELECTED_COLOR = "#f97316"
const EDGE_PREVIEW_COLOR = "#fbbf24"

const NODE_RADIUS = 0.14
const BASE_CAMERA_ZOOM = 60
const DRAG_THRESHOLD_PX = 5

type NodeRecord = Awaited<ReturnType<typeof getAllNodesData>>[number]
type EdgeRecord = Awaited<ReturnType<typeof getAllEdgesData>>[number]

// Clickable node sphere, selects as edge source or target

const ClickableNodeForEdge = ({
  node,
  floorY,
  color,
}: {
  node: NodeRecord
  floorY: number
  color: string
}) => {
  const { pendingEdgeFromNodeId, setPendingEdgeFromNodeId, setEditingEdgeId } = useMap()
  const queryClient = useQueryClient()
  const meshRef = useRef<THREE.Mesh>(null)
  const downRef = useRef<{ x: number; y: number } | null>(null)

  const addEdgeMutation = useMutation({
    mutationFn: (fromNode: NodeRecord) => {
      const distance = Math.hypot(node.x - fromNode.x, node.y - fromNode.y)
      return addEdgeData({
        data: {
          fromNodeId: fromNode.id,
          toNodeId: node.id,
          distance: Math.max(distance, 0.01),
          isActivated: fromNode.isActivated && node.isActivated,
        },
      })
    },
    onSuccess: () => {
      setPendingEdgeFromNodeId(null)
      void queryClient.invalidateQueries({ queryKey: ["edges"] })
    },
  })

  useFrame(({ camera }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const zoom = (camera as THREE.OrthographicCamera).zoom
    if (zoom) mesh.scale.setScalar(BASE_CAMERA_ZOOM / zoom)
  })

  const { data: allNodes = [] } = useQuery({
    queryKey: ["nodes"],
    queryFn: getAllNodesData,
  })

  const handleClick = useCallback(() => {
    setEditingEdgeId(null)
    if (pendingEdgeFromNodeId === null) {
      setPendingEdgeFromNodeId(node.id)
    } else if (pendingEdgeFromNodeId === node.id) {
      setPendingEdgeFromNodeId(null)
    } else {
      const fromNode = allNodes.find((n) => n.id === pendingEdgeFromNodeId)
      if (fromNode) addEdgeMutation.mutate(fromNode)
    }
  }, [
    pendingEdgeFromNodeId,
    setPendingEdgeFromNodeId,
    setEditingEdgeId,
    node.id,
    allNodes,
    addEdgeMutation,
  ])

  return (
    <mesh
      ref={meshRef}
      position={[node.x, floorY + DRAWING_LIFT, -node.y]}
      onPointerDown={(e) => {
        e.stopPropagation()
        downRef.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        e.stopPropagation()
        const start = downRef.current
        downRef.current = null
        if (!start) return
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD_PX) return
        handleClick()
      }}
    >
      <sphereGeometry args={[NODE_RADIUS, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

// Clickable edge — invisible cylinder hit target + visible line

const ClickableEdge = ({
  edge,
  fromNode,
  toNode,
  isSelected,
}: {
  edge: EdgeRecord
  fromNode: NodeRecord
  toNode: NodeRecord
  isSelected: boolean
}) => {
  const { setEditingEdgeId, setPendingEdgeFromNodeId } = useMap()
  const downRef = useRef<{ x: number; y: number } | null>(null)

  const fromY = fromNode.floor * FLOOR_HEIGHT + DRAWING_LIFT
  const toY = toNode.floor * FLOOR_HEIGHT + DRAWING_LIFT

  const from3D = useMemo(
    () => new THREE.Vector3(fromNode.x, fromY, -fromNode.y),
    [fromNode.x, fromNode.y, fromY],
  )
  const to3D = useMemo(() => new THREE.Vector3(toNode.x, toY, -toNode.y), [toNode.x, toNode.y, toY])

  const { mid, length, quaternion } = useMemo(() => {
    const m = new THREE.Vector3().addVectors(from3D, to3D).multiplyScalar(0.5)
    const dir = new THREE.Vector3().subVectors(to3D, from3D)
    const len = dir.length()
    dir.normalize()
    const yAxis = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion()
    if (Math.abs(dir.dot(yAxis) + 1) < 0.0001) {
      q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI)
    } else {
      q.setFromUnitVectors(yAxis, dir)
    }
    return { mid: m, length: len, quaternion: q }
  }, [from3D, to3D])

  return (
    <>
      <EdgePreview
        points={[from3D, to3D]}
        color={
          isSelected ? EDGE_SELECTED_COLOR : edge.isActivated ? EDGE_COLOR : EDGE_INACTIVE_COLOR
        }
        lineWidth={isSelected ? 3 : 2}
      />
      {/* Invisible cylinder for click detection */}
      <mesh
        position={mid}
        quaternion={quaternion}
        onPointerDown={(e) => {
          e.stopPropagation()
          downRef.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          const start = downRef.current
          downRef.current = null
          if (!start) return
          if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD_PX) return
          setPendingEdgeFromNodeId(null)
          setEditingEdgeId(edge.id)
        }}
      >
        <cylinderGeometry args={[0.12, 0.12, length, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}

// Main layer

export const ConnectEdgeLayer = ({ floor }: ConnectEdgeLayerProps) => {
  const { pendingEdgeFromNodeId, editingEdgeId, setPendingEdgeFromNodeId, setEditingEdgeId } =
    useMap()
  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null)

  const floorY = floor.floor * FLOOR_HEIGHT

  const { data: allNodes = [] } = useQuery({
    queryKey: ["nodes"],
    queryFn: getAllNodesData,
  })

  const { data: allEdges = [] } = useQuery({
    queryKey: ["edges"],
    queryFn: getAllEdgesData,
  })

  const floorNodes = useMemo(
    () => allNodes.filter((n) => n.floor === floor.floor),
    [allNodes, floor.floor],
  )

  const nodeById = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes])

  const floorNodeIds = useMemo(() => new Set(floorNodes.map((n) => n.id)), [floorNodes])

  // Show edges where both endpoints are on the current floor
  const floorEdges = useMemo(
    () => allEdges.filter((e) => floorNodeIds.has(e.fromNodeId) && floorNodeIds.has(e.toNodeId)),
    [allEdges, floorNodeIds],
  )

  // Cross-floor edges (stairs/elevators) where one endpoint is on this floor — shown read-only
  const crossFloorEdges = useMemo(
    () =>
      allEdges.filter((e) => {
        const a = nodeById.get(e.fromNodeId)
        const b = nodeById.get(e.toNodeId)
        if (!a || !b || a.floor === b.floor) return false
        return a.floor === floor.floor || b.floor === floor.floor
      }),
    [allEdges, nodeById, floor.floor],
  )

  const sourceNode = pendingEdgeFromNodeId ? nodeById.get(pendingEdgeFromNodeId) : null

  const handleBackgroundClick = useCallback(() => {
    setPendingEdgeFromNodeId(null)
    setEditingEdgeId(null)
  }, [setPendingEdgeFromNodeId, setEditingEdgeId])

  const handleMove = useCallback((point: THREE.Vector3) => {
    setCursor(point)
  }, [])

  const handlers = useCanvasPointer({ onClick: handleBackgroundClick, onMove: handleMove })

  const nodeColor = (node: NodeRecord) => {
    if (node.id === pendingEdgeFromNodeId) return NODE_SOURCE_COLOR
    if (!node.isActivated) return NODE_INACTIVE_COLOR
    if (node.type === "DOOR") return NODE_DOOR_COLOR
    return NODE_COLOR
  }

  return (
    <>
      <RaycastPlane floor={floor} {...handlers} />

      {floorEdges.map((edge) => {
        const a = nodeById.get(edge.fromNodeId)
        const b = nodeById.get(edge.toNodeId)
        if (!a || !b) return null
        return (
          <ClickableEdge
            key={edge.id}
            edge={edge}
            fromNode={a}
            toNode={b}
            isSelected={edge.id === editingEdgeId}
          />
        )
      })}

      {crossFloorEdges.map((edge) => {
        const a = nodeById.get(edge.fromNodeId)
        const b = nodeById.get(edge.toNodeId)
        if (!a || !b) return null
        return (
          <ClickableEdge
            key={edge.id}
            edge={edge}
            fromNode={a}
            toNode={b}
            isSelected={edge.id === editingEdgeId}
          />
        )
      })}

      {floorNodes.map((node) => (
        <ClickableNodeForEdge key={node.id} node={node} floorY={floorY} color={nodeColor(node)} />
      ))}

      {/* Preview line from source node to cursor */}
      {sourceNode && cursor && (
        <EdgePreview
          points={[
            [sourceNode.x, floorY + DRAWING_LIFT, -sourceNode.y],
            [cursor.x, floorY + DRAWING_LIFT, cursor.z],
          ]}
          color={EDGE_PREVIEW_COLOR}
          lineWidth={2}
        />
      )}

      {/* Halo on source node */}
      {sourceNode && (
        <VertexMarker
          position={[sourceNode.x, floorY + DRAWING_LIFT, -sourceNode.y]}
          color={NODE_HIGHLIGHT_COLOR}
          radius={0.22}
        />
      )}
    </>
  )
}
