// tests/e2e/05-clinical.spec.js
// End-to-end tests for the Patient Details Clinical Dashboard
// Tests: Navigation, EHR, Prescriptions, Lab Tests, Documents, Billing, Appointments

import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser, API_BASE } from './helpers/auth.js';

let authToken = '';
let testPatientId = '';

test.describe('Clinical Features', () => {

  test.beforeAll(async ({ request }) => {
    await ensureTestUser(request);

    // Login and get token
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@hms.test', password: 'Admin@1234' },
    });
    const body = await res.json();
    authToken = body.data.accessToken;

    // Get a test patient
    const pRes = await request.get(`${API_BASE}/patients?limit=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const pBody = await pRes.json();
    testPatientId = pBody.data.patients[0]?.id;
  });

  test.beforeEach(async ({ page }) => {
    await loginUI(page);
  });

  // ─────────────────────────────────────────────────────
  // NAVIGATION TESTS
  // ─────────────────────────────────────────────────────

  test('Clicking View button navigates to Patient Details page', async ({ page }) => {
    await page.goto('/patients');
    await page.waitForSelector('tbody tr', { timeout: 15000 });
    // Click first view button (ExternalLink icon)
    const firstViewBtn = page.locator('tbody tr').first().locator('button').first();
    await firstViewBtn.click({ force: true });
    await expect(page).toHaveURL(/\/patients\/.+/, { timeout: 10000 });
    await expect(page.locator('#patient-details-page')).toBeVisible({ timeout: 10000 });
  });

  test('Patient Details page shows patient name and tabs', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#patient-tabs')).toBeVisible({ timeout: 10000 });
    // All 7 tabs should be present
    for (const tabId of ['tab-overview', 'tab-ehr', 'tab-prescriptions', 'tab-lab', 'tab-billing', 'tab-appointments', 'tab-documents']) {
      await expect(page.locator(`#${tabId}`)).toBeVisible();
    }
  });

  test('Back to Patients button navigates back', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#back-to-patients-btn', { timeout: 10000 });
    await page.locator('#back-to-patients-btn').click();
    await expect(page).toHaveURL(/\/patients$/);
  });

  test('Refresh button reloads patient data', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#refresh-patient-btn', { timeout: 10000 });
    await page.locator('#refresh-patient-btn').click();
    // Should still be on same page after refresh
    await expect(page).toHaveURL(`/patients/${testPatientId}`);
    await expect(page.locator('#patient-details-page')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────
  // OVERVIEW TAB
  // ─────────────────────────────────────────────────────

  test('Overview tab shows patient stats cards', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-overview', { timeout: 10000 });
    await page.locator('#tab-overview').click();
    // Should show stat cards
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────
  // EHR TAB
  // ─────────────────────────────────────────────────────

  test('EHR tab loads and shows Add Record button', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-ehr', { timeout: 10000 });
    await page.locator('#tab-ehr').click();
    await expect(page.locator('#add-ehr-btn')).toBeVisible({ timeout: 8000 });
  });

  test('EHR tab: Create a new medical record', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-ehr', { timeout: 10000 });
    await page.locator('#tab-ehr').click();
    await page.locator('#add-ehr-btn').click({ force: true });
    // Modal should appear
    await expect(page.locator('.modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    await page.locator('#ehr-diagnosis-input').fill('Playwright Test Diagnosis');
    await page.locator('#ehr-complaint-input').fill('Chest pain');
    await page.locator('#ehr-symptoms-input').fill('Shortness of breath, fatigue');
    await page.locator('#ehr-notes-input').fill('Test note');
    await page.locator('#ehr-doctor-input').fill('Dr. Playwright');
    // Submit
    await page.locator('#modal-submit-btn').click({ force: true });
    await page.waitForTimeout(2000);
    // Record should now be visible
    await expect(page.locator('text=Playwright Test Diagnosis').first()).toBeVisible({ timeout: 8000 });
  });

  // ─────────────────────────────────────────────────────
  // PRESCRIPTIONS TAB
  // ─────────────────────────────────────────────────────

  test('Prescriptions tab loads and shows Add button', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-prescriptions', { timeout: 10000 });
    await page.locator('#tab-prescriptions').click();
    await expect(page.locator('#add-prescription-btn')).toBeVisible({ timeout: 8000 });
  });

  test('Prescriptions tab: Create a prescription', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-prescriptions', { timeout: 10000 });
    await page.locator('#tab-prescriptions').click();
    await page.locator('#add-prescription-btn').click({ force: true });
    await expect(page.locator('.modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    await page.locator('#rx-doctor-input').fill('Dr. Playwright');
    await page.locator('#rx-diagnosis-input').fill('Test Condition');
    // Fill in medication fields (first row)
    const medInputs = page.locator('.form-group.full').last().locator('.form-input');
    await medInputs.first().fill('Aspirin');
    await page.locator('#modal-submit-btn').click({ force: true });
    await page.waitForTimeout(2000);
    // Verify it was created
    await expect(page.locator('text=Test Condition').first()).toBeVisible({ timeout: 8000 });
  });

  // ─────────────────────────────────────────────────────
  // LAB TESTS TAB
  // ─────────────────────────────────────────────────────

  test('Lab Tests tab loads and shows Order Test button', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-lab', { timeout: 10000 });
    await page.locator('#tab-lab').click();
    await expect(page.locator('#add-lab-btn')).toBeVisible({ timeout: 8000 });
  });

  test('Lab Tests tab: Order a lab test', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-lab', { timeout: 10000 });
    await page.locator('#tab-lab').click();
    await page.locator('#add-lab-btn').click({ force: true });
    await expect(page.locator('.modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    await page.locator('#lab-name-input').fill('Playwright Blood Test');
    await page.locator('#lab-category-select').selectOption('BLOOD');
    await page.locator('#lab-priority-select').selectOption('NORMAL');
    await page.locator('#lab-orderedby-input').fill('Dr. Playwright');
    await page.locator('#modal-submit-btn').click({ force: true });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Playwright Blood Test').first()).toBeVisible({ timeout: 8000 });
  });

  // ─────────────────────────────────────────────────────
  // DOCUMENTS TAB
  // ─────────────────────────────────────────────────────

  test('Documents tab loads and shows Upload button', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-documents', { timeout: 10000 });
    await page.locator('#tab-documents').click();
    await expect(page.locator('#add-doc-btn')).toBeVisible({ timeout: 8000 });
  });

  // ─────────────────────────────────────────────────────
  // BILLING TAB
  // ─────────────────────────────────────────────────────

  test('Billing tab loads without error', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-billing', { timeout: 10000 });
    await page.locator('#tab-billing').click();
    // Should show either billing records or empty state
    await expect(page.locator('#patient-tab-content')).toBeVisible({ timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────
  // APPOINTMENTS TAB
  // ─────────────────────────────────────────────────────

  test('Appointments tab loads without error', async ({ page }) => {
    await page.goto(`/patients/${testPatientId}`);
    await page.waitForSelector('#tab-appointments', { timeout: 10000 });
    await page.locator('#tab-appointments').click();
    await expect(page.locator('#patient-tab-content')).toBeVisible({ timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────
  // API TESTS
  // ─────────────────────────────────────────────────────

  test('API: GET /patients/:id/clinical/summary returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.patient).toBeDefined();
    expect(body.data.patient.id).toBe(testPatientId);
  });

  test('API: POST /patients/:id/clinical/records creates EHR record', async ({ request }) => {
    const res = await request.post(`${API_BASE}/patients/${testPatientId}/clinical/records`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        diagnosis: 'API Test Diagnosis',
        symptoms: 'Test symptoms',
        treatmentPlan: 'Test plan',
        doctorName: 'Dr. API Test',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.record.diagnosis).toBe('API Test Diagnosis');
  });

  test('API: GET /patients/:id/clinical/records returns records', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/records`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.records)).toBe(true);
    expect(body.data.records.length).toBeGreaterThan(0);
  });

  test('API: POST /patients/:id/clinical/prescriptions creates prescription', async ({ request }) => {
    const res = await request.post(`${API_BASE}/patients/${testPatientId}/clinical/prescriptions`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        medications: [{ name: 'API Test Drug', dosage: '10mg', frequency: 'Twice daily', duration: '7 days', instructions: 'With meals' }],
        diagnosis: 'API Test Condition',
        doctorName: 'Dr. API',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.prescription.status).toBe('ACTIVE');
  });

  test('API: GET /patients/:id/clinical/prescriptions returns prescriptions', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/prescriptions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.prescriptions)).toBe(true);
  });

  test('API: POST /patients/:id/clinical/lab-tests creates lab test', async ({ request }) => {
    const res = await request.post(`${API_BASE}/patients/${testPatientId}/clinical/lab-tests`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        testName: 'API Test Lab',
        category: 'BLOOD',
        priority: 'NORMAL',
        orderedByName: 'Dr. API Test',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.test.status).toBe('PENDING');
  });

  test('API: PUT /patients/:id/clinical/lab-tests/:testId updates status', async ({ request }) => {
    // Create a test first
    const createRes = await request.post(`${API_BASE}/patients/${testPatientId}/clinical/lab-tests`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { testName: 'Update Status Test', category: 'BLOOD', priority: 'NORMAL' },
    });
    const createBody = await createRes.json();
    const testId = createBody.data.test.id;

    // Update to completed
    const updateRes = await request.put(`${API_BASE}/patients/${testPatientId}/clinical/lab-tests/${testId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'COMPLETED', result: 'Normal range' },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updateBody = await updateRes.json();
    expect(updateBody.data.test.status).toBe('COMPLETED');
    expect(updateBody.data.test.completedAt).toBeTruthy();
  });

  test('API: GET /patients/:id/clinical/lab-tests returns lab tests', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/lab-tests`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.tests)).toBe(true);
  });

  test('API: GET /patients/:id/clinical/documents returns documents', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/documents`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.documents)).toBe(true);
  });

  test('API: Invalid patient ID returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/nonexistent-id/clinical/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('API: Unauthenticated requests return 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/patients/${testPatientId}/clinical/summary`);
    expect(res.status()).toBe(401);
  });
});
