import { Circle, Crosshair, MapPin } from "lucide-react"
import { useState } from "react"

import { useFuzzySearch } from "#/components/hooks/use-fuse"
import { Panel } from "#/components/panels/panel"
import { Button } from "#/components/ui/button"
import { SearchBar } from "#/components/ui/search-bar"
import { SearchResultList, type SearchResultItem } from "#/components/ui/search-result-list"
import { Separator } from "#/components/ui/separator"
import { useNavigation } from "#/lib/navigation-context"
import { getRoomTypeMeta, getRoomTypeOutline } from "#/lib/room-types"

import type { NavigationRequest } from "#/lib/navigation-context"

type FieldKey = "start" | "destination"

type RoomResultItem = SearchResultItem & { dbId: string }

const formatValue = (value: NavigationRequest["start"] | null) => {
  if (!value) return ""
  if ("roomNumber" in value) {
    return value.displayName ? `${value.roomNumber} - ${value.displayName}` : value.roomNumber
  }
  if ("id" in value) return `Node ${value.id.slice(0, 6)}`
  return `${value.x.toFixed(2)}, ${value.y.toFixed(2)} (floor ${value.floor})`
}

/**
 * Vertical 3-dot connector between the two field icons. Aligned to the
 * leading-icon column of the SearchBar field variant (px-4 + half icon).
 */
const DotConnector = () => (
  <div className="flex pl-4 my-2.5">
    <div className="flex w-5 flex-col items-center gap-1.5 py-0.5">
      <div className="size-1 rounded-full bg-muted-foreground/60" />
      <div className="size-1 rounded-full bg-muted-foreground/60" />
      <div className="size-1 rounded-full bg-muted-foreground/60" />
    </div>
  </div>
)

export const NavigationPanel = () => {
  const {
    start,
    destination,
    navigationPanelOpen,
    setNavigationPanelOpen,
    setStart,
    setDestination,
  } = useNavigation()

  const [activeField, setActiveField] = useState<FieldKey | null>(null)
  const [query, setQuery] = useState("")

  const { results, isLoading } = useFuzzySearch(query)

  // React to the open prop transitioning. Derived-state pattern (same as
  // Panel's height reset) — no effect needed.
  const [prevOpen, setPrevOpen] = useState(navigationPanelOpen)
  if (navigationPanelOpen !== prevOpen) {
    setPrevOpen(navigationPanelOpen)
    if (navigationPanelOpen) {
      setActiveField(destination !== null && start === null ? "start" : null)
    } else {
      setActiveField(null)
    }
    setQuery("")
  }

  const valueFor = (field: FieldKey) =>
    activeField === field ? query : formatValue(field === "start" ? start : destination)

  const focusField = (field: FieldKey) => {
    setActiveField(field)
    setQuery("")
  }

  // Match FuzzySearchBar shape exactly — roomNumber as the displayed primary
  // label, displayName as the secondary, plus a dbId attached for lookup.
  const roomResults: RoomResultItem[] =
    isLoading || activeField === null
      ? []
      : results.map((r) => {
          const meta = getRoomTypeMeta(r.item.type)
          const outline = getRoomTypeOutline(r.item.type)
          const Icon = meta.icon
          return {
            id: r.item.roomNumber,
            icon: <Icon className="w-5 h-5" style={{ color: outline }} />,
            iconBgStyle: { backgroundColor: meta.color, outline: `2px solid ${outline}` },
            title: r.item.displayName ?? "",
            type: meta.label,
            dbId: r.item.id,
          }
        })

  const selectOnMapItem: SearchResultItem = {
    id: "Select on map",
    icon: <Crosshair className="w-5 h-5 text-white" />,
    iconBgStyle: { backgroundColor: "var(--color-primary)" },
    title: "",
    type: "Pick a point on the floor plan",
  }

  const handlePickRoom = (item: SearchResultItem) => {
    const room = results.find((r) => r.item.roomNumber === item.id)?.item
    if (!room || !activeField) return
    if (activeField === "start") setStart(room)
    else setDestination(room)
    setActiveField(null)
    setQuery("")
  }

  const handleSelectOnMap = () => {
    // TODO: enter map-pick mode for the start location.
    console.log("Select on map: not yet implemented")
    setActiveField(null)
    setQuery("")
  }

  const canStart = start !== null && destination !== null

  const header = (
    <div className="flex flex-col gap-1 p-5 pr-14">
      <h2 className="text-2xl font-bold">Navigation</h2>
      <p className="text-sm text-popover-foreground/70">
        {activeField === "start"
          ? "Selecting start location — pick a result below"
          : activeField === "destination"
            ? "Selecting destination — pick a result below"
            : canStart
              ? "Ready to go"
              : "Choose a start location and destination"}
      </p>
    </div>
  )

  const footer = (
    <div className="border-t border-white/10 p-4">
      <Button type="button" className="w-full" disabled={!canStart}>
        Start
      </Button>
    </div>
  )

  return (
    <Panel
      open={navigationPanelOpen}
      fullHeight
      onClose={() => {
        setNavigationPanelOpen(false)
        setStart(null)
        setDestination(null)
        setActiveField(null)
        setQuery("")
      }}
      header={header}
      footer={footer}
    >
      <div className="sticky top-0 z-10 flex flex-col gap-1 bg-popover px-4 pb-4">
        <SearchBar
          type="field"
          leadingIcon={<Circle className="size-5 text-muted-foreground shrink-0" />}
          placeholder="Choose start location"
          value={valueFor("start")}
          active={activeField === "start"}
          onFocus={() => {
            focusField("start")
          }}
          onQueryChange={setQuery}
          onClear={
            start !== null && activeField !== "start"
              ? () => {
                  setStart(null)
                  setActiveField("start")
                  setQuery("")
                }
              : undefined
          }
          inputAriaLabel="Start location"
        />

        <DotConnector />

        <SearchBar
          type="field"
          leadingIcon={<MapPin className="size-5 text-muted-foreground shrink-0" />}
          placeholder="Search destination"
          value={valueFor("destination")}
          active={activeField === "destination"}
          onFocus={() => {
            focusField("destination")
          }}
          onQueryChange={setQuery}
          onClear={
            destination !== null && activeField !== "destination"
              ? () => {
                  setDestination(null)
                  setActiveField("destination")
                  setQuery("")
                }
              : undefined
          }
          inputAriaLabel="Destination"
        />
      </div>

      {activeField !== null && (
        <>
          <Separator className="bg-white mx-4 my-2" />
          <div className="mx-2">
            <div className="py-2 text-xs font-medium uppercase tracking-wide text-primary-foreground">
              Results for {activeField === "start" ? "start location" : "destination"}
            </div>

            {activeField === "start" && (
              <>
                <SearchResultList
                  items={[selectOnMapItem]}
                  onItemClick={handleSelectOnMap}
                  bare
                  className="bg-white"
                />
                <Separator />
              </>
            )}

            {roomResults.length > 0 ? (
              <SearchResultList
                items={roomResults}
                onItemClick={handlePickRoom}
                bare
                className="bg-white"
              />
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                {query.trim().length === 0 ? "Start typing to search rooms" : "No matches"}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  )
}
