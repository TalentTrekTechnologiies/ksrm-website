const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  // Count DB rows storing absolute localhost URLs (break in production)
  const checks = [
    ['Faculty.photoUrl', () => p.faculty.count({ where: { photoUrl: { contains: 'localhost' } } })],
    ['Download.fileUrl', () => p.download.count({ where: { fileUrl: { contains: 'localhost' } } })],
    ['GalleryImage.imageUrl', () => p.galleryImage.count({ where: { imageUrl: { contains: 'localhost' } } })],
    ['News.imageUrl', () => p.news.count({ where: { imageUrl: { contains: 'localhost' } } })],
    ['Event.imageUrl', () => p.event.count({ where: { imageUrl: { contains: 'localhost' } } })],
    ['HomepageHero.videoUrl', () => p.homepageHero.count({ where: { videoUrl: { contains: 'localhost' } } })],
    ['CareerApplication.resumeUrl', () => p.careerApplication.count({ where: { resumeUrl: { contains: 'localhost' } } })],
    ['SiteSetting.value', () => p.siteSetting.count({ where: { value: { contains: 'localhost' } } })],
  ];
  for (const [label, fn] of checks) {
    try { console.log(label.padEnd(30), await fn()); } catch (e) { console.log(label.padEnd(30), 'ERR', e.message.slice(0,60)); }
  }
  // external ksrmce.ac.in URLs still in DB
  console.log('Download.fileUrl ksrmce.ac.in', await p.download.count({ where: { fileUrl: { contains: 'ksrmce.ac.in' } } }));
  // content gaps
  console.log('--- content ---');
  const depts = await p.department.findMany({ select: { name: true, _count: { select: { faculty: true } } } });
  depts.forEach(d => console.log('faculty:', d.name.padEnd(45), d._count.faculty));
  console.log('admins total:', await p.admin.count());
  await p.$disconnect();
})();
