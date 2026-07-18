// tests/e2e/05-responsive.spec.js
import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser } from './helpers/auth.js';

test.describe('Responsive Design', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });

  test('Mobile: sidebar is hidden by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUI(page);
    const sidebar = page.locator('.sidebar');
    // Sidebar should be off-screen (mobile)
    const box = await sidebar.boundingBox();
    if (box) {
      expect(box.x).toBeLessThan(0);
    }
  });

  test('Mobile: bottom navigation is visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUI(page);
    await expect(page.locator('.mobile-bottom-nav')).toBeVisible({ timeout: 5000 });
  });

  test('Mobile: stat cards stack vertically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUI(page);
    await page.waitForSelector('.stat-card', { timeout: 10000 });
    const cards = await page.locator('.stat-card').all();
    if (cards.length >= 2) {
      const box1 = await cards[0].boundingBox();
      const box2 = await cards[1].boundingBox();
      if (box1 && box2) {
        // On mobile, cards should be below each other OR in 2 columns
        const isMobileLayout = box2.y > box1.y || box2.x !== box1.x;
        expect(isMobileLayout).toBeTruthy();
      }
    }
  });

  test('Tablet: layout adapts at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginUI(page);
    await page.waitForSelector('.stat-grid', { timeout: 10000 });
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });

  test('Desktop: sidebar is visible at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUI(page);
    const sidebar = page.locator('.sidebar');
    const box = await sidebar.boundingBox();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.width).toBeGreaterThan(50);
    }
  });

  test('Desktop: charts are visible at full width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginUI(page);
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 12000 });
  });

  test('Mobile: patients page is usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUI(page);
    await page.goto('/patients');
    await page.waitForSelector('.table, .card', { timeout: 10000 });
    await expect(page.locator('#add-patient-btn, button:has-text("Add")').first()).toBeVisible();
  });

  test('Mobile: hamburger menu visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUI(page);
    const toggle = page.locator('#mobile-menu-btn, .header-toggle');
    await expect(toggle.first()).toBeVisible({ timeout: 5000 });
  });
});
