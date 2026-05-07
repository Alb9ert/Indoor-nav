import { useRef, useState } from "react"

import { useFuzzySearch } from "@/components/hooks/use-fuse"
import { MAX_RECENT_ROOMS, useRecentRooms } from "@/components/hooks/use-recent-rooms"
import { RoomTypeStrip } from "@/components/map/search/room-type-strip"
import { SearchCombobox } from "@/components/ui/search-combobox"
import type { SearchResultItem } from "@/components/ui/search-result-list"
import type { RoomType } from "@/generated/prisma/enums"
import { useMap } from "@/lib/map-context"
import { roomToSearchResultItem, type RoomSearchResultItem } from "@/lib/room-format"
import { getRoomTypeMeta } from "@/lib/room-types"
import { cn } from "@/lib/utils"
import type { Room } from "@/types/room"

type FuzzyResultItem = RoomSearchResultItem & { room: Room }

const toItem = (room: Room): FuzzyResultItem => ({
  ...roomToSearchResultItem(room),
  room,
})

const dedupedById = (rooms: Room[]): Room[] => {
  const seen = new Set<string>()
  return rooms.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

export const FuzzySearchBar = ({ className }: { className?: string }) => {
  const { setViewingRoomId, setEditingRoomId, activeTool, focusTarget } = useMap()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState("")

  const { results } = useFuzzySearch(query)
  const { recentRooms, suggestedRooms } = useRecentRooms()

  const matches: Room[] = query.trim().length > 0 ? results.map((r) => r.item) : []

  // Always present MAX rows ranked: matches → recents → random pad. Tag
  // non-match rows so the user can see when the list is filling in.
  const matchIds = new Set(matches.map((r) => r.id))
  const recentIds = new Set(recentRooms.map((r) => r.id))
  const items = dedupedById([...matches, ...recentRooms, ...suggestedRooms]).slice(
    0,
    MAX_RECENT_ROOMS,
  )
  const tagFor = (room: Room): string | undefined => {
    if (matchIds.has(room.id)) return undefined
    if (recentIds.has(room.id)) return "Recent"
    return "Suggested"
  }
  const displayResults: SearchResultItem[] = items.map((r) => ({ ...toItem(r), tag: tagFor(r) }))

  const handleResultClick = (item: SearchResultItem) => {
    const { room } = item as FuzzyResultItem
    if (activeTool === "default") {
      setViewingRoomId(room.id)
    } else if (["draw-room", "edit-room", "draw-node", "connect-edge"].includes(activeTool)) {
      setEditingRoomId(room.id)
    }
    focusTarget(room)
  }

  const handleQuickPick = (type: RoomType) => {
    setQuery(getRoomTypeMeta(type).label)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <SearchCombobox
        className="w-full"
        placeholder="Search locations..."
        value={query}
        onQueryChange={setQuery}
        inputRef={inputRef}
        results={displayResults}
        onResultClick={handleResultClick}
      />
      <RoomTypeStrip onSelect={handleQuickPick} />
    </div>
  )
}
