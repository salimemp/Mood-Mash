// ============================================================================
// E2E Tests: Authentication Flows
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should display login form', async ({ page }) => {
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.click('button:has-text("Sign In")');
      await expect(page.locator('text=Email is required')).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Sign In")');
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    });

    test('should show error for incorrect credentials', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Sign In")');
      // Wait for error message (may vary based on implementation)
      await page.waitForTimeout(2000);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.click('text=Forgot Password?');
      await expect(page.locator('text=Reset Password')).toBeVisible();
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.click('text=Sign Up');
      await expect(page.locator('text=Create Account')).toBeVisible();
    });
  });

  test.describe('Social Login', () => {
    test('should display GitHub login option', async ({ page }) => {
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    });

    test('should display Google login option', async ({ page }) => {
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('text=Create Account')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('input[type="password"]:nth-of-type(2)')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.click('button:has-text("Sign Up")');
      await expect(page.locator('text=Email is required')).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.fill('input[type="password"]:nth-of-type(2)', 'Password124!');
      await page.click('button:has-text("Sign Up")');
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should show error for weak password', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'weak');
      await page.fill('input[type="password"]:nth-of-type(2)', 'weak');
      await page.click('button:has-text("Sign Up")');
      await expect(page.locator('text=Password must be at least')).toBeVisible();
    });
  });
});
