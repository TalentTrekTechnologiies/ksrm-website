#!/usr/bin/env node

/**
 * Banner Validation Script
 * Checks that all pages have proper hero banner images and no blue overlays
 */

const fs = require('fs');
const path = require('path');

const ISSUES = {
  noBanner: [],
  blueBanner: [],
  missingFile: [],
  noHeroSection: [],
  passed: [],
};

const BANNER_PATHS = [
  '/banners/',
  '/gallery/Gallery _ KSRM College of Engineering_files/',
];

function checkFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for hero section
    const hasHeroClass = content.includes('hero') || content.includes('Hero');
    const hasSection = content.includes('<section');

    if (!hasSection) {
      ISSUES.noHeroSection.push(relativePath);
      return;
    }

    // Check for blue gradients (the old style we're removing)
    const hasBlueGradient = content.match(/linear-gradient\s*\([^)]*#2B3490|linear-gradient\s*\([^)]*#1e2570|linear-gradient\s*\([^)]*#1a1d4d/);
    if (hasBlueGradient) {
      ISSUES.blueBanner.push(`${relativePath} - Found blue gradient`);
      return;
    }

    // Check for background-image with banner or filtered folder
    const hasBannerImage = BANNER_PATHS.some(bannerPath =>
      content.includes(`url('${bannerPath}`) || content.includes(`url("${bannerPath}`)
    );

    if (!hasBannerImage) {
      // Check if it has any background-image at all (other than blue)
      const hasBackgroundImage = content.includes('backgroundImage:') || content.includes('background-image:');
      if (!hasBackgroundImage) {
        ISSUES.noBanner.push(relativePath);
        return;
      }
    }

    ISSUES.passed.push(relativePath);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

function validateAllPages() {
  const appDir = path.join(__dirname, '../app');

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && file !== 'node_modules') {
        walkDir(fullPath);
      } else if (file === 'page.tsx') {
        const relativePath = path.relative(appDir, fullPath);
        checkFile(fullPath, relativePath);
      }
    });
  }

  walkDir(appDir);
}

function printResults() {
  console.log('\n=== BANNER VALIDATION RESULTS ===\n');

  console.log(`✅ PASSED (${ISSUES.passed.length}):`);
  ISSUES.passed.slice(0, 20).forEach(p => console.log(`   ${p}`));
  if (ISSUES.passed.length > 20) console.log(`   ... and ${ISSUES.passed.length - 20} more`);

  if (ISSUES.noBanner.length > 0) {
    console.log(`\n❌ NO BANNER DETECTED (${ISSUES.noBanner.length}):`);
    ISSUES.noBanner.forEach(p => console.log(`   ${p}`));
  }

  if (ISSUES.blueBanner.length > 0) {
    console.log(`\n🔵 BLUE GRADIENT FOUND (${ISSUES.blueBanner.length}):`);
    ISSUES.blueBanner.forEach(p => console.log(`   ${p}`));
  }

  if (ISSUES.noHeroSection.length > 0) {
    console.log(`\n⚠️  NO HERO SECTION (${ISSUES.noHeroSection.length}):`);
    ISSUES.noHeroSection.forEach(p => console.log(`   ${p}`));
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total Pages Checked: ${Object.values(ISSUES).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log(`Passed: ${ISSUES.passed.length}`);
  console.log(`Issues Found: ${ISSUES.noBanner.length + ISSUES.blueBanner.length}`);

  return ISSUES.noBanner.length + ISSUES.blueBanner.length === 0;
}

validateAllPages();
const allPassed = printResults();

process.exit(allPassed ? 0 : 1);
