import { announcesContentChange } from './prisma.service';

/**
 * These pin the one rule that decides whether the whole public site reloads.
 *
 * It shipped as `params.model !== 'AuditLog'`, which meant the two visitor
 * tracking tables counted as content: SiteVisitDay is written on every page
 * load and SitePresence by every open tab every sixty seconds. The site polls
 * the content version every two seconds and refetches everything when it
 * moves, so with any traffic at all every visitor refetched all forty-odd
 * endpoints every couple of seconds. Nothing errored - the site just felt
 * broken, and worse the busier it got.
 */
describe('announcesContentChange', () => {
  it('announces a real content edit', () => {
    expect(announcesContentChange('update', 'Download')).toBe(true);
    expect(announcesContentChange('create', 'GalleryImage')).toBe(true);
    expect(announcesContentChange('upsert', 'PageText')).toBe(true);
    expect(announcesContentChange('delete', 'Committee')).toBe(true);
  });

  it('stays silent for visitor tracking', () => {
    // Written on every single page load.
    expect(announcesContentChange('upsert', 'SiteVisitDay')).toBe(false);
    // Written by every open tab, every sixty seconds.
    expect(announcesContentChange('upsert', 'SitePresence')).toBe(false);
    expect(announcesContentChange('deleteMany', 'SitePresence')).toBe(false);
  });

  it('stays silent for the audit log', () => {
    // Otherwise logging a change is itself a change and it never settles.
    expect(announcesContentChange('create', 'AuditLog')).toBe(false);
  });

  it('stays silent for admin-only notifications', () => {
    expect(announcesContentChange('create', 'AdminNotification')).toBe(false);
  });

  it('ignores reads', () => {
    expect(announcesContentChange('findMany', 'Download')).toBe(false);
    expect(announcesContentChange('findFirst', 'Download')).toBe(false);
    expect(announcesContentChange('count', 'Download')).toBe(false);
    expect(announcesContentChange('aggregate', 'Download')).toBe(false);
  });

  it('announces a raw write, which has no model to judge by', () => {
    expect(announcesContentChange('executeRaw', undefined)).toBe(true);
  });
});
