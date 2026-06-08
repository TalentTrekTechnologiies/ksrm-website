const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapePage(browser, url, name) {
  const page = await browser.newPage();
  try {
    console.log(`📍 Scraping ${name} from ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const content = await page.evaluate(() => document.body.innerText);
    const html = await page.content();

    const scriptDir = path.join(__dirname);
    fs.writeFileSync(path.join(scriptDir, `scraped-${name}.txt`), content);
    fs.writeFileSync(path.join(scriptDir, `scraped-${name}.html`), html);

    console.log(`✅ Scraped ${name}: ${content.length} chars`);
    return { name, success: true, contentLength: content.length };
  } catch(e) {
    console.log(`❌ Failed ${name}: ${e.message}`);
    return { name, success: false, error: e.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting web scraper for KSRM pages...\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  const pages = [
    { url: 'https://ksrmce.ac.in/research', name: 'research' },
    { url: 'https://ksrmce.ac.in/gallery', name: 'gallery' },
    { url: 'https://ksrmce.ac.in/alumni', name: 'alumni' },
    { url: 'https://ksrmce.ac.in/careers', name: 'careers' },
    { url: 'https://ksrmce.ac.in/accreditation', name: 'accreditation' },
    { url: 'https://ksrmce.ac.in/nba', name: 'nba' },
    { url: 'https://ksrmce.ac.in/naac', name: 'naac' },
    { url: 'https://ksrmce.ac.in/iqac', name: 'iqac' },
  ];

  for (const pageInfo of pages) {
    const result = await scrapePage(browser, pageInfo.url, pageInfo.name);
    results.push(result);
  }

  await browser.close();

  console.log('\n📊 Summary:');
  console.log('═'.repeat(50));
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const info = r.success ? `${r.contentLength} chars` : r.error;
    console.log(`${status} ${r.name.padEnd(15)} - ${info}`);
  });
  console.log('═'.repeat(50));
  console.log('\n🎉 Done! Check scripts/scraped-*.txt files for content');
}

main().catch(console.error);
