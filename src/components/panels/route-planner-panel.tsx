import { useQuery } from "@tanstack/react-query"
import { MapPin, Navigation2, Route, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "#/components/ui/button"
import { cn } from "#/lib/utils"
import { useMap } from "#/lib/map-context"
import {
  clearRoute,
  pickDestRoom,
  pickStartNode,
  setPickMode,
  setRoutePath,
  useRoutePlanner,
} from "#/lib/route-planner-store"
import { astarFunction } from "#/server/astar.functions"
import { getAllNodesData } from "#/server/graph.functions"
import { getAllRoomsData, getRoomWithNodesData } from "#/server/room.functions"

type Profile = "ACCESIBLE_ROUTE" | "SIMPLE_ROUTE" | "FAST_ROUTE"

const PROFILES: { value: Profile; label: string }[] = [
  { value: "SIMPLE_ROUTE", label: "Simple" },
  { value: "FAST_ROUTE", label: "Fast" },
  { value: "ACCESIBLE_ROUTE", label: "Accessible" },
]

export const RoutePlannerPanel = () => {
  const { activeTool, setActiveTool } = useMap()
  const { pickMode, startNodeId, destRoomId, pathNodeIds } = useRoutePlanner()
  const [profile, setProfile] = useState<Profile>("SIMPLE_ROUTE")
  const [status, setStatus] = useState<"idle" | "running" | "found" | "not-found" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const open = activeTool === "route-plan"

  // Clear pick mode when leaving route-plan mode
  useEffect(() => {
    if (!open) setPickMode(null)
  }, [open])

  const { data: allNodes = [] } = useQuery({ queryKey: ["nodes"], queryFn: getAllNodesData })
  const { data: allRooms = [] } = useQuery({ queryKey: ["rooms"], queryFn: getAllRoomsData })
  const { data: roomWithNodes } = useQuery({
    queryKey: ["rooms", destRoomId, "with-nodes"],
    queryFn: () => getRoomWithNodesData({ data: { id: destRoomId! } }),
    enabled: !!destRoomId,
  })

  const startNode = startNodeId ? allNodes.find((n) => n.id === startNodeId) : null
  const destRoom = destRoomId ? allRooms.find((r) => r.id === destRoomId) : null
  const canRun = !!startNode && !!roomWithNodes && status !== "running"

  const run = async () => {
    if (!startNode || !roomWithNodes) return
    setStatus("running")
    setErrorMsg(null)
    try {
      const result = await astarFunction({
        data: { profile, dest: roomWithNodes as any, start: startNode as any },
      })
      if (result === null) {
        setStatus("not-found")
        setRoutePath([])
      } else {
        setStatus("found")
        setRoutePath(result.map((n) => n.id))
      }
    } catch (e) {
      setStatus("error")
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setRoutePath([])
    }
  }

  const handleClear = () => {
    clearRoute()
    setStatus("idle")
    setErrorMsg(null)
  }

  const changeProfile = (p: Profile) => {
    setProfile(p)
    setRoutePath([])
    setStatus("idle")
  }

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "fixed top-0 right-0 z-30 flex h-full w-88 flex-col border-l border-border bg-popover text-popover-foreground shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full pointer-events-none",
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Route className="size-4" />
          <h2 className="text-sm font-semibold">Route Planner</h2>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setActiveTool("default")}
          aria-label="Close"
        >
          <X className="size-3.5" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {/* Start node */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-popover-foreground/60">
            Start node
          </span>
          <button
            onClick={() => setPickMode(pickMode === "start" ? null : "start")}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
              pickMode === "start"
                ? "border-primary bg-primary/10 text-primary"
                : startNode
                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50",
            )}
          >
            <Navigation2 className="size-4 shrink-0" />
            <span className="truncate font-mono text-xs">
              {pickMode === "start"
                ? "Click a node on the map…"
                : startNode
                  ? `${startNode.type} · …${startNode.id.slice(-8)}`
                  : "Click to select start node"}
            </span>
          </button>
        </div>

        {/* Destination room */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-popover-foreground/60">
            Destination room
          </span>
          <button
            onClick={() => setPickMode(pickMode === "dest" ? null : "dest")}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
              pickMode === "dest"
                ? "border-primary bg-primary/10 text-primary"
                : destRoom
                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50",
            )}
          >
            <MapPin className="size-4 shrink-0" />
            <span className="truncate text-sm">
              {pickMode === "dest"
                ? "Click a room on the map…"
                : destRoom
                  ? (destRoom.displayName ?? destRoom.roomNumber)
                  : "Click to select destination"}
            </span>
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-popover-foreground/60">
            Routing profile
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {PROFILES.map((p) => (
              <button
                key={p.value}
                onClick={() => changeProfile(p.value)}
                className={cn(
                  "rounded-md border py-2 text-xs font-medium transition-colors",
                  profile === p.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {status === "found" && pathNodeIds.size > 0 && (
          <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
            Path found · {pathNodeIds.size} nodes
          </p>
        )}
        {status === "not-found" && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            No path found
          </p>
        )}
        {status === "error" && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {errorMsg ?? "Unknown error"}
          </p>
        )}
      </div>

      <footer className="flex flex-col gap-2 border-t border-border p-4">
        <Button onClick={() => { void run() }} disabled={!canRun} className="w-full">
          {status === "running" ? "Finding route…" : "Find route"}
        </Button>
        <Button variant="outline" onClick={handleClear} className="w-full">
          Clear
        </Button>
      </footer>
    </aside>
  )
}
