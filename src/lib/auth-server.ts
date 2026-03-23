import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "./auth"

export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getRequest()
  const session = await auth.api.getSession({ headers })
  return session
})

export async function requireSession() {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
