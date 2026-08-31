/**
 * Removes every real identity from a recorded API response.
 *
 * The output of this is a PUBLIC static file, so the rule here is: anything
 * that is not positively known to be safe gets replaced. The cost of over-
 * scrubbing is a slightly duller demo; the cost of under-scrubbing is
 * publishing a real person's photograph, phone number or a student's records
 * on a host they have never heard of.
 *
 * What survives on purpose: structure, counts, dates, section labels, and the
 * generic shape of the content. That is what makes the specimen convincing -
 * the demo has as many departments, documents and notices as the real site,
 * so the layouts fill out exactly as they do in production.
 */

export const DEMO_NAME = "Talent Trek Technologies";
export const DEMO_SHORT = "Talent Trek";
// Their own site, so links in the specimen point somewhere real and useful
// to a prospective client rather than at a dead example domain.
export const DEMO_DOMAIN = "talenttrektechnologies.netlify.app";

/** Placeholder assets the specimen ships with. */
const AVATAR = "/demo/person.svg";
const IMAGE = "/demo/image.svg";
const DOCUMENT = "/demo/sample.pdf";

/* ---------------------------------------------------------------- */
/* The institution                                                   */
/* ---------------------------------------------------------------- */

const INSTITUTION = [
  // The domain goes FIRST. "ksrmce.ac.in" contains "KSRMCE", so with the token
  // rule ahead of it the host became "TTIT.ac.in" - still the college's domain
  // shape, and still pointing at their media server.
  [/ksrmce\.ac\.in/gi, DEMO_DOMAIN],
  [/K\.?\s?S\.?\s?R\.?\s?M\.?\s+College\s+of\s+Engineering/gi, DEMO_NAME],
  [/KSRM\s+College\s+of\s+Engineering/gi, DEMO_NAME],
  // No word boundaries: these turn up glued into filenames the college's own
  // uploads carry - "KSRMCEAdditionalInformation", "mousksrm14may17",
  // "R14PGksrm" - and \b never matches inside a run of letters, so every one
  // of those kept the real name.
  [/KSRMCE/gi, DEMO_SHORT],
  [/KSRM/gi, DEMO_SHORT],
  [/\bKadapa\b/gi, "Springfield"],
  [/\bJNTUA\b/gi, "State Technical University"],
  [/Kandula\s+(Obul\s+Reddy\s+)?(Group\s+of\s+Institutions|Charities)/gi, "Demo Educational Trust"],
  [/\bKandula\b/gi, "Demo"],
];

/* ---------------------------------------------------------------- */
/* People                                                            */
/* ---------------------------------------------------------------- */

const FIRST = ["Anand", "Bhavna", "Chetan", "Divya", "Eshan", "Farah", "Girish", "Hema",
  "Ishaan", "Jyoti", "Karthik", "Lalita", "Manoj", "Neha", "Omkar", "Pooja",
  "Rahul", "Sneha", "Tarun", "Uma", "Varun", "Yamini", "Zoya", "Nikhil"];
const LAST = ["Rao", "Sharma", "Iyer", "Menon", "Patel", "Nair", "Gupta", "Reddy",
  "Kulkarni", "Desai", "Bose", "Chandra", "Verma", "Joshi", "Pillai", "Sethi"];

/**
 * The same real name always becomes the same fake one, so relationships hold:
 * a head of department named in a message is still the person at the top of
 * that department's faculty list.
 */
const nameMap = new Map();

function fakeName(real) {
  const key = String(real).trim().toLowerCase();
  if (nameMap.has(key)) return nameMap.get(key);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const honorific = /^(dr|prof)\b/i.test(key) ? "Dr. " : "";
  const made = `${honorific}${FIRST[hash % FIRST.length]} ${LAST[(hash >>> 5) % LAST.length]}`;
  nameMap.set(key, made);
  return made;
}

/** Field names whose value is a person's name. */
const NAME_FIELDS = new Set([
  "name", "fullName", "hodName", "memberName", "contactPerson", "coordinator",
  "principal", "author", "uploadedBy", "designationHolder", "facultyName",
]);

/** Field names whose value points at a photo, image, file or video. */
const MEDIA_FIELDS = new Set([
  "photoUrl", "imageUrl", "fileUrl", "heroImageUrl", "ogImageUrl", "thumbnailUrl",
  "videoUrl", "logoUrl", "mediaUrl", "url", "coverUrl", "bannerUrl", "aboutVideoUrl",
]);

const CONTACT_FIELDS = new Set([
  "email", "contactEmail", "phone", "mobile", "contactPhone", "phoneNumber", "address",
]);

/** Records that exist to identify one person - never worth keeping. */
const ROLL_NUMBER = /\b\d{2}9Y\d[A-Z]\d{2}[A-Z0-9]{2}\b/i;
const PERSONAL_DOC = /\b(resume|curriculum vitae|\bcv\b|aadhaar|aadhar|pan\s*card|marks?\s*memo|caste certificate|income certificate)\b/i;

export function isDroppable(record) {
  if (!record || typeof record !== "object") return false;
  const text = `${record.title ?? ""} ${record.name ?? ""} ${record.description ?? ""}`;
  if (ROLL_NUMBER.test(text) || PERSONAL_DOC.test(text)) return true;

  // Every uncatalogued document goes. On the real site 1,792 documents carry
  // no page section at all - the legacy dump the old site was imported from -
  // and that bucket is where the personal files live: staff files titled only
  // with a name ("Rajeswari.pdf"), roll-numbered student records, scans nobody
  // has ever classified. They render on no page even in production, so the
  // specimen loses nothing by dropping the lot, and no case-by-case guess
  // about whether a title names a person has to be right.
  if ("fileUrl" in record && !record.pageSection) return true;

  return false;
}

