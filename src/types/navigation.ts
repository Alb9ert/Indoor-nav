import { z } from "zod"

import { RoomTypeSchema } from "./enums"
import { NodeSchema } from "./node"

/**
 * Routing preferences offered to the user. Single source of truth — the UI,
 * the navigation context, and the A* server function all reference these
 * literals (no separate "_ROUTE" suffixes, no misspellings).
 */
const RoutePreferenceSchema = z.enum(["SIMPLE", "FAST", "ACCESSIBLE"])
export type RoutePreference = z.infer<typeof RoutePreferenceSchema>

/**
 * A free-form coordinate the user picked on the map (no node, no room — just
 * a point). Stored in *map* coordinates so it has the same shape as `Node`
 * and can flow through the same conversion helpers.
 */
const MapPickedPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  floor: z.number().int(),
})
export type MapPickedPoint = z.infer<typeof MapPickedPointSchema>

/**
 * Where the user is starting from. Either a specific graph node, or a
 * free-form coordinate the user dropped on the map. A room is *not* a valid
 * start — the user must pick a representative point inside one.
 */
const NavigationStartSchema = z.union([NodeSchema, MapPickedPointSchema])
export type NavigationStart = z.infer<typeof NavigationStartSchema>

/**
 * The room shape A* expects for a destination: identity + nodes belonging
 * to the room. Shaped to match the Prisma row + nodes relation so the
 * caller can pass a Prisma `findUnique({ include: { nodes: true } })`
 * result straight through.
 */
const AstarDestinationSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  displayName: z.string().nullable(),
  isActivated: z.boolean(),
  type: RoomTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  sectionId: z.string().nullable(),
  floor: z.number().int(),
  nodes: z.array(NodeSchema),
})

/** Wire shape for an A* request. */
export const AstarInputSchema = z.object({
  profile: RoutePreferenceSchema,
  dest: AstarDestinationSchema,
  start: NavigationStartSchema,
})
export type AstarInput = z.infer<typeof AstarInputSchema>
