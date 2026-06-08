const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function downloadImageViaPlaywright(browser, imageUrl, filepath) {
  try {
    const page = await browser.newPage();
    const response = await page.goto(imageUrl);
    const buffer = await response.body();

    const outputDir = path.dirname(filepath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(filepath, buffer);

    if (buffer.length > 10000) {
      console.log(`✅ Downloaded: ${path.basename(filepath)} (${buffer.length} bytes)`);
      await page.close();
      return true;
    } else {
      fs.unlinkSync(filepath);
      console.log(`❌ Fake: ${path.basename(filepath)} (${buffer.length} bytes)`);
      await page.close();
      return false;
    }
  } catch(e) {
    console.log(`❌ Error: ${path.basename(filepath)} - ${e.message}`);
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const depts = [
    { url: 'https://ksrmce.ac.in/csen.php', dept: 'cse', imageSelector: 'img' },
    { url: 'https://ksrmce.ac.in/eeen.php', dept: 'eee', imageSelector: 'img' },
    { url: 'https://ksrmce.ac.in/ecen.php', dept: 'ece', imageSelector: 'img' },
    { url: 'https://ksrmce.ac.in/cen.php', dept: 'civil', imageSelector: 'img' },
    { url: 'https://ksrmce.ac.in/mech.php', dept: 'mechanical', imageSelector: 'img' },
  ];

  for (const { url, dept, imageSelector } of depts) {
    console.log(`\n🌐 Loading ${dept}: ${url}`);

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Scroll to load lazy images
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);

      // Extract all image URLs
      const imageUrls = await page.$$eval(imageSelector, images =>
        images
          .map(img => {
            // Try multiple attributes
            const src = img.src || img.getAttribute('src') || img.dataset.src;
            return src;
          })
          .filter(src => src && (src.includes('faculty') || src.includes('photo') || src.includes('CSE') || src.includes('EEE')))
          .filter((url, idx, arr) => arr.indexOf(url) === idx) // deduplicate
      );

      console.log(`Found ${imageUrls.length} potential faculty images`);

      if (imageUrls.length > 0) {
        const outputDir = path.join(__dirname, `../public/images/departments/${dept}/faculty`);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        let count = 0;
        for (const imgUrl of imageUrls) {
          // Convert relative URLs to absolute
          let absoluteUrl = imgUrl;
          if (imgUrl.startsWith('/')) {
            absoluteUrl = new URL(imgUrl, url).href;
          } else if (!imgUrl.startsWith('http')) {
            absoluteUrl = new URL(imgUrl, url).href;
          }

          // Extract clean filename
          const urlObj = new URL(absoluteUrl);
          let filename = path.basename(urlObj.pathname);
          if (!filename || filename === '' || !filename.includes('.')) {
            filename = `image-${count++}.jpg`;
          }

          const filepath = path.join(outputDir, filename);
          const success = await downloadImageViaPlaywright(browser, absoluteUrl, filepath);
          if (success) count++;
        }

        console.log(`✅ ${dept}: ${count} images saved`);
      } else {
        console.log(`ℹ ${dept}: No faculty images found on page`);
      }

      await context.close();
    } catch(e) {
      console.log(`❌ Error loading ${dept}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 Download complete!');
}

main().catch(console.error);
