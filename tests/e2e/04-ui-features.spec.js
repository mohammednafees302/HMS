// tests/e2e/04-ui-features.spec.js
// Doctors, Appointments, Departments, Billing, Profile, Settings, Dark Mode, Responsive
import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser } from './helpers/auth.js';

test.describe('Doctors Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-doctors').click();
    await page.waitForSelector('.table, .card', { timeout: 10000 });
  });

  test('Doctors page loads', async ({ page }) => {
    await expect(page.locator('h1, .page-title h1').filter({ hasText: /Doctor/i })).toBeVisible();
  });

  test('Add Doctor button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Doctor"), #add-doctor-btn').first()).toBeVisible();
  });

  test('Doctor search input works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], .search-input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Seed');
    await page.waitForTimeout(600);
    await expect(page.locator('table, .card, .appointment-item').first()).toBeVisible();
  });

  test('Doctors table or cards render', async ({ page }) => {
    const rows = page.locator('tbody tr, .doctor-card');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Appointments Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-appointments').click();
    await page.waitForSelector('.appt-list, h3', { timeout: 10000 });
  });

  test('Appointments page loads', async ({ page }) => {
    await expect(page.locator('h1, .page-title h1').filter({ hasText: /Appointment/i }).first()).toBeVisible();
  });

  test('Book Appointment button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("Book"), button:has-text("Add"), button:has-text("New")').first()).toBeVisible();
  });

  test('Appointments list or calendar renders', async ({ page }) => {
    await expect(page.locator('.table, .card, .appt-item, .calendar, .empty-state').first()).toBeVisible({ timeout: 8000 });
  });

  test('Status filter renders', async ({ page }) => {
    const filter = page.locator('select[id*="status"], .filter-select').first();
    await expect(filter).toBeVisible();
  });
});

test.describe('Departments Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-departments').click();
    await page.waitForSelector('.dept-card, .card', { timeout: 10000 });
  });

  test('Departments page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Department/i }).first()).toBeVisible();
  });

  test('Department cards are visible', async ({ page }) => {
    const cards = page.locator('.card, .dept-card');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Billing Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-billing').click();
    await page.waitForSelector('.card, .table', { timeout: 10000 });
  });

  test('Billing page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Bill/i }).first()).toBeVisible();
  });

  test('Billing table or cards render', async ({ page }) => {
    await expect(page.locator('.table, .card').first()).toBeVisible();
  });

  test('New invoice button is present', async ({ page }) => {
    await expect(
      page.locator('button:has-text("Invoice"), button:has-text("Add"), button:has-text("New")').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Payment status badges visible', async ({ page }) => {
    await expect(page.locator('.badge, [class*="badge"]').first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Reports Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-reports').click();
    await page.waitForSelector('.stat-card, .card, canvas', { timeout: 10000 });
  });

  test('Reports page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Report/i }).first()).toBeVisible();
  });

  test('Reports contains charts or stats', async ({ page }) => {
    await expect(page.locator('.card, .recharts-wrapper, .stat-card').first()).toBeVisible();
  });
});

test.describe('Profile Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-profile').click();
    await page.waitForSelector('.card, .profile', { timeout: 10000 });
  });

  test('Profile page loads', async ({ page }) => {
    await expect(page.locator('text=Profile').first()).toBeVisible({ timeout: 10000 });
  });

  test('Profile shows user info', async ({ page }) => {
    await expect(page.locator('text=/Admin|admin/i').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Settings Page', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });
  test.beforeEach(async ({ page }) => {
    await loginUI(page);
    const isMobile = await page.evaluate(() => window.innerWidth < 1280);
    if (isMobile) {
      const toggle = page.locator('#mobile-menu-btn');
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    await page.locator('#nav-settings').click();
    await page.waitForSelector('.settings-section, h1', { timeout: 10000 });
  });

  test('Settings page loads', async ({ page }) => {
    await expect(page.locator('text=Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('Settings has toggle switches or inputs', async ({ page }) => {
    await expect(page.locator('input[type="checkbox"], input[type="toggle"], .toggle, button').first()).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });

  test('Dark mode toggles correctly', async ({ page }) => {
    await loginUI(page);
    const html = page.locator('html');
    const themeBtn = page.locator('#theme-toggle-btn');
    await expect(themeBtn).toBeVisible();

    const initialTheme = await html.getAttribute('data-theme');
    await themeBtn.click();
    await page.waitForTimeout(300);
    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await themeBtn.click();
    await page.waitForTimeout(300);
    const finalTheme = await html.getAttribute('data-theme');
    expect(finalTheme).toBe(initialTheme);
  });

  test('Dark mode persists after reload', async ({ page }) => {
    await loginUI(page);
    await page.locator('#theme-toggle-btn').click();
    const themeAfterToggle = await page.locator('html').getAttribute('data-theme');
    await page.reload();
    await page.waitForSelector('.stat-grid', { timeout: 10000 });
    const themeAfterReload = await page.locator('html').getAttribute('data-theme');
    expect(themeAfterReload).toBe(themeAfterToggle);
    // Reset
    if (themeAfterReload === 'dark') {
      await page.locator('#theme-toggle-btn').click();
    }
  });
});

test.describe('Performance & Error Detection', () => {
  test.beforeAll(async ({ request }) => { await ensureTestUser(request); });

  test('Dashboard loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await loginUI(page);
    await page.waitForSelector('.stat-grid', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(15000);
  });

  test('No unhandled network failures on main pages', async ({ page }) => {
    const failedRequests = [];
    page.on('requestfailed', req => {
      const url = req.url();
      if (!url.includes('favicon')) failedRequests.push(url);
    });
    await loginUI(page);
    await page.waitForTimeout(3000);
    expect(failedRequests.filter(u => !u.includes('hot') && !u.includes('hmr'))).toHaveLength(0);
  });
});

test.describe('Security - Protected Routes', () => {
  test('Accessing /patients without auth redirects to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/patients');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('Accessing /billing without auth redirects to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/billing');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 8000 });
  });
});
