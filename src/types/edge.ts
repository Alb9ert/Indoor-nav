import { z } from "zod"

/** Server input for creating an edge between two nodes. */
export const CreateEdgeSchema = z.object({
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  distance: z.number().positive(),
  doors: z.boolean().optional(),
  stairs: z.boolean().optional(),
  elevators: z.boolean().optional(),
  isActivated: z.boolean().optional(),
})

export const EdgeIdSchema = z.object({ id: z.string().min(1) })
