# Academics → Syllabus, in the CMS

**Where:** Admin → Academics → **Syllabus** tab.
Deliberately not under Page Content: this is the structure of an Academics
page, and it sits with the programme list it draws its branches from.

## What it replaced

The public page carried three headings written into its code — B.Tech (UG),
M.Tech (PG), MBA — each with its regulations in a const array beside it.
Renaming a heading, retiring R15 or offering a new course all needed a
developer and a deploy. BCA was approved for AY 2026-27 while the page still
knew about three programmes.

## The two things you edit

**A programme** is one heading on the page.

| Field | What it does |
|---|---|
| Heading | What the accordion says. Rename freely. |
| Branches to list | Which programmes appear as cards under it. They come from the Programmes tab, so a branch added there shows up here too. |
| Only branches whose name contains | Narrows that list. M.Tech and MBA are both PG, so each takes only its own with `tech` and `mba`. |
| Note under the heading | Optional line of text. |
| Visible on the site | Hides the heading without deleting it. |

Pick **"No branches"** for a course that has one syllabus rather than one per
specialisation — BCA, for instance. It then gets a single card, and its
documents are found by the heading's own name (or by whatever is in "name
contains", if set).

**A regulation** is a group of documents under each branch — R19, R23, R26.

| Field | What it does |
|---|---|
| Code | Matched against the uploaded filenames. `R23` finds "Civil Engineering(R23) Syllabus". It has to be the exact text in the filename. |
| Shown as | What the page displays. Blank shows the code. |

## How a document reaches the page

Documents are uploaded as usual under **Downloads**, with the page section set
to **Syllabus**. Nothing here uploads files; the headings only decide how they
are grouped. A document is filed under a branch if its title contains that
branch's name or a known short form of it, and under a regulation if its title
contains that regulation's code as a whole word. Anything that matches a branch
but no regulation is grouped as "Other" rather than dropped.

## Ordering

- A **new programme goes last**, so B.Tech stays above a newly added course.
- A **new regulation goes first**, because R26 supersedes R23 and that is the
  one most students want.

Both are just a starting position — drag to change it, and what you set is kept.

## When it is empty

The page falls back to the three headings it has always shown. So the migration
and the deploy on their own change nothing a visitor sees; the page switches
over the moment the first programme is added here.

## Permissions

`syllabus_programmes.view` / `.create` / `.update` / `.delete` / `.restore`,
granted to the **Academics** role by the seed. A Super Admin has them already.
Run `npx prisma db seed` after deploying, or the Academics role will not see the
tab.
