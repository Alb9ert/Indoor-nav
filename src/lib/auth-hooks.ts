import { authClient } from "./auth-client"

export function useIsLoggedIn() {
  const { data, isPending } = authClient.useSession()
  return {
    isLoggedIn: !!data?.session,
    isPending,
  }
}
