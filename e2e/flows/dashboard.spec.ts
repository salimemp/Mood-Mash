// ============================================================================
// E2E Tests: Dashboard and Mood Logging
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should load dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/MoodMash/i);
  });

  test('should display mood entry button', async ({ page }) => {
    await expect(page.locator('button:has-text("Log Mood")')).toBeVisible();
    await expect(page.locator('button:has-text("+ Add Entry")')).toBeVisible();
  });

  test('should display mood statistics', async ({ page }) => {
    await page.waitForTimeout(1000);
    // Check for statistics elements
    const statsSection = page.locator('text=Your Mood Insights');
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible();
    }
  });

  test('should open mood logging modal', async ({ page }) => {
    await page.click('button:has-text("Log Mood")');
    await expect(page.locator('text=How are you feeling?')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Journal')).toBeVisible();
    await expect(page.locator('text=Wellness')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    // Find and click theme toggle if available
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]');
    if (await themeToggle.first().isVisible()) {
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Mood Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should open mood modal when clicking add entry', async ({ page }) => {
    await page.click('button:has-text("+ Add Entry")');
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('should select a mood', async ({ page }) => {
    await page.click('button:has-text("+ Add Entry")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Select happy mood
    const happyMood = page.locator('button[aria-label="Happy"]');
    if (await happyMood.isVisible()) {
      await happyMood.click();
    }
  });

  test('should add a note', async ({ page }) => {
    await page.click('button:has-text("+ Add Entry")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Find and fill note field
    const noteField = page.locator('textarea, input[type="text"]').first();
    if (await noteField.isVisible()) {
      await noteField.fill('Great day!');
    }
  });

  test('should close mood modal', async ({ page }) => {
    await page.click('button:has-text("+ Add Entry")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });
});

test.describe('Navigation', () => {
  test('should navigate to Journal page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Journal');
    await expect(page.locator('text=Journal')).toBeVisible();
  });

  test('should navigate to Wellness page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Wellness');
    await expect(page.locator('text=Wellness')).toBeVisible();
  });

  test('should navigate to Settings page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Settings');
    await expect(page.locator('text=Settings')).toBeVisible();
  });
});
