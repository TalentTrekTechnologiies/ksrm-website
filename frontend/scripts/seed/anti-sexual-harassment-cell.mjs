/**
 * Creates the Anti-Sexual Harassment Cell / Women Protection Cell / Internal
 * Complaints Committee, with its 22 members, from the college's own order.
 *
 * A one-off: 22 members is a long time to type into a form, and a mistyped
 * contact number on a cell that exists to be reached is worse than most typos.
 * After this it is an ordinary committee - edited, reordered and extended in
 * Admin -> Committees like any other, which is where any later change belongs.
 *
 * Dry run by default; --write applies. Credentials come from the environment
 * so they are never written into the repository:
 *
 *   ADMIN_EMAIL=you@ksrmce.ac.in ADMIN_PASSWORD=... \
 *     node scripts/seed/anti-sexual-harassment-cell.mjs          # dry run
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *     node scripts/seed/anti-sexual-harassment-cell.mjs --write  # apply
 *
 * Safe to re-run: it refuses to create a second committee with this name, and
 * says so rather than quietly duplicating the roster.
 */
const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";
const WRITE = process.argv.includes("--write");

const COMMITTEE = {
  name: "Anti-Sexual Harassment Cell",
  type: "OTHER",
  description:
    "Anti-Sexual Harassment Cell / Women Protection Cell / Internal Complaints Committee, reconstituted to ensure zero sexual harassment cases at KSRMCE. Members are appointed for a duration of two years.",
};

// Order as the college published it; sortOrder follows the list.
const MEMBERS = [
  ["Dr. T. Nageswara Prasad", "Principal", "EEE", "Chairman", "9154925962"],
  ["Dr. G. Radha", "Professor", "H&S", "Convener", "9966815484"],
  ["Dr. C. Ravindra Murthy", "Assoc. Professor", "ECE", "Member", "9949348789"],
  ["Mrs. K. Niveditha", "Asst. Prof.", "CIVIL", "Member", "9398541093"],
  ["Mrs. K. Divya Lakshmi", "Asst. Prof.", "ECE", "Member", "9494947993"],
  ["Mrs. R. Gowthami", "Asst. Prof.", "ME", "Member", "7569827401"],
  ["Miss. Z. Shobha Rani", "Asst. Prof.", "CSE", "Member", "8309197987"],
  ["Mrs. C. Maneesha", "Asst. Prof.", "H&S", "Member", "9392520468"],
  ["Mrs. A. Suchismitha", "Asst. Prof.", "H&S", "Member", "7702350455"],
  ["Mrs. L. Sasikala", "Librarian", "Library", "Member", "9515485695"],
  ["Mr. P. Raghunatha Reddy", "Advocate", "Advocate", "Member", "9440411009"],
  ["Mrs. S. Lakshmi Devi", "Chairman, Vikasitha Foundation, Proddatur", "NGO", "Member", "6304716822"],
  ["Mrs. P.V. Suneetha", "One Stop Sakhi Centre Psychologist", "", "Member", "9052184022"],
  ["Ms. B. Revathi", "Student", "CSE (DS)", "Member", "8247530760"],
  ["Mr. M. Yaswanth Kumar Reddy", "Student", "AIML", "Member", "7989473757"],
  ["Ms. E. Maha Lakshmi", "Student", "ECE", "Member", "7386406979"],
  ["Ms. A. Jahnavi", "Student", "CSE", "Member", "9963184148"],
  ["Ms. D. Jyoshnavi", "Student", "CE", "Member", "9390253604"],
  ["Ms. N. Meghana", "Student", "EEE", "Member", "9963621563"],
  ["Mr. B. Siddiq Khan", "Student", "ME", "Member", "9704578652"],
  ["Ms. B. Mahitha", "Student", "CSE (AIML)", "Member", "6301006974"],
  ["Ms. P. Varalakshmi (W)", "Student", "MBA", "Member", "9505508586"],
];

async function login() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
    process.exit(1);
  }
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`Login failed (${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  const body = await res.json();
  const token = body.accessToken ?? body.token ?? body.access_token;
  if (!token) { console.error("Login returned no token."); process.exit(1); }
  return token;
}

const authed = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

async function main() {
  console.log(`${WRITE ? "WRITE MODE" : "DRY RUN"} - ${API}\n`);
  console.log(`Committee: ${COMMITTEE.name}`);
  console.log(`Members:   ${MEMBERS.length}\n`);
  for (const [i, [name, designation, department, role, contact]] of MEMBERS.entries()) {
    console.log(`  ${String(i + 1).padStart(2)}. ${name.padEnd(30)} ${designation.padEnd(42)} ${department.padEnd(11)} ${role.padEnd(9)} ${contact}`);
  }

  if (!WRITE) {
    console.log("\nNothing written. Re-run with --write to apply.");
    return;
  }

  const token = await login();

  const existing = await (await fetch(`${API}/committees/admin`, { headers: authed(token) })).json();
  if (Array.isArray(existing) && existing.some((c) => c.name?.trim().toLowerCase() === COMMITTEE.name.toLowerCase())) {
    console.error(`\n"${COMMITTEE.name}" already exists. Edit it in Admin -> Committees rather than seeding it twice.`);
    process.exit(1);
  }

  const created = await fetch(`${API}/committees`, {
    method: "POST", headers: authed(token), body: JSON.stringify({ ...COMMITTEE, isActive: true }),
  });
  if (!created.ok) { console.error(`\nCreating the committee failed (${created.status}): ${await created.text()}`); process.exit(1); }
  const committee = await created.json();
  console.log(`\nCreated committee #${committee.id}`);

  let added = 0;
  for (const [i, [name, designation, department, role, contact]] of MEMBERS.entries()) {
    const res = await fetch(`${API}/committees/${committee.id}/members`, {
      method: "POST",
      headers: authed(token),
      body: JSON.stringify({
        name, designation, role, sortOrder: i,
        ...(department ? { department } : {}),
        ...(contact ? { contact } : {}),
        isActive: true,
      }),
    });
    if (res.ok) added++;
    else console.error(`  member "${name}" failed (${res.status}): ${await res.text()}`);
    // Well under the API's rate limit.
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`Added ${added}/${MEMBERS.length} members.`);
  console.log(`\nNow rebuild so /committees/anti-sexual-harassment-cell exists.`);
}

main().catch((err) => { console.error("FATAL", err); process.exit(1); });
