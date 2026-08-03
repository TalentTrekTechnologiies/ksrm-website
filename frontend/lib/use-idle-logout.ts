"use client"

import { useEffect } from "react"
import { clearSession } from "./auth"

/**
 * Signs an admin out after a period of no activity.
 *
 * The session token itself is long-lived, which is convenient but means an
 * unattended browser on a shared machine - a department office, the exam
 * section - stays logged in indefinitely. This closes that: leave the desk, and
 * the session is gone when you come back.
 *
 * Last-activity is kept in localStorage rather than in a React ref, so every
 * open tab agrees on it. Working in one tab keeps the others alive, and the
 * timeout is measured from the last real interaction anywhere - not from when a
 * particular tab happened to mount.
 *
 * Deliberately client-side only. It is a convenience against an unattended
 * screen, not a security boundary: the API's JWT expiry is what actually limits
 * a stolen token, and that is enforced server-side where it cannot be bypassed.
 */

const ACTIVITY_KEY = "ksrm_admin_last_activity"

/** How long an admin may idle before being signed out. */
export const IDLE_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_ADMIN_IDLE_MS ?? 15 * 60 * 1000,
)

// How often to compare now against the last activity. Fine-grained enough that
// the sign-out lands close to the limit, coarse enough to cost nothing.
const CHECK_INTERVAL_MS = 15_000

// Pointer moves fire continuously; writing localStorage on each would be
// wasteful, and second-level precision is plenty for a fifteen-minute window.
const WRITE_THROTTLE_MS = 5_000

const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
  "pointermove",
] as const

function markActive() {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
  } catch {
    // Private mode or a full quota - idle logout simply won't apply.
  }
}

function lastActive(): number {
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY)
    const value = raw ? Number(raw) : NaN
    return Number.isFinite(value) ? value : Date.now()
  } catch {
    return Date.now()
  }
}

/**
 * @param enabled  false on the login page and the preview iframe, where there
 *                 is no session to end.
 * @param onExpire called once when the idle limit is reached.
 */
export function useIdleLogout(enabled: boolean, onExpire: () => void) {
  useEffect(() => {
    if (!enabled) return

    // Opening a page is itself activity - otherwise a tab opened after a long
    // pause would sign out on its first check.
    markActive()

    let lastWrite = Date.now()
    const onActivity = () => {
      const now = Date.now()
      if (now - lastWrite < WRITE_THROTTLE_MS) return
      lastWrite = now
      markActive()
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }

    // Returning to a tab counts as activity; without this, switching away for
    // longer than the timeout would sign you out the moment you came back,
    // even though you were working in another tab of the same session.
    const onVisible = () => {
      if (document.visibilityState === "visible") onActivity()
    }
    document.addEventListener("visibilitychange", onVisible)

    let fired = false
    const timer = setInterval(() => {
      if (fired) return
      if (Date.now() - lastActive() < IDLE_TIMEOUT_MS) return
      fired = true
      clearSession()
      onExpire()
    }, CHECK_INTERVAL_MS)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
    }
  }, [enabled, onExpire])
}
