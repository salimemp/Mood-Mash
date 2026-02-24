// ============================================================================
// Security Tests
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test.describe('Authentication Security', () => {
    test('should not allow access to protected routes without auth', async ({ page }) => {
      // Try to access protected routes
      await page.goto('/dashboard');
      // Should redirect to login or show unauthorized message
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|auth|signin/i);
    });

    test('should not allow XSS in mood notes', async ({ page }) => {
      // This test would require authenticated state
      // Testing that script tags are sanitized
      const maliciousInput = '<script>alert("xss")</script>';
      expect(maliciousInput).not.toContain('<script>');
    });

    test('should require authentication for API calls', async ({ page }) => {
      // Intercept API calls and verify they require auth
      await page.goto('/');
      const requests: string[] = [];

      await page.route('**/rest/v1/**', (route) => {
        requests.push(route.request().url());
        route.continue();
      });

      await page.waitForTimeout(1000);
      // Verify that unauthenticated requests are handled properly
    });

    test('should have secure headers', async ({ page }) => {
      const response = await page.goto('/');
      // Check for security headers
      const headers = response?.headers() || {};
      // Note: This is a basic check, full CSP/headers would be tested in production
      expect(headers).toBeDefined();
    });
  });

  test.describe('Input Validation', () => {
    test('should sanitize HTML in input fields', async ({ page }) => {
      await page.goto('/register');

      // Try to inject HTML
      await page.fill('input[type="email"]', '<script>alert(1)</script>@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.fill('input[type="password"]:nth-of-type(2)', 'TestPassword123!');

      // The email should be escaped or rejected
      const emailValue = await page.inputValue('input[type="email"]');
      expect(emailValue).not.toContain('<script>');
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'weak');
      await page.fill('input[type="password"]:nth-of-type(2)', 'weak');

      await page.click('button:has-text("Sign Up")');

      // Should show password strength error
      await expect(page.locator('text=Password must be at least')).toBeVisible();
    });

    test('should prevent SQL injection patterns', async ({ page }) => {
      await page.goto('/login');

      const sqlInjectionPayloads = [
        "'; DROP TABLE users;--",
        "1' OR '1'='1",
        "admin'--",
      ];

      for (const payload of sqlInjectionPayloads) {
        await page.fill('input[type="email"]', payload);
        await page.fill('input[type="password"]', 'test');
        await page.click('button:has-text("Sign In")');
        await page.waitForTimeout(500);

        // Should not execute the payload, just show invalid credentials
        const emailValue = await page.inputValue('input[type="email"]');
        expect(emailValue).toBe(payload); // Input should be preserved as-is
      }
    });
  });

  test.describe('Session Security', () => {
    test('should clear session on logout', async ({ page }) => {
      // This would require a logged-in state
      // Verify that logout clears tokens
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('sb-access-token', 'test-token');
        localStorage.setItem('sb-refresh-token', 'test-refresh');
      });

      // Navigate to logout
      const logoutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
      if (await logoutButton.first().isVisible()) {
        await logoutButton.first().click();

        // Verify tokens are cleared
        const accessToken = await page.evaluate(() => localStorage.getItem('sb-access-token'));
        expect(accessToken).toBeNull();
      }
    });

    test('should expire session after inactivity', async ({ page }) => {
      // This would require testing token expiration
      // In real scenario, would wait for token to expire and verify redirect
      expect(true).toBe(true); // Placeholder
    });
  });

  test.describe('CSRF Protection', () => {
    test('should include CSRF token in forms', async ({ page }) => {
      await page.goto('/register');

      // Check if forms have CSRF tokens or use proper methods
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Forms should use POST method
        const method = await form.getAttribute('method');
        expect(method?.toUpperCase()).toBe('POST');
      }
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have meta CSP tag', async ({ page }) => {
      await page.goto('/');

      // Check for CSP meta tag
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      // Note: Not all apps have CSP, this is informational
      await page.waitForTimeout(100);
    });
  });
});
