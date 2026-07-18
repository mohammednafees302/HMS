const fs = require('fs');
const files = ['tests/e2e/03-patients.spec.js', 'tests/e2e/04-ui-features.spec.js'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const replacement = `const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('.menu-toggle');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-$1').click();`;
  content = content.replace(/await page\.locator\('#nav-(.*?)'\)\.click\(\);/g, replacement);
  fs.writeFileSync(file, content);
});
