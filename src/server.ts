import handler, { createServerEntry } from "@tanstack/react-start/server-entry"
import { initGraph } from "./server/graph.server"

const graphSucceed = await initGraph()
console.log("Graph instance initilized")

if (!graphSucceed) {
  console.error("Graph failed to init")
  process.exit(1)
}

export default createServerEntry({
  async fetch(request) {
    return handler.fetch(request)
  },
})
