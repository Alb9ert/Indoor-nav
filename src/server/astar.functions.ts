import { createServerFn } from "@tanstack/react-start"

import { AstarInputSchema } from "#/types/navigation"

import { astar } from "./astar.server"

export const astarFunction = createServerFn({ method: "GET" })
  .inputValidator(AstarInputSchema)
  .handler(async ({ data }) => {
    return await astar(data.profile, data.dest, data.start)
  })
