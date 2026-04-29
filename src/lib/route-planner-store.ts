import { useEffect, useState } from "react"

export type PickMode = "start" | "dest" | null

interface RoutePlannerState {
  pickMode: PickMode
  startNodeId: string | null
  destRoomId: string | null
  pathNodeIds: Set<string>
}

let state: RoutePlannerState = {
  pickMode: null,
  startNodeId: null,
  destRoomId: null,
  pathNodeIds: new Set(),
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const setState = (patch: Partial<RoutePlannerState>) => {
  state = { ...state, ...patch }
  emit()
}

export const setPickMode = (mode: PickMode) => setState({ pickMode: mode })

export const pickStartNode = (id: string) =>
  setState({ startNodeId: id, pickMode: null, pathNodeIds: new Set() })

export const pickDestRoom = (id: string) =>
  setState({ destRoomId: id, pickMode: null, pathNodeIds: new Set() })

export const setRoutePath = (ids: string[]) => setState({ pathNodeIds: new Set(ids) })

export const clearRoute = () =>
  setState({ pickMode: null, startNodeId: null, destRoomId: null, pathNodeIds: new Set() })

export const subscribeRoutePlanner = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useRoutePlanner = (): RoutePlannerState => {
  const [s, setS] = useState<RoutePlannerState>(() => ({
    ...state,
    pathNodeIds: new Set(state.pathNodeIds),
  }))
  useEffect(
    () => subscribeRoutePlanner(() => setS({ ...state, pathNodeIds: new Set(state.pathNodeIds) })),
    [],
  )
  return s
}
