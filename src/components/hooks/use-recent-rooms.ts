import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { useMap } from "@/lib/map-context"
import { getAllRoomsData } from "@/server/room.functions"
import type { Room } from "@/types/room"

const STORAGE_KEY = "indoor-nav:recent-rooms"
export const MAX_RECENT_ROOMS = 6

const readStorage = (): string[] => {
  if (typeof globalThis.localStorage === "undefined") return []
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
  } catch {
    return []
  }
}

const writeStorage = (ids: string[]): void => {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Quota exceeded or storage disabled — keep the in-memory list usable.
  }
}

const shuffled = <T>(arr: T[]): T[] => {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface RecentRoomsResult {
  allRooms: Room[]
  /** Recently-opened rooms, most-recent first. Length 0..MAX_RECENT_ROOMS. */
  recentRooms: Room[]
  /** Random rooms preferring the current floor, deduped against `recentRooms`. */
  suggestedRooms: Room[]
}

/**
 * Library of all rooms split into ranked sources for the search bar.
 *
 * Recents are captured by watching `viewingRoomId` from MapContext, which
 * unifies every room-open path (search click, map click, navigation
 * destination). Callers don't need to push manually.
 *
 * `recentRooms` and `suggestedRooms` are returned separately so the consumer
 * can tag each row appropriately when rendering.
 */
export const useRecentRooms = (): RecentRoomsResult => {
  const { currentFloor, viewingRoomId } = useMap()
  const { data: allRooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRoomsData,
  })
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    setRecentIds(readStorage())
  }, [])

  useEffect(() => {
    if (viewingRoomId === null) return
    setRecentIds((current) => {
      const next = [viewingRoomId, ...current.filter((id) => id !== viewingRoomId)].slice(
        0,
        MAX_RECENT_ROOMS,
      )
      writeStorage(next)
      return next
    })
  }, [viewingRoomId])

  const recentRooms = useMemo<Room[]>(() => {
    const byId = new Map(allRooms.map((r) => [r.id, r]))
    return recentIds
      .map((id) => byId.get(id))
      .filter((r): r is Room => r !== undefined)
      .slice(0, MAX_RECENT_ROOMS)
  }, [allRooms, recentIds])

  const suggestedRooms = useMemo<Room[]>(() => {
    const seen = new Set(recentRooms.map((r) => r.id))
    const candidates = allRooms.filter((r) => !seen.has(r.id))
    const sameFloor =
      currentFloor === null ? [] : candidates.filter((r) => r.floor === currentFloor)
    const others =
      currentFloor === null ? candidates : candidates.filter((r) => r.floor !== currentFloor)
    return [...shuffled(sameFloor), ...shuffled(others)].slice(0, MAX_RECENT_ROOMS)
  }, [allRooms, recentRooms, currentFloor])

  return { allRooms, recentRooms, suggestedRooms }
}
