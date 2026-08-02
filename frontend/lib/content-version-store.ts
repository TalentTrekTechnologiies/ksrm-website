"use client"

import { apiGet } from "./api-client"

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
 */

const POLL_MS = Number(process.env.NEXT_PUBLIC_VERSION_POLL_MS ?? 2000)

type Listener = () => void

const listeners = new Set<Listener>()
let timer: ReturnType<typeof setInterval> | null = null
let lastVersion: number | null = null
let failures = 0

// After repeated failures, back off rather than hammering a struggling API.
const MAX_BACKOFF_MS = 60_000

function scheduleNext(delay: number) {
  if (timer !== null) clearInterval(timer)
  timer = setInterval(check, delay)
}

async function check() {
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
      listeners.forEach((fn) => fn())
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
      // Forget the baseline: on the next subscribe, whatever the server says
      // becomes the new starting point rather than firing a spurious change.
      lastVersion = null
    }
  }
}
