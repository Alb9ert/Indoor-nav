import { z } from "zod"

import { NodeType, RoomType } from "#/generated/prisma/enums"

/**
 * Zod schemas for the Prisma-generated enums. Using `z.nativeEnum` keeps the
 * literal narrowing on the values (so `z.infer<typeof RoomTypeSchema>` is the
 * RoomType union, not just `string`).
 */
export const RoomTypeSchema = z.enum(RoomType)
export const NodeTypeSchema = z.enum(NodeType)

export { type RoomType } from "#/generated/prisma/enums"
