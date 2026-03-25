import handler, { createServerEntry } from "@tanstack/react-start/server-entry"

import { initGraph } from "./server/graph.server"

await initGraph()
console.log("Graph instance initialized")

export default createServerEntry({
  async fetch(request) {
    return handler.fetch(request)
  },
})
