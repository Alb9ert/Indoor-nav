import { createContext, useContext, useMemo, useState } from "react"

import type { NavigationStart, RoutePreference } from "#/types/navigation"
import type { Node } from "#/types/node"
import type { Room } from "#/types/room"

/**
 * The runtime navigation request. The wire shape sent to the A* server
 * (`AstarInput`) is structurally similar but requires a destination with
 * its `nodes` relation included; we resolve that at call time.
 */
interface NavigationRequest {
  preference: RoutePreference
  start: NavigationStart
  destination: Room
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
