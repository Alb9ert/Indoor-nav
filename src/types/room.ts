import { z } from "zod"

import { RoomTypeSchema } from "./enums"

/**
 * A single polygon vertex in a floor's local 2D frame. `x` is the right
 * axis, `z` is the forward axis (matching the three.js floor plane). Three.js
 * `y` is the floor stacking dimension and is not stored here.
 */
const RoomVertexSchema = z.object({
  x: z.number(),
  z: z.number(),
})
export type RoomVertex = z.infer<typeof RoomVertexSchema>

/**
 * A room as the client knows it: identity + metadata + the polygon ring.
 * The exterior ring is open (no duplicated closing vertex).
 *
 * NOTE: this is the polygon view used by the UI. A* needs a different view
 * that includes the room's nodes — see `AstarInputSchema` in
 * `types/navigation.ts`.
 */
const RoomSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  displayName: z.string().nullable(),
  type: RoomTypeSchema,
  floor: z.number().int(),
  vertices: z.array(RoomVertexSchema),
})
export type Room = z.infer<typeof RoomSchema>

/** Server input for creating a new room. */
export const CreateRoomSchema = z.object({
  roomNumber: z.string().min(1).max(100),
  displayName: z.string().max(200).nullable().optional(),
  type: RoomTypeSchema,
  floor: z.number().int(),
  vertices: z.array(RoomVertexSchema).min(3),
})
export type CreateRoom = z.infer<typeof CreateRoomSchema>

/** Server input for updating a room's metadata (polygon untouched). */
export const UpdateRoomMetadataSchema = z.object({
  id: z.string().min(1),
  roomNumber: z.string().min(1).max(100),
  displayName: z.string().max(200).nullable().optional(),
  type: RoomTypeSchema,
})
export type UpdateRoomMetadata = z.infer<typeof UpdateRoomMetadataSchema>

export const RoomIdSchema = z.object({ id: z.string().min(1) })
