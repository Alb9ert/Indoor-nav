import { createFileRoute } from "@tanstack/react-router"

import { LoginForm } from "#/components/login-form"

const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginForm className="w-full max-w-sm" />
    </main>
  )
}

export const Route = createFileRoute("/login")({ component: LoginPage })
