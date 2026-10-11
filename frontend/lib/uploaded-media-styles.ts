/**
 * How an uploaded image or video is framed on a public page.
 *
 * The college uploads two very different things through the same CMS field:
 * photographs, which are landscape and look best filling their tile, and
 * notices - spot admission posters, circulars, result announcements - which are
 * portrait, text-heavy, and useless the moment a word is cut off.
 *
 * Every grid on the site used `object-fit: cover` inside a fixed-height box,
 * which is right for the photographs and wrong for the notices: it sliced the
 * heading off "SPOT ADMISSIONS 2026-27" and cut the body text mid-sentence, so
 * a visitor could not read the notice at all without opening it.
 *
 * `contain` shows whichever one was uploaded in full. The tile keeps a width
 * and a ceiling, so the page cannot be stretched by one tall poster, and the
 * frame is a neutral fill (black behind video, the usual player backdrop) so a
 * portrait image reads as a framed notice rather than a broken layout.
 *
 * Used by every surface that renders CMS-uploaded media, so a new one inherits
 * the behaviour instead of repeating the mistake.
 */
export const UPLOADED_MEDIA_STYLES = `
  .um-frame {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eef1f6;
    overflow: hidden;
  }
  .um-frame > img,
  .um-frame > video {
    width: 100%;
    height: auto;
    /* A ceiling, not a height: a landscape photo keeps its own height and a
       tall poster stops here instead of running the card off the screen. */
    max-height: 520px;
    object-fit: contain;
    display: block;
  }
  .um-frame.um-video { background: #000; }
  /* In a grid: a fixed 4:3 box, the whole image fitted inside it. A frame
     sized by its image had no height until the image arrived, so every tile
     grew as it loaded and pushed the rest of the page down - the Gallery's
     one remaining jump. Nothing is cropped; a tall poster sits in the box
     with margins either side. */
  .um-frame.um-fixed { aspect-ratio: 4 / 3; }
  .um-frame.um-fixed > img,
  .um-frame.um-fixed > video { height: 100%; max-height: none; }
  @media (max-width: 640px) {
    .um-frame > img,
    .um-frame > video { max-height: 360px; }
  }
`
