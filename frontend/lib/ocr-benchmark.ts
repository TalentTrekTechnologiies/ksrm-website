/**
 * Scoring for the camera-resistance experiment: how much of the document does
 * a photograph actually give away?
 *
 * The first measurement was mean Laplacian response, which says how much fine
 * detail an image carries. That is a proxy, and a poor one - a photograph can
 * be covered in stripes and still transcribe perfectly, which is the outcome
 * that matters and the one the proxy misses entirely. What counts is whether
 * the text can be recovered, so the text is recovered and compared.
 *
 * Two figures, because they fail differently:
 *
 *   Character accuracy (1 - CER) - how close the transcription is overall. A
 *     page mangled into near-gibberish scores low here.
 *   Word recall - the share of the document's words recovered exactly. This is
 *     the one to read for "could somebody copy this": a leaker does not need
 *     every character, they need the words.
 */

/** Case, punctuation and whitespace removed - OCR differs on all three in ways nobody cares about. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'"().,%\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function words(text: string): string[] {
  return normalise(text)
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean)
}

/**
 * Levenshtein distance, two rows at a time.
 *
 * A full matrix for two pages of text is millions of cells and enough to lock
 * the tab; only the previous row is ever needed.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = new Uint32Array(b.length + 1)
  let curr = new Uint32Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    const ca = a.charCodeAt(i - 1)
    for (let j = 1; j <= b.length; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    const swap = prev
    prev = curr
    curr = swap
  }
  return prev[b.length]
}

export interface OcrScore {
  /** 1 - CER, clamped to 0. 1.00 means a perfect transcription. */
  characterAccuracy: number
  /** Share of the reference's words recovered exactly, counting repeats. */
  wordRecall: number
  referenceWords: number
  recoveredWords: number
  /** What the engine actually read, for eyeballing when a score looks wrong. */
  transcript: string
}

export function scoreTranscript(reference: string, recognised: string): OcrScore {
  const ref = normalise(reference)
  const got = normalise(recognised)

  const distance = editDistance(ref, got)
  const characterAccuracy = ref.length === 0 ? 0 : Math.max(0, 1 - distance / ref.length)

  // Multiset intersection, so a transcript that repeats one correct word forty
  // times cannot score as though it recovered forty words.
  const refWords = words(reference)
  const gotCounts = new Map<string, number>()
  for (const w of words(recognised)) gotCounts.set(w, (gotCounts.get(w) ?? 0) + 1)

  let recovered = 0
  for (const w of refWords) {
    const left = gotCounts.get(w) ?? 0
    if (left > 0) {
      recovered += 1
      gotCounts.set(w, left - 1)
    }
  }

  return {
    characterAccuracy,
    wordRecall: refWords.length === 0 ? 0 : recovered / refWords.length,
    referenceWords: refWords.length,
    recoveredWords: recovered,
    transcript: recognised.trim(),
  }
}

/**
 * Runs OCR on an image.
 *
 * tesseract.js is loaded on demand - it pulls a WASM core and a language pack
 * of some tens of megabytes, which has no business being in the bundle of a
 * page nobody visits. The lab is the only caller.
 */
export async function recogniseImage(
  image: Blob | string | HTMLCanvasElement,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker("eng", undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress?.(m.progress)
    },
  })
  try {
    const { data } = await worker.recognize(image as never)
    return data.text ?? ""
  } finally {
    await worker.terminate()
  }
}
