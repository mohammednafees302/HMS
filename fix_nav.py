import re

for filename in ['tests/e2e/03-patients.spec.js', 'tests/e2e/04-ui-features.spec.js']:
    with open(filename, 'r') as f:
        content = f.read()
    
    replacement = r'''const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('.menu-toggle');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-\1').click();'''
    
    new_content = re.sub(r'await page\.locator\(\'#nav-(.*?)\'\)\.click\(\);', replacement, content)
    
    with open(filename, 'w') as f:
        f.write(new_content)
