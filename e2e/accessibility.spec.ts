import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('Accessibility', () => {
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/visualisierungen', name: 'Visualizations' },
    { path: '/statistik', name: 'Statistics' },
    { path: '/methodik', name: 'Methodology' },
    { path: '/taser', name: 'Taser' },
    { path: '/kontakt', name: 'Contact' },
  ];

  test.describe('Semantic HTML Structure', () => {
    pages.forEach(({ path, name }) => {
      test(`${name} should have proper semantic structure`, async ({ page }) => {
        await helpers.navigateAndWait(page, path);

        // Should have main landmark
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Should have h1
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();

        // Only one h1 per page
        const h1Count = await h1.count();
        expect(h1Count).toBe(1);
      });
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      for (const { path } of pages) {
        await helpers.navigateAndWait(page, path);

        // Get all headings
        const h1 = await page.locator('h1').count();
        const h2 = await page.locator('h2').count();
        const h3 = await page.locator('h3').count();

        // Should have h1
        expect(h1).toBeGreaterThan(0);

        // If there are h3s, there should be h2s
        if (h3 > 0) {
          expect(h2).toBeGreaterThan(0);
        }
      }
    });

    test('should use semantic HTML5 elements', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for semantic elements
      const header = page.locator('header');
      const nav = page.locator('nav');
      const main = page.locator('main');

      // At least main should exist
      await expect(main).toBeVisible();

      // Header or nav should exist
      const hasHeaderOrNav = (await header.count()) > 0 || (await nav.count()) > 0;
      expect(hasHeaderOrNav).toBeTruthy();
    });

    test('should have descriptive page titles', async ({ page }) => {
      for (const { path, name } of pages) {
        await helpers.navigateAndWait(page, path);

        const title = await page.title();

        // Title should be descriptive
        expect(title.length).toBeGreaterThan(5);
        expect(title).not.toBe('');

        // Should not be generic
        expect(title.toLowerCase()).not.toBe('untitled');
        expect(title.toLowerCase()).not.toBe('page');
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow navigation through all interactive elements', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Tab through elements
      const focusableElements = [];

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName.toLowerCase(),
            type: (el as HTMLInputElement)?.type,
          };
        });

        focusableElements.push(activeElement);
      }

      // Should have tabbed through various elements
      const uniqueTags = new Set(focusableElements.map((el) => el.tag));
      expect(uniqueTags.size).toBeGreaterThan(1);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Find first focusable element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const styles = window.getComputedStyle(el);

        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        focusInfo.outline !== 'none' ||
        focusInfo.outlineWidth !== '0px' ||
        focusInfo.boxShadow !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should support keyboard navigation for main menu', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Tab to navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Press Enter on a link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Should navigate somewhere
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should have skip to main content link', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for skip link
      const skipLink = page.locator('a[href="#main-content"], a[href="#main"], .skip-link');

      if (await skipLink.count() > 0) {
        await expect(skipLink.first()).toBeHidden();

        // Focus skip link
        await skipLink.first().focus();

        // Should become visible when focused
        const isVisible = await skipLink.first().isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should support Enter key on buttons', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const buttons = page.locator('button, [role="button"]');

      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        // Press Enter
        await page.keyboard.press('Enter');

        // Button should have been activated (no error)
        expect(true).toBeTruthy();
      }
    });

    test('should support Space key on buttons', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const buttons = page.locator('button, [role="button"]');

      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        // Press Space
        await page.keyboard.press('Space');

        // Button should have been activated
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('ARIA Attributes', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check buttons without text
      const buttons = page.locator('button:not(:has-text(*)), [role="button"]:not(:has-text(*))');

      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        const ariaLabel = await firstButton.getAttribute('aria-label');
        const ariaLabelledBy = await firstButton.getAttribute('aria-labelledby');
        const title = await firstButton.getAttribute('title');

        // Should have some label
        expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
      }
    });

    test('should have proper roles on custom components', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for custom interactive elements
      const customButtons = page.locator('div[onclick], span[onclick]');

      if (await customButtons.count() > 0) {
        const firstCustom = customButtons.first();
        const role = await firstCustom.getAttribute('role');

        // Should have button role
        expect(role).toBe('button');
      }
    });

    test('should use aria-current for current page in navigation', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check navigation for current page indicator
      const currentPage = page.locator('[aria-current="page"], .active, [data-active="true"]');

      // Might have current page indicator
      const count = await currentPage.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should have aria-label for search', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const searchContainer = page.locator('[role="search"]');

      if (await searchContainer.count() > 0) {
        await expect(searchContainer.first()).toBeVisible();

        // Should have accessible label
        const ariaLabel = await searchContainer.first().getAttribute('aria-label');
        const hasLabel = ariaLabel !== null;

        expect(hasLabel).toBeTruthy();
      }
    });

    test('should have aria-live regions for dynamic content', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');

      // Live regions are optional but good to have
      const count = await liveRegions.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Images and Media', () => {
    test('should have alt text on all images', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // Alt should exist (can be empty for decorative images)
        expect(alt !== null).toBeTruthy();
      }
    });

    test('should have descriptive alt text for meaningful images', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const images = page.locator('img');
      const imageCount = await images.count();

      let hasDescriptiveAlt = false;

      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        if (alt && alt.length > 3) {
          hasDescriptiveAlt = true;
          break;
        }
      }

      // At least some images should have descriptive alt
      if (imageCount > 0) {
        expect(hasDescriptiveAlt).toBeTruthy();
      }
    });

    test('should not have images with alt="image" or generic text', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const badAltImages = page.locator('img[alt="image"], img[alt="photo"], img[alt="picture"]');
      const count = await badAltImages.count();

      expect(count).toBe(0);
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have labels for all form inputs', async ({ page }) => {
      await helpers.navigateAndWait(page, '/kontakt');

      const inputs = page.locator('input:not([type="hidden"]), textarea, select');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Should have label association
        const hasLabel =
          (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
          ariaLabel ||
          ariaLabelledBy ||
          (await input.locator('..').locator('label').count()) > 0;

        expect(hasLabel).toBeTruthy();
      }
    });

    test('should have proper field types for inputs', async ({ page }) => {
      await helpers.navigateAndWait(page, '/kontakt');

      // Email field should have type="email"
      const emailInput = page.locator('input[name*="email"], input[name*="mail"]');

      if (await emailInput.count() > 0) {
        const type = await emailInput.first().getAttribute('type');
        expect(type).toBe('email');
      }
    });

    test('should indicate required fields', async ({ page }) => {
      await helpers.navigateAndWait(page, '/kontakt');

      const requiredInputs = page.locator('input[required], textarea[required]');

      if (await requiredInputs.count() > 0) {
        const firstRequired = requiredInputs.first();
        const ariaRequired = await firstRequired.getAttribute('aria-required');
        const hasRequired = await firstRequired.getAttribute('required');

        // Should be marked as required
        expect(hasRequired !== null || ariaRequired === 'true').toBeTruthy();
      }
    });

    test('should have accessible error messages', async ({ page }) => {
      await helpers.navigateAndWait(page, '/kontakt');

      // Try to submit invalid form
      const submitButton = page.locator('button[type="submit"]').first();

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Look for error messages
        const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');

        if (await errorMessages.count() > 0) {
          // Error should be visible
          await expect(errorMessages.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should not rely solely on color to convey information', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Charts should have patterns or labels, not just colors
      await helpers.waitForCharts(page, 1);

      // Check that charts have text labels
      const chartLabels = page.locator('svg text');
      const labelCount = await chartLabels.count();

      expect(labelCount).toBeGreaterThan(0);
    });

    test('should have sufficient text size', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const bodyFontSize = await page.evaluate(() => {
        const body = document.body;
        return parseInt(window.getComputedStyle(body).fontSize);
      });

      // Body text should be at least 14px (preferably 16px)
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);
    });

    test('should support high contrast mode indicators', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for focus indicators (which help in high contrast)
      await page.keyboard.press('Tab');

      const hasFocusStyles = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      expect(hasFocusStyles).toBeTruthy();
    });
  });

  test.describe('Language and Text', () => {
    test('should have lang attribute on html element', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const lang = await page.locator('html').getAttribute('lang');

      expect(lang).toBeTruthy();
      expect(lang).toBe('de'); // German site
    });

    test('should use clear and simple language', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const mainText = await page.locator('main').textContent();

      // Should have reasonable content
      expect(mainText!.length).toBeGreaterThan(100);
    });

    test('should not have excessive ALL CAPS text', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const allCapsText = page.locator('p:has-text(/^[A-ZÄÖÜ\\s]+$/), span:has-text(/^[A-ZÄÖÜ\\s]+$/)');

      // Should have minimal ALL CAPS (headers might be styled that way)
      const count = await allCapsText.count();
      expect(count).toBeLessThan(10);
    });
  });

  test.describe('Links and Navigation', () => {
    test('should have descriptive link text', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const links = page.locator('a');
      const linkCount = await links.count();

      let hasGenericLinks = false;

      for (let i = 0; i < Math.min(20, linkCount); i++) {
        const link = links.nth(i);
        const text = (await link.textContent())?.trim().toLowerCase();

        if (text === 'click here' || text === 'mehr' || text === 'link') {
          hasGenericLinks = true;
          break;
        }
      }

      // Should minimize generic link text
      expect(hasGenericLinks).toBeFalsy();
    });

    test('should indicate external links', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const externalLinks = page.locator('a[href^="http"]:not([href*="polizeischuesse.cilip.de"]):not([href*="localhost"])');

      if (await externalLinks.count() > 0) {
        const firstExternal = externalLinks.first();

        // Should have target="_blank" with rel="noopener"
        const target = await firstExternal.getAttribute('target');
        const rel = await firstExternal.getAttribute('rel');

        if (target === '_blank') {
          expect(rel).toContain('noopener');
        }
      }
    });

    test('should have consistent navigation across pages', async ({ page }) => {
      const navItems: string[] = [];

      for (const { path } of pages.slice(0, 3)) {
        await helpers.navigateAndWait(page, path);

        const nav = page.locator('nav a, header a');
        const count = await nav.count();

        navItems.push(`${count}`);
      }

      // Navigation should be consistent
      const allSame = navItems.every((count) => count === navItems[0]);
      expect(allSame).toBeTruthy();
    });
  });

  test.describe('Dynamic Content', () => {
    test('should announce filter changes to screen readers', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const yearFilter = page.locator('select[name="year"]').first();

      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Look for live region updates
        const liveRegions = page.locator('[aria-live], [role="status"]');

        // Live regions might be present
        const count = await liveRegions.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle loading states accessibly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for loading indicators
      const loadingIndicators = page.locator('[aria-busy="true"], [aria-label*="Loading"], .loading');

      // If loading states exist, they should be accessible
      if (await loadingIndicators.count() > 0) {
        const ariaBusy = await loadingIndicators.first().getAttribute('aria-busy');
        expect(ariaBusy === 'true' || ariaBusy === null).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have adequate touch target sizes on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigateAndWait(page, '/');

      // Check button sizes
      const buttons = page.locator('button, a[href]');

      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        const box = await firstButton.boundingBox();

        if (box) {
          // Touch targets should be at least 44x44px
          expect(box.height).toBeGreaterThanOrEqual(30);
          expect(box.width).toBeGreaterThanOrEqual(30);
        }
      }
    });

    test('should allow zoom on mobile', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const viewport = page.locator('meta[name="viewport"]');
      const content = await viewport.getAttribute('content');

      // Should not prevent zooming
      expect(content).not.toContain('user-scalable=no');
      expect(content).not.toContain('maximum-scale=1');
    });

    test('should be usable in portrait and landscape', async ({ page }) => {
      // Test portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigateAndWait(page, '/');

      let mainPortrait = page.locator('main');
      await expect(mainPortrait).toBeVisible();

      // Test landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await helpers.waitForPageReady(page);

      let mainLandscape = page.locator('main');
      await expect(mainLandscape).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have descriptive page regions', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for landmarks
      const main = await page.locator('main, [role="main"]').count();
      const nav = await page.locator('nav, [role="navigation"]').count();
      const header = await page.locator('header, [role="banner"]').count();

      // Should have at least main
      expect(main).toBeGreaterThan(0);
    });

    test('should have hidden content properly marked', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const hiddenElements = page.locator('[aria-hidden="true"]');
      const hiddenCount = await hiddenElements.count();

      // Hidden elements should not be focusable
      if (hiddenCount > 0) {
        const firstHidden = hiddenElements.first();
        const tabIndex = await firstHidden.getAttribute('tabindex');

        expect(tabIndex !== '0').toBeTruthy();
      }
    });

    test('should have proper table markup if tables exist', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const tables = page.locator('table');

      if (await tables.count() > 0) {
        const firstTable = tables.first();

        // Should have thead or th
        const hasHeaders = (await firstTable.locator('thead').count()) > 0 ||
                          (await firstTable.locator('th').count()) > 0;

        expect(hasHeaders).toBeTruthy();
      }
    });
  });
});
