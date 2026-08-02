# Editable page text (`CmsText`)

Lets an admin change the wording on a public page from **Page Content → *(page)* → Page Text**,
without a developer or a deploy.

## How it works

A page's wording stays in code, in `frontend/lib/page-text-registry.ts`. That
is what the static export ships and what search engines index. A row in the
`PageText` table overrides one slot of it at runtime.

So there are three states for any slot, and the third is the important one:

| State | What the page shows |
|---|---|
| No database row | The page's own wording, from the registry |
| Row with a value | The admin's wording |
| API unreachable | The page's own wording |

Because "no row" is a valid state, **deleting an override is the undo** — which
is why `PageText` has no `isActive` and no soft-delete, unlike the content
modules.

## Adding a page

1. **Register the slots.** Add an entry to `PAGE_TEXT` in
   `frontend/lib/page-text-registry.ts`, keyed by the page's `PAGE_SECTIONS`
   slug. Move the page's wording into `slots` **verbatim** — this is the text
   the site will ship, so a paraphrase here changes the live site.

   ```ts
   library: {
     label: "Library",
     path: "/campus-life/library",
     groups: [
       {
         label: "About",
         slots: [
           { id: "about.p1", label: "First paragraph", kind: "paragraph",
             default: "The Library is one of the most important facilities…" },
         ],
       },
     ],
   }
   ```

2. **Replace the JSX** with a slot reference:

   ```tsx
   <p><CmsText section="library" slot="about.p1" multiline /></p>
   ```

3. **Wrap the page** so its overrides are fetched once rather than once per
   slot:

   ```tsx
   <CmsTextProvider section="library">
     <main>…</main>
   </CmsTextProvider>
   ```

The Page Text panel appears automatically for any page in the registry. Pages
that aren't registered are unaffected — their documents, images and videos still
work as before.

## Props

### `CmsText`

| Prop | Type | Notes |
|---|---|---|
| `section` | `string` | The page's `PAGE_SECTIONS` slug |
| `slot` | `string` | Slot `id` from the registry |
| `multiline` | `boolean` | Renders the admin's line breaks (`white-space: pre-line`). Use for body paragraphs, not headings |

Renders nothing when the resolved text is empty, so an admin can blank a slot
to hide a line.

### `CmsTextProvider`

| Prop | Type | Notes |
|---|---|---|
| `section` | `string` | Fetches this page's overrides once for every `CmsText` beneath it |

Optional, but a page with more than two or three slots should use it — without
a provider each `CmsText` polls on its own.

## Slot ids are permanent

The database key is `` `${section}.${slot.id}` ``. Renaming a slot id orphans
whatever the admin wrote for it — the row stays in the table and the page
silently reverts to its default. Treat ids as permanent; change the `label`
freely, since that is only what the editor displays.

## Gotchas

- **Only the wording is editable, not the structure.** Lists, tables and card
  grids that come from arrays in the page file (holdings tables, rules lists)
  are not slots. Those need `PageTable` or their own module.
- **Empty is not the same as reset.** Saving an empty value blanks the slot on
  the page; "Restore original" deletes the row and brings the built-in wording
  back.
- **Server pages are fine.** `CmsText` is a client component and can be dropped
  into a server component, so a page keeps its `metadata` export.
