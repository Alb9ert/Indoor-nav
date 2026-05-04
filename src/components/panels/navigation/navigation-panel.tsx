/* eslint-disable @typescript-eslint/naming-convention */
import { Fragment, useState } from "react"

import { useFuzzySearch } from "#/components/hooks/use-fuse"
import {
  DotConnector,
  FIELD_LABEL,
  FIELDS,
  PREFERENCE_OPTIONS,
  SELECT_ON_MAP_ITEM,
  type FieldConfig,
  type FieldKey,
} from "#/components/panels/navigation/navigation-panel-shared"
import { Panel } from "#/components/panels/panel"
import { Button } from "#/components/ui/button"
import { SearchBar } from "#/components/ui/search-bar"
import { SearchResultList, type SearchResultItem } from "#/components/ui/search-result-list"
import { Separator } from "#/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group"
import { useMap } from "#/lib/map-context"
import { useNavigation } from "#/lib/navigation-context"
import {
  formatNavigationValue,
  roomToSearchResultItem,
  type RoomSearchResultItem,
} from "#/lib/room-format"

import type { RoutePreference } from "#/types/navigation"

export const NavigationPanel = () => {
  const {
    start,
    destination,
    navigationPanelOpen,
    setNavigationPanelOpen,
    setStart,
    setDestination,
    preference,
    setPreference,
    activeField,
    setActiveField,
    pickRoomForActiveField,
  } = useNavigation()
  const { pickingStart, setPickingStart } = useMap()

  const [query, setQuery] = useState("")

  const { results, isLoading } = useFuzzySearch(query)

  // React to the open prop transitioning. Derived-state pattern (same as
  // Panel's height reset) — no effect needed.
  const [prevOpen, setPrevOpen] = useState(navigationPanelOpen)
  if (navigationPanelOpen !== prevOpen) {
    setPrevOpen(navigationPanelOpen)
    setActiveField(navigationPanelOpen && destination !== null && start === null ? "start" : null)
    setQuery("")
  }

  const fieldValue = (field: FieldKey) => (field === "start" ? start : destination)
  const clearField = (field: FieldKey) => {
    if (field === "start") setStart(null)
    else setDestination(null)
  }

  const focusField = (field: FieldKey) => {
    setActiveField(field)
    setQuery("")
  }

  const roomResults: RoomSearchResultItem[] =
    isLoading || activeField === null ? [] : results.map((r) => roomToSearchResultItem(r.item))

  const handlePickRoom = (item: SearchResultItem) => {
    const { dbId } = item as RoomSearchResultItem
    const room = results.find((r) => r.item.id === dbId)?.item
    if (!room) return
    pickRoomForActiveField(room)
    setQuery("")
  }

  const handleSelectOnMap = () => {
    setActiveField(null)
    setQuery("")
    setPickingStart(true)
  }

  const handleClose = () => {
    setNavigationPanelOpen(false)
    setStart(null)
    setDestination(null)
    setActiveField(null)
    setQuery("")
    setPickingStart(false)
  }

  const canStart = start !== null && destination !== null

  const headerText = (() => {
    if (activeField !== null) return `Selecting ${FIELD_LABEL[activeField]} - pick a result below`
    if (canStart) return "Ready to go"
    return "Choose a start location and destination"
  })()

  const header = (
    <div className="flex flex-col gap-1 p-5 pr-14">
      <h2 className="text-2xl font-bold">Navigation</h2>
      <p className="text-sm text-popover-foreground/70">{headerText}</p>
    </div>
  )

  const footer = (
    <div className="border-t border-white/10 p-4">
      <Button type="button" className="w-full" disabled={!canStart}>
        Start
      </Button>
    </div>
  )

  const renderField = ({ key, icon: Icon, placeholder, ariaLabel }: FieldConfig) => {
    const value = fieldValue(key)
    const isActive = activeField === key
    return (
      <SearchBar
        type="field"
        leadingIcon={<Icon className="size-5 text-muted-foreground shrink-0" />}
        placeholder={placeholder}
        value={isActive ? query : formatNavigationValue(value)}
        active={isActive}
        onFocus={() => {
          focusField(key)
        }}
        onQueryChange={setQuery}
        onClear={
          value !== null && !isActive
            ? () => {
                clearField(key)
                setActiveField(key)
                setQuery("")
              }
            : undefined
        }
        inputAriaLabel={ariaLabel}
      />
    )
  }

  const emptyResultsMessage =
    query.trim().length === 0 ? "Start typing to search rooms" : "No matches"

  return (
    <Panel
      open={navigationPanelOpen && !pickingStart}
      fullHeight
      onClose={handleClose}
      header={header}
      footer={footer}
    >
      <div className="sticky top-0 z-10 flex flex-col gap-1 bg-popover px-4 pb-4">
        {FIELDS.map((field, idx) => (
          <Fragment key={field.key}>
            {idx > 0 && <DotConnector />}
            {renderField(field)}
          </Fragment>
        ))}

        <ToggleGroup
          aria-label="Routing preference"
          value={[preference]}
          onValueChange={(next) => {
            // Single-select: ignore the empty case (require one selected).
            const [picked] = next
            if (picked) setPreference(picked as RoutePreference)
          }}
          className="mt-4 w-full [&>button]:flex-1"
        >
          {PREFERENCE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem key={value} value={value} size="sm" aria-label={label}>
              <Icon className="size-4" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {activeField !== null && (
        <>
          <Separator className="bg-white mx-4 my-2" />
          <div className="mx-2">
            <div className="py-2 text-xs font-medium uppercase tracking-wide text-primary-foreground">
              Results for {FIELD_LABEL[activeField]}
            </div>

            {activeField === "start" && (
              <>
                <SearchResultList
                  items={[SELECT_ON_MAP_ITEM]}
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
                className="bg-white overflow-y-scroll"
              />
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground max-h-full">
                {emptyResultsMessage}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  )
}