/* ---------------------------------------------------------------- */
/* Settings                                                          */
/* ---------------------------------------------------------------- */

/**
 * /site-settings/public is a flat key/value map that carries the site's whole
 * identity - its name, motto and logo. The generic rules would turn the name
 * into the demo name anyway, but the logo is a URL and would become a grey
 * placeholder, leaving the specimen with no branding at all in the header.
 */
const SETTINGS_OVERRIDES = {
  "site.collegeName": DEMO_NAME,
  "site.collegeShortName": DEMO_SHORT,
  "site.collegeMotto": "Trusting the Talent is Treasure",
  // The banner, not the bare mark. Header renders whatever site.logoUrl
  // points at across the full header width, so a 412x150 logo was blown
  // up to fill half the viewport.
  "site.logoUrl": "/demo/talenttrek-header.webp",
  "site.faviconUrl": "/demo/talenttrek-logo.png",
  // On, so the specimen demonstrates faculty cards with portraits rather than
  // initials. The portraits are the placeholder silhouette.
  faculty_show_photos: "true",
};

/** A flat map of dotted setting keys, rather than a record with an id. */
function isSettingsMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 3 && keys.filter((k) => k.includes(".")).length > keys.length / 2;
}

/* ---------------------------------------------------------------- */

function scrubString(value) {
  let out = value;
  for (const [pattern, replacement] of INSTITUTION) out = out.replace(pattern, replacement);
  // Contact details, wherever they appear - including inside prose.
  out = out.replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, `info@${DEMO_DOMAIN}`);
  out = out.replace(/(?:\+91[\s-]?)?\b[6-9]\d{9}\b/g, "+91 90000 00000");
  // Any link back to the real media server, wherever it is written - these
  // turn up in settings values ("site.popupImageUrl") and in button URLs, not
  // only in fields named after a file, so the field-aware rules never see them.
  out = out.replace(/https?:\/\/[^"\s]*\/api\/media\/file\/[^"\s]*/gi, DOCUMENT);
  out = out.replace(/\/api\/media\/file\/[\w\/-]*/gi, DOCUMENT);
  return out;
}

/** Recursively scrubs any value: strings, arrays, plain objects. */
export function scrubValue(value) {
  if (typeof value === "string") return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrubValue(v);
    return out;
  }
  return value;
}

/**
 * Scrubs one record, applying the field-aware rules first (a person's name, a
 * photograph, a phone number) and the general text rules to everything else.
 */
export function scrubRecord(record) {
  if (!record || typeof record !== "object") return scrubValue(record);
  if (Array.isArray(record)) return record.map(scrubRecord);

  if (isSettingsMap(record)) {
    const out = {};
    for (const [k, v] of Object.entries(record)) {
      out[k] = k in SETTINGS_OVERRIDES ? SETTINGS_OVERRIDES[k] : scrubValue(v);
    }
    return out;
  }

  // CMS text entries are { key, value } pairs, so the field holding a person
  // is called "value" and the fact that it IS a person is only visible in the
  // key - "library.committee.2.name" held a real head of department.
  if (typeof record.key === "string" && typeof record.value === "string") {
    const isPersonSlot = /(^|\.)name$|(^|\.)name\.|hod|principal|chairman|correspondent/i.test(record.key);
    return {
      ...scrubValue({ ...record, value: undefined }),
      value:
        isPersonSlot && looksLikePerson(record.value)
          ? fakeName(record.value)
          : scrubString(record.value),
    };
  }

  const out = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) { out[key] = value; continue; }

    if (NAME_FIELDS.has(key) && typeof value === "string" && value.trim()) {
      // A department is a "name" too - only rename it if it reads like a person.
      out[key] = looksLikePerson(value) ? fakeName(value) : scrubString(value);
      continue;
    }
    if (MEDIA_FIELDS.has(key) && typeof value === "string" && value.trim()) {
      out[key] = placeholderFor(key, value);
      continue;
    }
    if (CONTACT_FIELDS.has(key) && typeof value === "string") {
      out[key] = key === "address" ? "1 Demo Campus Road, Springfield" : scrubString(value);
      continue;
    }
    out[key] = typeof value === "object" ? scrubRecord(value) : scrubValue(value);
  }
  return out;
}

/**
 * "Dr. K. Chandra Obul Reddy" is a person; "Computer Science & Engineering" is
 * not. Departments, committees and documents all carry a `name`, so the field
 * alone does not settle it.
 */
function looksLikePerson(value) {
  const v = value.trim();
  if (/^(dr|prof|sri|smt|mr|mrs|ms)\b/i.test(v)) return true;
  // Anything naming a subject, a degree or an office is not a person.
  // "Bachelor of Computer Applications" was read as a four-word personal
  // name, and the BCA department card came out as "Sneha Nair".
  if (/\b(engineering|sciences|science|department|committee|cell|studies|college|institute|library|section|technology|management|bachelor|master|diploma|applications|computer|business|administration|board|examination|council|club|office|trust|centre|center|chapter|association|society|humanities|commerce|arts)\b/i.test(v)) return false;
  const words = v.split(/\s+/);
  return words.length >= 2 && words.length <= 5 && /^[A-Z]/.test(v) && !/\d/.test(v);
}

function placeholderFor(key, value) {
  if (/\.(pdf|docx?|xlsx?|pptx?)$/i.test(value) || key === "fileUrl") return DOCUMENT;
  if (key === "videoUrl" || key === "aboutVideoUrl") return "";
  if (key === "photoUrl") return AVATAR;
  return IMAGE;
}
