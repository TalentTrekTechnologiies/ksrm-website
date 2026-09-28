"use client"

/**
 * Reacting to the browser events that sometimes accompany a screen capture.
 *
 * The honest framing, because the timing decides everything: a screenshot is
 * taken by the operating system, and the browser is told about it - when it is
 * told at all - either afterwards or not at all. So this cannot prevent a
 * capture. The question it exists to answer is narrower and testable: for each
 * capture method, does an event reach the page, and does the page repaint
 * before the pixels are taken?
 *
 * What is known about each method before testing, and worth knowing because it
 * sets expectations:
 *
 *   PrintScreen      Windows usually delivers keyup, not keydown, and delivers
 *                    it AFTER the framebuffer has been grabbed. Reacting to it
 *                    protects the next capture, not the one that just happened.
 *   Win+Shift+S      The snip overlay freezes an image of the screen at the
 *                    moment it is invoked. The page's blur arrives after that
 *                    freeze, so hiding cannot affect what was captured.
 *   Snipping Tool    Opening the app takes focus, and the capture happens when
 *                    the user then drags a rectangle - seconds later. This is
 *                    the one method where reacting to blur plausibly works.
 *   Browser capture  Rendered from the page by the browser itself. No event.
 *   Extensions       captureVisibleTab. No event.
 *
 * None of that is asserted as a result. It is the hypothesis the lab exists to
 * check on the actual deployment machines.
 */

export type ProtectionResponse = "hide" | "obscure" | "watermark"

export interface CaptureEvent {
  /** Which browser event fired. */
  kind: "printscreen-down" | "printscreen-up" | "blur" | "visibility" | "manual"
  /** performance.now() when the handler ran. */
  at: number
  /** Milliseconds from the handler running to the response being painted. */
  paintLatencyMs?: number
}

/**
 * Time from the event handler to the frame carrying the response being
 * presented.
 *
 * Two rAFs: the first fires before the coming paint, the second after it has
 * been composited. That is the closest a page can get to "the new pixels are
 * on screen", and it is the number that decides whether reacting is worth
 * anything at all - if the OS grabs the framebuffer before this elapses, the
 * response changes nothing.
 */
export function measurePaintLatency(from: number, done: (ms: number) => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      done(performance.now() - from)
    })
  })
}
