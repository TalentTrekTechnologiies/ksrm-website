import { getDownloadsPublic, Download } from "./downloads-api";

/**
 * The NAAC certificate the A+ badge on /naac opens.
 *
 * It lives in a one-document section, replaced in place from Admin -> Page
 * Content -> NAAC; the server refuses a second document there. Under "naac."
 * so whoever owns the NAAC page owns it, and outside the NAAC page's own
 * document list because that list matches its section exactly.
 */
export const NAAC_CERTIFICATE_SECTION = "naac.certificate";

/** Fixed, so the admin box needs no title field. */
export const NAAC_CERTIFICATE_TITLE = "NAAC Certificate of Accreditation";

/**
 * Until the slot is filled, the certificate filed before it existed: "NAAC
 * certificate" under Mandatory Disclosure. Matched strictly - the NAAC section
 * holds ~2,000 criteria documents from the old site, and a loose match opened
 * a CATIA certification-course file from the badge.
 */
const LEGACY_TITLE = /\bnaac\b.*\bcertificate\b|\bcertificate of accreditation\b/i;

export interface NaacCertificate {
  doc: Download;
  /** False when it is the legacy document rather than the slot's own. */
  inSlot: boolean;
}

export async function getNaacCertificate(): Promise<NaacCertificate | null> {
  const slot = await getDownloadsPublic(undefined, undefined, NAAC_CERTIFICATE_SECTION).catch(() => []);
  if (slot.length > 0) return { doc: slot[0], inSlot: true };

  const groups = await Promise.all(
    ["naac", "mandatory-disclosure"].map((section) =>
      getDownloadsPublic(undefined, undefined, section).catch(() => [] as Download[]),
    ),
  );
  const legacy = groups.flat().find((d) => LEGACY_TITLE.test(d.title));
  return legacy ? { doc: legacy, inSlot: false } : null;
}
