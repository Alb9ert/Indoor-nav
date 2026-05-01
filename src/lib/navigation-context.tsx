import { createContext, useContext, useMemo, useState } from "react"

import type { Node } from "#/generated/prisma/client"
import type { PersistedRoom } from "#/server/room.server"

export const routePreferences = {
  SIMPLE: "simple",
  FAST: "fast",
  ACCESSIBLE: "accessible",
} as const

/**
 * A coordinate the user picked on the map (no node, no room — just a point).
 * Stored in *map* coordinates so it has the same shape as `Node` and can flow
 * through the same conversion helpers.
 */
export interface MapPickedPoint {
  x: number
  y: number
  floor: number
}

export interface NavigationRequest {
  preference: keyof typeof routePreferences
  start: Node | MapPickedPoint | PersistedRoom
  destination: PersistedRoom
}

interface NavigationContextValue {
  start: NavigationRequest["start"] | null
  destination: NavigationRequest["destination"] | null
  preference: NavigationRequest["preference"]
  navigationPanelOpen: boolean
  navigationPath?: Node[]
  setStart: (start: NavigationRequest["start"] | null) => void
  setDestination: (destination: NavigationRequest["destination"] | null) => void
  setPreference: (preference: NavigationRequest["preference"]) => void
  setNavigationPanelOpen: (open: boolean) => void
  setNavigationPath?: (path: Node[] | undefined) => void
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [start, setStart] = useState<NavigationRequest["start"] | null>(null)
  const [destination, setDestination] = useState<NavigationRequest["destination"] | null>(null)
  const [preference, setPreference] = useState<NavigationRequest["preference"]>("SIMPLE")
  const [navigationPanelOpen, setNavigationPanelOpen] = useState<boolean>(false)
  const [navigationPath, setNavigationPath] = useState<Node[] | undefined>(undefined)

  const value = useMemo(
    () => ({
      start,
      destination,
      preference,
      navigationPanelOpen,
      navigationPath,
      setStart,
      setDestination,
      setPreference,
      setNavigationPanelOpen,
      setNavigationPath,
    }),
    [start, destination, preference, navigationPanelOpen, navigationPath],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
