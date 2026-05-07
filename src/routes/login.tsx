import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { LoginForm } from "#/components/login-form"
import { useIsLoggedIn } from "#/lib/auth-hooks"

const LoginPage = () => {
  const { isLoggedIn, isPending } = useIsLoggedIn()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && isLoggedIn) {
      void navigate({ to: "/" })
    }
  }, [isPending, isLoggedIn, navigate])

  // Avoid flashing the form to a user who's about to be redirected.
  if (isPending || isLoggedIn) return null

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginForm className="w-full max-w-sm" />
    </main>
  )
}

export const Route = createFileRoute("/login")({ component: LoginPage })
