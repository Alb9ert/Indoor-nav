import { z } from "zod"

import { NodeTypeSchema } from "./enums"

/**
 * A graph node, mirroring the Prisma `Node` row 1:1. `(x, y)` are the
 * floor-plane coordinates in this floor's local frame; `z` is reserved for
 * future use by transit nodes (currently unused by the renderer); `floor`
 * is the floor index.
 */
export const NodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  type: NodeTypeSchema,
  isActivated: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  roomId: z.string().nullable(),
  floor: z.number().int(),
})
export type Node = z.infer<typeof NodeSchema>

/** Server input for creating a node. */
export const CreateNodeSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  type: NodeTypeSchema,
  floor: z.number().int(),
  isActivated: z.boolean().optional(),
  roomId: z.string().optional(),
})

/** Server input for updating a node's metadata + position. */
export const UpdateNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeSchema,
  x: z.number(),
  y: z.number(),
})

export const NodeIdSchema = z.object({ id: z.string().min(1) })

/**
 * A node draft held in the UI before it's persisted. Same shape as a
 * `CreateNode` input plus the link back to the source room (if the user
 * dropped the pin inside one).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PendingNodeSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  floor: z.number().int(),
  roomId: z.string().optional(),
})
export type PendingNode = z.infer<typeof PendingNodeSchema>

/** Server input for creating a transit (stair / elevator) chain across floors. */
export const CreateTransitNodesSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  type: z.enum(["STAIR", "ELEVATOR"]),
  floors: z.array(z.number().int()).min(1),
  isActivated: z.boolean().optional(),
  roomId: z.string().optional(),
})
