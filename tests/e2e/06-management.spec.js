import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser } from './helpers/auth.js';

test.describe('Management Modules', () => {
  test.beforeAll(async ({ request }) => {
    await ensureTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginUI(page);
  });

  test('should manage Departments', async ({ page }) => {
    await page.click('#nav-departments');
    await expect(page.locator('.page-title h1')).toContainText('Departments');

    // Create Department
    await page.click('#add-dept-btn');
    await page.fill('#dept-name-input', 'Oncology Test');
    await page.fill('#dept-desc-input', 'Cancer treatments');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Oncology Test')).toBeVisible({ timeout: 10000 });
  });

  test('should manage Doctors', async ({ page }) => {
    await page.click('#nav-doctors');
    await expect(page.locator('.page-title h1')).toContainText('Doctors');

    // Add Doctor
    await page.click('#add-doctor-btn');
    
    // Select an available non-admin user dynamically
    const userSelect = page.locator('.modal-body select').first();
    const options = await userSelect.locator('option').allInnerTexts();
    const availableUser = options.find(opt => opt !== 'Select User' && !opt.includes('admin@medicore.in'));
    if (availableUser) {
      await userSelect.selectOption({ label: availableUser });
    }
    
    await page.selectOption('#doctor-dept-select', { label: 'Oncology Test' }); // Assume it exists from previous test
    await page.fill('#doctor-spec-input', 'Oncologist');
    await page.fill('#doctor-qual-input', 'MD');
    await page.fill('#doctor-exp-input', '10');
    await page.click('button:has-text("Save Changes")');

    await expect(page.locator('text=Oncologist').first()).toBeVisible({ timeout: 10000 });
  });

  test('should view Reports', async ({ page }) => {
    await page.click('#nav-reports');
    await expect(page.locator('.page-title h1')).toContainText('Reports');
    // Ensure metrics load (Total Patients, etc.)
    await expect(page.locator('text=Total Patients')).toBeVisible();
    await expect(page.locator('text=Monthly Revenue')).toBeVisible();
  });

  test('should manage Profile', async ({ page }) => {
    await page.click('#nav-profile');
    await expect(page.locator('text=System Admin')).toBeVisible();
    await page.click('#edit-profile-btn');
    await page.fill('#profile-phone-input', '9876543210');
    await page.click('#save-profile-btn');
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });
});
