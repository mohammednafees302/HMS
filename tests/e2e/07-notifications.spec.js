import { test, expect } from '@playwright/test';
import { loginUI, ensureTestUser, TEST_USER } from './helpers/auth.js';

test.describe('Notifications System', () => {
  test.beforeAll(async ({ request }) => {
    await ensureTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginUI(page);
  });

  test('should trigger notification on profile update, display it, mark as read, and delete it', async ({ page }) => {
    // 1. Go to Profile and make a change to trigger a profile notification
    await page.click('#nav-profile');
    await expect(page.locator('text=System Admin')).toBeVisible();
    await page.click('#edit-profile-btn');
    const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    await page.fill('#profile-phone-input', randomPhone);
    await page.click('#save-profile-btn');
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // 2. Open notification dropdown
    await page.click('#header-notification-btn');
    
    // Wait for the settings/profile updated notification to appear
    const notificationItem = page.locator('.dropdown-item').first();
    await expect(notificationItem).toBeVisible({ timeout: 10000 });
    await expect(notificationItem).toContainText('Profile Updated');

    // 3. Click notification (should navigate and mark as read)
    await notificationItem.click();
    await page.waitForTimeout(1000); // Wait for animations/navigation
    await expect(page.url()).toContain('/profile');

    // 4. Open dropdown again and verify unread badge/dot is gone (or marked read)
    await page.click('#header-notification-btn');
    const readItem = page.locator('.dropdown-item').first();
    await expect(readItem).toBeVisible();
    
    // Verify it doesn't have the unread status styling
    const unreadDot = readItem.locator('span[style*="background: var(--danger)"]');
    await expect(unreadDot).not.toBeVisible();

    // 5. Delete the notification
    const notifId = await readItem.getAttribute('id');
    const deleteBtn = readItem.locator('button[title="Delete notification"]');
    await deleteBtn.click();
    
    // Verify notification is removed
    await expect(page.locator(`#${notifId}`)).not.toBeVisible();
  });

  test('should trigger notification on settings update', async ({ page }) => {
    // 1. Go to Settings and make a change
    await page.click('#nav-settings');
    await expect(page.locator('.page-title h1')).toContainText('Settings');
    
    // Trigger accent color change or just click save
    await page.click('#save-settings-btn');
    await expect(page.locator('text=Saved!')).toBeVisible();

    // 2. Open notifications and verify Settings Updated notification
    await page.click('#header-notification-btn');
    const notifItem = page.locator('.dropdown-item').first();
    await expect(notifItem).toBeVisible({ timeout: 10000 });
    await expect(notifItem).toContainText('Settings Updated');
    
    // Clean up: delete it
    await notifItem.locator('button[title="Delete notification"]').click();
  });
});
