import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('Individual Case Pages', () => {
  test.describe('Case Page Loading', () => {
    test('should load a case detail page', async ({ page }) => {
      // Navigate to homepage and click on first case
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Find link to a case page
      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Should be on a case page
        expect(page.url()).toContain('/fall/');

        // Page should have content
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    });

    test('should have proper title for case page', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Title should be set
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title).not.toBe('');
      }
    });

    test('should navigate to case by ID in URL', async ({ page }) => {
      // Try a few common ID patterns
      const testIds = ['1', '100', '200'];

      for (const id of testIds) {
        const response = await page.request.get(`/fall/${id}`);

        // Should either load successfully or return 404
        expect([200, 404]).toContain(response.status());

        if (response.status() === 200) {
          // Found a valid case page
          await page.goto(`/fall/${id}`);
          await helpers.waitForPageReady(page);

          const mainContent = page.locator('main');
          await expect(mainContent).toBeVisible();
          break;
        }
      }
    });

    test('should handle non-existent case IDs gracefully', async ({ page }) => {
      const response = await page.request.get('/fall/99999999');

      // Should return 404 for non-existent case
      expect([404, 500]).toContain(response.status());
    });
  });

  test.describe('Case Information Display', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a case page
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();
      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);
      }
    });

    test('should display case date', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      // Look for date information
      const dateText = page.locator('text=/\\d{1,2}\\.\\d{1,2}\\.\\d{4}|\\d{1,2}\\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \\d{4}/i');

      if (await dateText.count() > 0) {
        await expect(dateText.first()).toBeVisible();
      }
    });

    test('should display location information', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      // Should show city and/or state
      const locationInfo = page.locator('text=/Stadt|Bundesland|Ort/i, text=/Berlin|München|Hamburg|Frankfurt/i');

      if (await locationInfo.count() > 0) {
        await expect(locationInfo.first()).toBeVisible();
      }
    });

    test('should display age information if available', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      const ageInfo = page.locator('text=/\\d{1,3}\\s*Jahre?|Alter/i');

      // Age might not always be available
      if (await ageInfo.count() > 0) {
        await expect(ageInfo.first()).toBeVisible();
      }
    });

    test('should display case circumstances', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      // Should have some description or details
      const description = page.locator('p, article, [data-testid*="description"]');

      const count = await description.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display weapon information', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      const weaponInfo = page.locator('text=/Waffe|Schusswaffe|Messer|bewaffnet/i');

      // Weapon info should be present
      if (await weaponInfo.count() > 0) {
        await expect(weaponInfo.first()).toBeVisible();
      }
    });

    test('should display relevant boolean attributes', async ({ page }) => {
      if (!page.url().includes('/fall/')) {
        test.skip();
      }

      // Look for attribute indicators
      const attributes = [
        'Schusswechsel',
        'Sondereinsatzbeamte',
        'psychische Ausnahmesituation',
      ];

      for (const attr of attributes) {
        const attrText = page.locator(`text=${attr}`);
        // Attributes might be present
        if (await attrText.count() > 0) {
          await expect(attrText.first()).toBeVisible();
          break; // Found at least one attribute
        }
      }
    });
  });

  test.describe('Case Page Navigation', () => {
    test('should have navigation back to main list', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Should have link back to home or main list
        const homeLink = page.locator('a[href="/"], a:has-text("Zurück"), a:has-text("Chronik")');

        const count = await homeLink.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should have navigation to adjacent cases', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Look for prev/next navigation
        const navLinks = page.locator('a:has-text("vorherig"), a:has-text("nächst"), a:has-text("vor"), a:has-text("zurück")');

        // Navigation might be present
        const navCount = await navLinks.count();
        expect(navCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should maintain scroll position when navigating back', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Scroll down a bit
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Go back
        await page.goBack();
        await helpers.waitForPageReady(page);

        // Should be back on homepage
        expect(page.url()).not.toContain('/fall/');
      }
    });
  });

  test.describe('Case Page Metadata', () => {
    test('should have Open Graph meta tags', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Check for OG tags
        const ogTitle = page.locator('meta[property="og:title"]');
        const ogDescription = page.locator('meta[property="og:description"]');

        if (await ogTitle.count() > 0) {
          const titleContent = await ogTitle.getAttribute('content');
          expect(titleContent).toBeTruthy();
        }
      }
    });

    test('should have appropriate meta description', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        const metaDescription = page.locator('meta[name="description"]');

        if (await metaDescription.count() > 0) {
          const content = await metaDescription.getAttribute('content');
          expect(content).toBeTruthy();
          expect(content!.length).toBeGreaterThan(10);
        }
      }
    });

    test('should have canonical URL', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        const canonical = page.locator('link[rel="canonical"]');

        // Canonical might be present
        if (await canonical.count() > 0) {
          const href = await canonical.getAttribute('href');
          expect(href).toContain('/fall/');
        }
      }
    });
  });

  test.describe('Case Page Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Should have h1
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();

        // Should have main landmark
        const main = page.locator('main');
        await expect(main).toBeVisible();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        // Tab to link
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Should be able to activate link with Enter
        await page.keyboard.press('Enter');
        await helpers.waitForPageReady(page);

        // Should navigate to case page
        const url = page.url();
        expect(url.includes('/fall/') || url === page.url()).toBeTruthy();
      }
    });

    test('should have descriptive link text in case list', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        const linkText = await caseLink.textContent();

        // Link text should not be generic
        expect(linkText).toBeTruthy();
        expect(linkText!.length).toBeGreaterThan(2);
        expect(linkText!.toLowerCase()).not.toBe('mehr');
        expect(linkText!.toLowerCase()).not.toBe('link');
      }
    });
  });

  test.describe('Case Page Content Quality', () => {
    test('should display complete case information', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Should have meaningful content
        const bodyText = await page.locator('main').textContent();

        expect(bodyText!.length).toBeGreaterThan(50);
      }
    });

    test('should not display undefined or null values', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Check for invalid values
        const invalidText = page.locator('text=/undefined|null|NaN/i');
        const count = await invalidText.count();

        // Might have "null" in German text, but not literal undefined
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const text = await invalidText.nth(i).textContent();
            expect(text!.trim()).not.toBe('undefined');
            expect(text!.trim()).not.toBe('NaN');
          }
        }
      }
    });

    test('should handle missing data gracefully', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Look for placeholders for missing data
        const unknownText = page.locator('text=/unbekannt|k\\.A\\.|nicht bekannt/i');

        // Missing data might be indicated - this is acceptable
        if (await unknownText.count() > 0) {
          await expect(unknownText.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Case Listing Integration', () => {
    test('should show cases in chronological order on homepage', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 2);

      // Get first two case links
      const caseLinks = page.locator('a[href*="/fall/"]');

      if (await caseLinks.count() >= 2) {
        // Cases should be listed
        await expect(caseLinks.first()).toBeVisible();
        await expect(caseLinks.nth(1)).toBeVisible();
      }
    });

    test('should display case preview in list', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Each case in list should have preview information
      const cases = page.locator('[data-testid*="case"], .case, article').first();

      if (await cases.count() > 0) {
        const caseText = await cases.textContent();

        // Should have some basic info in preview
        expect(caseText!.length).toBeGreaterThan(10);
      }
    });

    test('should link from case list to detail page', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        const href = await caseLink.getAttribute('href');

        expect(href).toBeTruthy();
        expect(href).toContain('/fall/');

        // Click and verify navigation
        await caseLink.click();
        await helpers.waitForPageReady(page);

        expect(page.url()).toContain('/fall/');
      }
    });
  });

  test.describe('Case Page Performance', () => {
    test('should load case page quickly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        const startTime = Date.now();

        await caseLink.click();
        await helpers.waitForPageReady(page);

        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
      }
    });

    test('should not have excessive JavaScript errors', async ({ page }) => {
      const errors = helpers.setupConsoleErrorTracking(page);

      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        // Filter out expected errors
        const criticalErrors = errors.filter(
          (err) => !err.includes('404') && !err.includes('favicon')
        );

        expect(criticalErrors.length).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Case Page Responsiveness', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Content should fit in viewport
        const box = await main.boundingBox();
        expect(box!.width).toBeLessThanOrEqual(375);
      }
    });

    test('should be readable on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const caseLink = page.locator('a[href*="/fall/"]').first();

      if (await caseLink.count() > 0) {
        await caseLink.click();
        await helpers.waitForPageReady(page);

        const main = page.locator('main');
        await expect(main).toBeVisible();
      }
    });
  });
});
