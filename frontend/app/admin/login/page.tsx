"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth-api"
import { setToken, setStoredAdmin } from "@/lib/auth"
import { ApiError } from "@/lib/api-client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const { accessToken, admin } = await login(email, password)
      setToken(accessToken)
      setStoredAdmin(admin)
      router.push("/admin/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reach the server. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{ background: "var(--color-cream)" }}
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-[var(--shadow-card)]">
        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-navy)" }}
          className="mb-1 text-2xl font-bold"
        >
          Admin Login
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          K.S.R.M College of Engineering CMS
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ background: "var(--color-navy)" }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  )
}
