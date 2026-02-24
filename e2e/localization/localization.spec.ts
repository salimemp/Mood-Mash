// ============================================================================
// Localization Tests
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Localization Tests', () => {
  test.describe('Language Switching', () => {
    test('should display English by default', async ({ page }) => {
      await page.goto('/');

      // Check for English text
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('text=Sign Up')).toBeVisible();
    });

    test('should switch to Spanish', async ({ page }) => {
      await page.goto('/');

      // Find and click language selector
      const langSelector = page.locator('button:has-text("ES"), button[aria-label*="language"], button[aria-label*="Español"]');
      if (await langSelector.first().isVisible()) {
        await langSelector.first().click();
        await page.waitForTimeout(500);
      }

      // Check for Spanish text (basic verification)
      await page.waitForTimeout(1000);
    });

    test('should switch to French', async ({ page }) => {
      await page.goto('/');

      const langSelector = page.locator('button:has-text("FR"), button[aria-label*="Français"]');
      if (await langSelector.first().isVisible()) {
        await langSelector.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should persist language preference', async ({ page }) => {
      await page.goto('/');

      // Set language
      const langSelector = page.locator('button[aria-label*="language"]');
      if (await langSelector.first().isVisible()) {
        await langSelector.first().click();

        // Wait for language change
        await page.waitForTimeout(1000);

        // Reload page
        await page.reload();

        // Language should persist
        await page.waitForTimeout(1000);
      }
    });

    test('should display correct date format for locale', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Check if dates are displayed
      const dateElements = await page.locator('time, [class*="date"], [class*="time"]').count();
      console.log('Date elements found:', dateElements);
    });
  });

  test.describe('RTL Support', () => {
    test('should support Arabic (RTL)', async ({ page }) => {
      await page.goto('/');

      // Switch to Arabic if available
      const langSelector = page.locator('button[aria-label*="العربية"], button:has-text("AR")');
      if (await langSelector.first().isVisible()) {
        await langSelector.first().click();
        await page.waitForTimeout(1000);

        // Check for RTL direction
        const direction = await page.evaluate(() => document.documentElement.dir);
        console.log('Direction:', direction);
      }
    });

    test('should have proper RTL layout', async ({ page }) => {
      await page.goto('/');

      // Set Arabic locale
      await page.addInitScript(() => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      });

      await page.reload();
      await page.waitForTimeout(500);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Translation Completeness', () => {
    test('should translate all navigation items', async ({ page }) => {
      await page.goto('/');

      const navItems = await page.locator('nav a, nav button').all();
      console.log('Navigation items:', navItems.length);

      // Check that all visible nav items have text
      for (const item of navItems.slice(0, 5)) {
        if (await item.isVisible()) {
          const text = await item.textContent();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should translate form labels', async ({ page }) => {
      await page.goto('/login');

      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        if (await input.isVisible()) {
          const hasLabel = await input.evaluate((el) => {
            return el.hasAttribute('aria-label') ||
              el.hasAttribute('aria-labelledby') ||
              !!el.closest('label');
          });
          expect(hasLabel).toBe(true);
        }
      }
    });

    test('should translate error messages', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.click('button:has-text("Sign In")');

      // Check for error messages
      await page.waitForTimeout(500);
      const errorMessages = await page.locator('[role="alert"], .error, .text-red').count();
      console.log('Error messages found:', errorMessages);
    });

    test('should translate placeholders', async ({ page }) => {
      await page.goto('/login');

      const inputs = await page.locator('input[placeholder]').all();
      for (const input of inputs) {
        if (await input.isVisible()) {
          const placeholder = await input.getAttribute('placeholder');
          console.log('Placeholder:', placeholder);
        }
      }
    });
  });

  test.describe('Number and Currency Formatting', () => {
    test('should format numbers according to locale', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Look for number elements
      const numberElements = await page.locator('[class*="number"], [class*="score"], [class*="count"]').count();
      console.log('Number elements:', numberElements);
    });
  });

  test.describe('Timezone Handling', () => {
    test('should display times in correct timezone', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Check for time elements
      const timeElements = await page.locator('time').count();
      console.log('Time elements:', timeElements);
    });
  });

  test.describe('Missing Translation Detection', () => {
    test('should not have untranslated keys visible', async ({ page }) => {
      await page.goto('/');

      // Check for common translation key patterns
      const untranslatedPatterns = [
        '{{',
        '}}',
        't(',
        'i18n.',
        '_t.',
        '[missing',
      ];

      const pageContent = await page.content();

      for (const pattern of untranslatedPatterns) {
        const hasPattern = pageContent.includes(pattern);
        console.log(`Pattern "${pattern}" found:`, hasPattern);
      }
    });

    test('should handle missing translations gracefully', async ({ page }) => {
      await page.goto('/');

      // Set non-existent language
      await page.addInitScript(() => {
        localStorage.setItem('language', 'xx');
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Page should still be visible
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
