"use client"

import { apiGet, clearApiGetCache } from "./api-client"

/**
 * Watches one number so the whole site can react the moment anything is edited.
 *
 * Every CMS-driven block used to re-fetch on its own timer. The homepage alone
 * mounts thirteen of them, so the interval had to sit at 30 seconds in
 * production to keep the request rate sane - meaning an editor could wait half
 * a minute to see their own change.
 *
 * This polls a single tiny endpoint instead. Nothing re-fetches while the
 * number holds steady; when it moves, every block reloads at once. An edit
 * shows up in about two seconds, and a visitor sitting on an idle page now
 * makes *fewer* requests than before - one small one every two seconds rather
 * than thirteen full ones every thirty.
 *
 * If the endpoint cannot be reached the signal simply never fires, and
 * useLiveData's own slow interval still refreshes content on its own. Losing
 * this makes the site slower to update, never stale forever.
 *
 * "Every block reloads at once" turned out to be the lag. During an editing
 * session the version moves with each save, so every open page reloaded all of
 * its content every few seconds - and every visitor did it in the same instant.
 * Now a change is acted on only once editing has paused (SETTLE_MS without a
 * further change), each visitor waits a random extra moment (SPREAD_MS) so
 * they do not all arrive together, and a tab nobody is looking at neither
 * polls nor reloads until it is looked at again.
 */

const POLL_MS = Number(process.env.NEXT_PUBLIC_VERSION_POLL_MS ?? 2000)
/** Quiet time after the last change before acting on it. */
const SETTLE_MS = 3000
/** Random extra wait per visitor, so reloads are spread out. */
const SPREAD_MS = 4000

type Listener = () => void

const listeners = new Set<Listener>()
let timer: ReturnType<typeof setInterval> | null = null
let lastVersion: number | null = null
let failures = 0
let reloadTimer: ReturnType<typeof setTimeout> | null = null
/** A change arrived while the tab was hidden; reload when it is shown. */
let pendingWhileHidden = false

function isHidden() {
  return typeof document !== "undefined" && document.visibilityState === "hidden"
}

function reloadEverything() {
  reloadTimer = null
  if (isHidden()) {
    pendingWhileHidden = true
    return
  }
  // Before the listeners refetch, not after: they would otherwise be served
  // the very responses this signal exists to invalidate.
  clearApiGetCache()
  listeners.forEach((fn) => fn())
}

/** Restarts the wait on every change, so a burst of saves is one reload. */
function scheduleReload() {
  if (reloadTimer !== null) clearTimeout(reloadTimer)
  reloadTimer = setTimeout(reloadEverything, SETTLE_MS + Math.random() * SPREAD_MS)
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (isHidden()) return
    if (pendingWhileHidden) {
      pendingWhileHidden = false
      scheduleReload()
    }
    // Catch up straight away rather than at the next tick.
    if (timer !== null) void check()
  })
}

// After repeated failures, back off rather than hammering a struggling API.
const MAX_BACKOFF_MS = 60_000

function scheduleNext(delay: number) {
  if (timer !== null) clearInterval(timer)
  timer = setInterval(check, delay)
}

async function check() {
  // A background tab costs nothing; it catches up when shown.
  if (isHidden()) return
  try {
    const res = await apiGet<{ version: number; changedAt: number }>("/content-version")
    if (failures > 0) {
      failures = 0
      scheduleNext(POLL_MS)
    }
    if (lastVersion === null) {
      // First reading is the baseline, not a change - otherwise every page
      // would refetch everything immediately after its first load.
      lastVersion = res.version
      return
    }
    if (res.version !== lastVersion) {
      lastVersion = res.version
      scheduleReload()
    }
  } catch {
    failures += 1
    if (failures === 3 || failures === 10) {
      scheduleNext(Math.min(POLL_MS * 2 ** Math.min(failures, 5), MAX_BACKOFF_MS))
    }
  }
}

/** Runs `fn` whenever content changes anywhere. Returns an unsubscribe. */
export function onContentChange(fn: Listener): () => void {
  listeners.add(fn)
  if (timer === null) {
    void check()
    scheduleNext(POLL_MS)
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer)
      timer = null
      if (reloadTimer !== null) clearTimeout(reloadTimer)
      reloadTimer = null
      // Forget the baseline: on the next subscribe, whatever the server says
      // becomes the new starting point rather than firing a spurious change.
      lastVersion = null
    }
  }
}
