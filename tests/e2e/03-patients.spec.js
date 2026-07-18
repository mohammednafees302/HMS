// tests/e2e/03-patients.spec.js
import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser, API_BASE } from './helpers/auth.js';

let authToken = '';
let createdPatientId = '';

test.describe('Patients', () => {

  test.beforeAll(async ({ request }) => {
    const data = await ensureTestUser(request);
    authToken = data.accessToken;
  });

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
    await page.locator('#nav-patients').click();
    // Wait for loading to complete - spinner disappears and table appears
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForSelector('.table, .card', { timeout: 15000 });
  });

  // ── UI CRUD ────────────────────────────────────────────────

  test('Patients page loads', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
  });

  test('Add Patient button opens modal', async ({ page }) => {
    await page.locator('#add-patient-btn').click({ force: true });
    await expect(page.locator('.modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#patient-name-input')).toBeVisible();
  });

  test('Create a new patient via UI', async ({ page }) => {
    await page.locator('#add-patient-btn').click({ force: true });
    await page.locator('#patient-name-input').fill('Test Patient Playwright');
    await page.locator('#patient-age-input').fill('35');
    await page.locator('#patient-phone-input').fill('+919999900001');
    await page.locator('#patient-diagnosis-input').fill('Playwright Test Diagnosis');
    await page.locator('#modal-submit-btn').click({ force: true });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Test Patient Playwright').first()).toBeVisible({ timeout: 8000 });
  });

  test('Search patients filters table', async ({ page }) => {
    await page.locator('#patient-search').fill('Aisha');
    await page.waitForTimeout(600);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0 && !(await rows.first().locator('text=No patients').isVisible())) {
      await expect(rows.first().locator('td').first()).toContainText(/Aisha|test/i);
    }
  });

  test('Status filter works', async ({ page }) => {
    await page.locator('#patient-status-filter').selectOption('ACTIVE');
    await page.waitForTimeout(700);
    await expect(page.locator('table.table')).toBeVisible();
  });

  test('Department filter works', async ({ page }) => {
    await page.locator('#patient-dept-filter').selectOption('Cardiology');
    await page.waitForTimeout(700);
    await expect(page.locator('table.table')).toBeVisible();
  });

  test('View patient details navigates to full page', async ({ page }) => {
    const firstViewBtn = page.locator('tbody tr').first().locator('button').first();
    await firstViewBtn.click({ force: true });
    await expect(page.locator('#patient-details-page')).toBeVisible({ timeout: 10000 });
  });

  test('Edit patient opens edit modal', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const editBtn = firstRow.locator('[id^="edit-patient-"]');
    await editBtn.click({ force: true });
    await expect(page.locator('.modal').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Edit Patient')).toBeVisible();
  });

  test('Form validation: name is required', async ({ page }) => {
    await page.locator('#add-patient-btn').click({ force: true });
    await page.locator('#patient-phone-input').fill('+919999911111');
    await page.locator('#modal-submit-btn').click({ force: true });
    await expect(page.locator('text=/required|Name/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('Modal closes on cancel', async ({ page }) => {
    await page.locator('#add-patient-btn').click({ force: true });
    await expect(page.locator('.modal').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const isVisible = await page.locator('.modal').first().isVisible();
    // Either closed by ESC or by clicking X
    if (isVisible) {
      await page.locator('.modal button[aria-label="Close"], .modal-close, button:has-text("Cancel")').first().click({ force: true });
    }
    await expect(page.locator('.modal').first()).not.toBeVisible({ timeout: 3000 });
  });

  // ── API ────────────────────────────────────────────────────

  test('API: GET /patients returns paginated list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.patients)).toBe(true);
    expect(body.data.meta.total).toBeGreaterThanOrEqual(0);
  });

  test('API: POST /patients creates patient and returns 201', async ({ request }) => {
    const res = await request.post(`${API_BASE}/patients`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        name: 'API Test Patient',
        age: 40,
        gender: 'Male',
        phone: '+91-77700-00001',
        department: 'Cardiology',
        status: 'ACTIVE',
        bloodType: 'B+',
      },
    });
    if (res.status() !== 201) {
      console.error('PATIENT CREATION FAILED:', await res.text());
    }
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    createdPatientId = body.data.patient.id;
    expect(createdPatientId).toBeTruthy();
  });

  test('API: GET /patients/:id returns the created patient', async ({ request }) => {
    if (!createdPatientId) test.skip();
    const res = await request.get(`${API_BASE}/patients/${createdPatientId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.patient.name).toBe('API Test Patient');
  });

  test('API: PUT /patients/:id updates patient', async ({ request }) => {
    if (!createdPatientId) test.skip();
    const res = await request.put(`${API_BASE}/patients/${createdPatientId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: 'API Test Patient Updated', age: 41, gender: 'Male', phone: '+91-77700-00001' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.patient.name).toBe('API Test Patient Updated');
  });

  test('API: DELETE /patients/:id removes patient', async ({ request }) => {
    if (!createdPatientId) test.skip();
    const res = await request.delete(`${API_BASE}/patients/${createdPatientId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('API: GET /patients/:id returns 404 for deleted patient', async ({ request }) => {
    if (!createdPatientId) test.skip();
    const res = await request.get(`${API_BASE}/patients/${createdPatientId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('API: GET /patients?search= filters correctly', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients?search=Aisha`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    if (body.data.patients.length > 0) {
      expect(body.data.patients[0].name).toMatch(/Aisha/i);
    }
  });

  test('API: Validation - POST /patients with missing required fields returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/patients`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: '' },
    });
    expect([400, 422]).toContain(res.status());
  });
});

