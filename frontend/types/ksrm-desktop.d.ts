/**
 * The desktop viewer's bridge, when the page is running inside it.
 *
 * Optional on purpose: the same build is served to ordinary browsers, where
 * this is absent and every caller has to cope with that. See `desktop/`.
 */
export interface KsrmDesktopBridge {
  available: true
  /**
   * Exclude the window from screen capture while a document is on screen.
   *
   * Resolves with whether protection is actually in force. Check it - a page
   * that assumes it succeeded would tell the reader a document is protected
   * when it is not.
   */
  setProtected(on: boolean): Promise<boolean>
}

declare global {
  interface Window {
    ksrmDesktop?: KsrmDesktopBridge
  }
}

export {}
