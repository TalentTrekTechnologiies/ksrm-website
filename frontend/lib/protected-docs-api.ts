import { apiGet } from "./api-client";
import { API_BASE } from "./api-base";

/**
 * Documents that are shown but never handed over.
 *
 * The browser is sent one flattened, watermarked page image at a time, so
 * there is no PDF on the device to save, no text to select, and a shared page
 * is one page carrying the address it was served to.
 */
export interface ProtectedDocMeta {
  id: number;
  title: string;
  pages: number;
  /** Signed permit for this document's pages. Expires; reopen to renew. */
  token: string;
  expiresInMs: number;
}

export const getProtectedDocMeta = (id: number) =>
  apiGet<ProtectedDocMeta>(`/protected-docs/${id}/meta`);

/**
 * The URL of one page image.
 *
 * Built rather than fetched through the API client on purpose: it goes into an
 * <img src>, so the browser streams it and shows it progressively instead of
 * the page waiting on a buffer it then has to hold in memory.
 */
export const protectedPageUrl = (id: number, page: number, token: string) =>
  `${API_BASE}/protected-docs/${id}/page/${page}?t=${encodeURIComponent(token)}`;
