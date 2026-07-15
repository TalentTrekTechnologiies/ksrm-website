"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isLoggedIn } from "@/lib/auth"

/**
 * Bare /admin had no page, so it 404'd. Send it to the dashboard (or straight
 * to login when there is no session) rather than showing a dead end.
 *
 * Client-side by necessity: this is a static export (`output: "export"`), so
 * there is no server to issue a real redirect - the same reason AdminLayout's
 * auth guard also runs after hydration.
 */
export default function AdminIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(isLoggedIn() ? "/admin/dashboard" : "/admin/login")
  }, [router])

  return null
}
