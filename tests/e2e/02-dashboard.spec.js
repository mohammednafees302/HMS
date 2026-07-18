// tests/e2e/02-dashboard.spec.js
import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser, API_BASE } from './helpers/auth.js';

test.describe('Dashboard', () => {

  test.beforeAll(async ({ request }) => {
    await ensureTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginUI(page);
  });

  test('Dashboard shows stat cards', async ({ page }) => {
    await expect(page.locator('.stat-card').first()).toBeVisible({ timeout: 10000 });
    const count = await page.locator('.stat-card').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Dashboard shows live status indicator', async ({ page }) => {
    // Either green (live) or red (unavailable) badge
    await expect(
      page.locator('text=/Live|data unavailable/i').first()
    ).toBeVisible({ timeout: 12000 });
  });

  test('Dashboard refresh button triggers data reload', async ({ page }) => {
    const refreshBtn = page.locator('#dashboard-refresh-btn');
    await expect(refreshBtn).toBeVisible({ timeout: 10000 });
    await refreshBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });

  test('Patient admissions bar chart renders', async ({ page }) => {
    await expect(page.locator('.recharts-bar, .recharts-wrapper').first()).toBeVisible({ timeout: 12000 });
  });

  test('Department distribution pie chart renders', async ({ page }) => {
    await expect(page.locator('.recharts-pie, .recharts-wrapper').first()).toBeVisible({ timeout: 12000 });
  });

  test('Monthly revenue chart renders', async ({ page }) => {
    await expect(page.locator('.recharts-area, .recharts-wrapper').first()).toBeVisible({ timeout: 12000 });
  });

  test('Today\'s appointments table is present', async ({ page }) => {
    await expect(page.locator('text=Today\'s Appointments').or(page.locator("text=Today's Appointments")).or(page.locator('.card-title').filter({ hasText: /Today/ }))).toBeVisible({ timeout: 10000 });
  });

  test('Recent Patients table is present', async ({ page }) => {
    await expect(page.locator('.card-title').filter({ hasText: /Recent Patient/i })).toBeVisible({ timeout: 10000 });
  });

  test('View All patients link navigates correctly', async ({ page }) => {
    await page.locator('#view-all-patients-btn').click();
    await expect(page).toHaveURL(/\/patients/);
  });

  test('View All appointments link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.stat-grid', { timeout: 10000 });
    await page.locator('#view-all-appts-btn').click();
    await expect(page).toHaveURL(/\/appointments/);
  });

  test('Sidebar navigation to all pages works', async ({ page }) => {
    const navLinks = [
      { id: 'nav-patients',     url: '/patients' },
      { id: 'nav-doctors',      url: '/doctors' },
      { id: 'nav-appointments', url: '/appointments' },
      { id: 'nav-departments',  url: '/departments' },
      { id: 'nav-billing',      url: '/billing' },
      { id: 'nav-reports',      url: '/reports' },
    ];
    for (const link of navLinks) {
      const menuBtn = page.locator('#mobile-menu-btn');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await expect(page.locator('.sidebar')).toHaveClass(/mobile-open/);
        await page.waitForTimeout(300);
      }
      await page.locator(`#${link.id}`).click({ force: true });
      await expect(page).toHaveURL(new RegExp(link.url));
      await page.waitForTimeout(500);
    }
  });

  test('API: GET /dashboard/stats returns 200 with correct shape', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@hms.test', password: 'Admin@1234' },
    });
    const { data: auth } = await loginRes.json();
    const res = await request.get(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.stats).toBeDefined();
    expect(body.data.charts).toBeDefined();
    expect(body.data.charts.admissions).toHaveLength(12);
    expect(body.data.charts.monthlyRevenue).toHaveLength(12);
    expect(typeof body.data.stats.totalPatients).toBe('number');
    expect(typeof body.data.stats.totalDoctors).toBe('number');
  });

  test('No console errors on dashboard', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.waitForTimeout(3000);
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('DevTools'));
    expect(criticalErrors).toHaveLength(0);
  });
});
