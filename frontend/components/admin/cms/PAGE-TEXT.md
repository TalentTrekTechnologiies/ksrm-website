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

## Two kinds of slot

**Fixed slots** are one piece of text in one place — a heading, an intro
paragraph:

```tsx
<h2><CmsText section="about" slot="vision-mission" /></h2>
```

**Array slots** cover the repeated content a page maps over — facility cards,
rule lists, committee tables. They are keyed by position, and the page's own
array supplies both the defaults and the item count:

```tsx
{facilities.map((f, _i) => (
  <div key={f.title}>
    <h3><CmsText section="campus-facilities" slot={`facilities.${_i}.title`} /></h3>
    <p><CmsText section="campus-facilities" slot={`facilities.${_i}.desc`} /></p>
  </div>
))}
```

An admin can reword any item. **Adding or removing items is still a code
change** — the array decides how many there are. If you change the array, the
registry defaults for that page must be regenerated or they will drift out of
step with what the page renders.

> Arrays that are filtered, sliced or sorted before `.map()` are deliberately
> not slotted: the callback index would no longer match the array position the
> slots are keyed on, so item 3 could show item 5's text.

## Where the registry lives

Two files, merged at import:

| File | Contents |
|---|---|
| `lib/page-text-registry.generated.ts` | Produced by the one-time migration that lifted 49 pages' wording out of their JSX. Do not hand-edit. |
| `lib/page-text-registry.ts` | Types, helpers, and hand-curated entries — spread **on top**, so a page curated by hand wins over its generated entry. |

The Library entry is the worked example of a curated page: meaningful slot ids
(`about.p1`) and labels ("First paragraph") instead of the generated
text-derived ones. Curating a page is optional; the generated entries work as
they are.

## Adding a page

1. **Register the slots.** Add an entry to `PAGE_TEXT` in
   `frontend/lib/page-text-registry.ts`, keyed by the page's section slug. Move
   the page's wording into `slots` **verbatim** — this is the text the site will
   ship, so a paraphrase here changes the live site.

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
