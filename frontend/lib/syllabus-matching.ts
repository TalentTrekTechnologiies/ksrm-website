/**
 * How a syllabus document finds its branch and its regulation.
 *
 * A syllabus PDF carries no branch field and no regulation field - it is filed
 * by the words in its Title. "I & II SEM R18 ECE" lands under Electronics &
 * Communication Engineering, regulation R18.
 *
 * That rule lived only inside the public Syllabus page, which meant the admin
 * uploading the file had no way to know it existed: the upload form shows a
 * Title box and no branch anywhere, and a title that matches nothing simply
 * turns up under "Other" with no warning. Shared here so the form can tell an
 * admin what their title will do while they are still typing it, and so the
 * two can never drift apart.
 */

/**
 * A regulation code goes into a RegExp, and the code is typed by an admin - so
 * "R23+" or "R23 (new)" would otherwise be read as a pattern and either throw
 * or match the wrong files.
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Is this phrase in this title, as a word rather than as letters inside one?
 *
 * The aliases include two-letter codes, and a plain substring test made "CE"
 * match "Computer S-c-i-e-nce": every CSE syllabus was listed under Civil
 * Engineering. The boundary is applied only at an end that is itself a word
 * character, so a code written "AI&ML" or "R23+" still matches.
 *
 * The boundaries are written `\\b`, not `\b`. A template literal processes
 * escapes, so `\b` here would compile to a backspace character and the regex
 * would silently match nothing - which is how the MBA table, the IQAC minutes
 * and the academic-year parser each broke in turn.
 */
export function containsWord(title: string, phrase: string): boolean {
  if (phrase.length < 2) return false;
  const left = /^\w/.test(phrase) ? "\\b" : "";
  const right = /\w$/.test(phrase) ? "\\b" : "";
  return new RegExp(`${left}${escapeRegExp(phrase)}${right}`, "i").test(title);
}

/**
 * The names a branch's documents are actually titled with.
 *
 * The college writes "Computer Science and Engineering(R23)" or just "CSE",
 * never the "&" spelling the programme list uses, so the short forms have to
 * be known.
 */
export function branchAliases(name: string): string[] {
  // MBA has no specialisation text after the prefix - stripping it left
  // nothing to match a document against, so no MBA syllabus could ever be
  // found regardless of what was uploaded. Fall back to the full name.
  const stripped = name.replace(/^(B\.?Tech|M\.?Tech|MBA)\s*-?\s*/i, "").trim();
  const n = stripped || name.trim();
  const known: Record<string, string[]> = {
    "Computer Science & Engineering": ["Computer Science and Engineering", "CSE"],
    "Electronics & Communication Engineering": ["Electronics and Communication Engineering", "ECE"],
    "Electrical & Electronics Engineering": ["Electrical and Electronics Engineering", "EEE"],
    "Mechanical Engineering": ["Mechanical", "ME"],
    "Civil Engineering": ["Civil", "CE"],
    "CSE (AIML)": ["AIML", "AI & ML", "Artificial Intelligence and Machine Learning"],
    "CSE (Data Science)": ["Data Science", "AIDS"],
    AIML: ["Artificial Intelligence and Machine Learning", "AI & ML"],
    AIDS: ["Artificial Intelligence and Data Science", "Data Science"],
    "Power Systems": ["PS", "Power System"],
    "VLSI & Embedded Systems": ["VLSI", "Embedded Systems"],
    "Structural Engineering": ["Structural"],
    "Geotechnical Engineering": ["Geotechnical", "GE"],
  };
  return [n, ...(known[n] ?? [])];
}

/** Does this document belong to this branch? Matched on the title wording. */
export function docMatchesBranch(title: string, name: string): boolean {
  return branchAliases(name).some((alias) => containsWord(title, alias));
}

/** Does this document belong to this regulation? Matched on the title. */
export function docMatchesReg(title: string, code: string): boolean {
  return containsWord(title, code);
}
