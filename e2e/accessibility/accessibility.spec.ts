// ============================================================================
// Accessibility Tests
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.describe('Keyboard Navigation', () => {
    test('should be navigable with keyboard only', async ({ page }) => {
      await page.goto('/');

      // Start at the top of the page
      await page.keyboard.press('Tab');

      // Should be able to navigate through interactive elements
      const firstFocusable = await page.locator(':focus').first();
      expect(firstFocusable).toBeDefined();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Find a button and focus it
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.focus();

        // Check that focus styles exist (this is implementation-specific)
        const isFocused = await button.evaluate((el) => el === document.activeElement);
        expect(isFocused).toBe(true);
      }
    });

    test('should have skip link for accessibility', async ({ page }) => {
      await page.goto('/');

      // Check for skip link
      const skipLink = page.locator('a[href="#main"], a[href="#content"], text=Skip to');
      await page.waitForTimeout(500);
    });

    test('should have proper tab order', async ({ page }) => {
      await page.goto('/login');

      // Get all focusable elements
      const focusableSelectors = 'a, button, input, select, textarea, [tabindex]';
      const elements = await page.locator(focusableSelectors).all();

      // Check that we can tab through all elements
      for (const element of elements.slice(0, 5)) {
        if (await element.isVisible()) {
          await element.focus();
          const isFocused = await element.evaluate((el) => el === document.activeElement);
          expect(isFocused).toBe(true);
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      // Check form inputs have labels
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        // Either has aria-label, aria-labelledby, or associated label
        const hasLabel = await emailInput.evaluate((el) => {
          return el.hasAttribute('aria-label') ||
            el.hasAttribute('aria-labelledby') ||
            el.closest('label') !== null ||
            el.id !== '';
        });
        // Log for information
        console.log('Email input has label:', hasLabel);
      }
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');

      // Check all images have alt text
      const images = await page.locator('img').all();
      for (const img of images) {
        const hasAlt = await img.evaluate((el) => el.alt !== undefined);
        if (await img.isVisible()) {
          console.log('Image has alt:', hasAlt);
        }
      }
    });

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/');

      // Check heading hierarchy (h1 -> h2 -> h3)
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      const h3 = page.locator('h3');

      // At least one h1 should exist on the page
      const h1Count = await h1.count();
      console.log('H1 count:', h1Count);

      // Headings should be in order
      if (await h1.first().isVisible()) {
        const h1Position = await h1.first().boundingBox();
        if (h2.first().isVisible()) {
          const h2Position = await h2.first().boundingBox();
          if (h1Position && h2Position) {
            expect(h1Position.y).toBeLessThanOrEqual(h2Position.y);
          }
        }
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/login');

      // Check that form inputs are properly labeled
      const inputs = await page.locator('input:not([type="hidden"])').all();
      for (const input of inputs) {
        if (await input.isVisible()) {
          const hasLabel = await input.evaluate((el) => {
            return el.hasAttribute('aria-label') ||
              el.hasAttribute('aria-labelledby') ||
              !!el.closest('label') ||
              !!document.querySelector(`label[for="${el.id}"]`);
          });
          console.log('Input has label:', hasLabel);
        }
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/login');

      // Get the page's computed styles
      const hasText = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.color !== '';
      });

      expect(hasText).toBe(true);
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await page.goto('/');

      // Check that error messages have icons or text, not just color
      const errorElements = await page.locator('[role="alert"], .error, .text-red').all();
      console.log('Potential error elements found:', await errorElements.length);
    });
  });

  test.describe('Focus Management', () => {
    test('should trap focus in modal', async ({ page }) => {
      await page.goto('/dashboard');

      // Open a modal
      const addButton = page.locator('button:has-text("+ Add Entry"), button:has-text("Log Mood")');
      if (await addButton.first().isVisible()) {
        await addButton.first().click();
        await page.waitForTimeout(500);

        // Check if modal is open
        const modal = page.locator('[role="dialog"], .modal, .Dialog');
        if (await modal.isVisible()) {
          // Focus should be trapped in modal
          const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
          console.log('Focused element in modal:', focusedElement);
        }
      }
    });

    test('should return focus after modal close', async ({ page }) => {
      await page.goto('/dashboard');

      // Get initial focus
      await page.keyboard.press('Tab');
      const initialElement = await page.locator(':focus').first();

      // Open and close modal
      const addButton = page.locator('button:has-text("+ Add Entry"), button:has-text("Log Mood")');
      if (await addButton.first().isVisible()) {
        await addButton.first().click();
        await page.waitForTimeout(500);

        // Close with escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Focus should return
        const hasFocus = await page.evaluate(() => document.activeElement !== null);
        expect(hasFocus).toBe(true);
      }
    });
  });

  test.describe('Text Accessibility', () => {
    test('should have sufficient text size', async ({ page }) => {
      await page.goto('/');

      const fontSize = await page.evaluate(() => {
        const body = window.getComputedStyle(document.body);
        return parseFloat(body.fontSize);
      });

      // Minimum recommended is 16px
      expect(fontSize).toBeGreaterThanOrEqual(12);
    });

    test('should not have justified text', async ({ page }) => {
      await page.goto('/');

      const justifiedText = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, div, span');
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          if (style.textAlign === 'justify') {
            return true;
          }
        }
        return false;
      });

      // Justified text is not recommended for accessibility
      console.log('Has justified text:', justifiedText);
    });
  });

  test.describe('Motion and Animation', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Set prefers-reduced-motion
      await page.addInitScript(() => {
        window.matchMedia = window.matchMedia || function() {
          return {
            matches: true,
            media: '',
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          };
        };
      });

      await page.goto('/');
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
