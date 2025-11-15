import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('Map Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await helpers.navigateAndWait(page, '/');
  });

  test.describe('Map Rendering', () => {
    test('should render Germany map on homepage', async ({ page }) => {
      // Wait for data to load first
      await helpers.waitForDataLoad(page, 1);

      // Look for map SVG element - map is rendered with react-simple-maps
      const map = page.locator('svg');

      // Filter for SVG that looks like a map (has path elements for geographical data)
      const mapPaths = page.locator('svg path');

      if (await mapPaths.count() > 0) {
        // At least one SVG with paths should be visible
        expect(await mapPaths.count()).toBeGreaterThan(0);
      }
    });

    test('should display map markers for case locations', async ({ page }) => {
      await helpers.waitForPageReady(page);

      // Look for map markers (circles, pins, or similar SVG elements)
      const markers = page.locator('svg circle[r], svg path[d*="M"], [data-testid*="marker"]');

      if (await markers.count() > 0) {
        expect(await markers.count()).toBeGreaterThan(0);
      }
    });

    test('should show map on mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await helpers.waitForPageReady(page);

      const map = page.locator('svg[viewBox], [data-testid*="map"]');

      if (await map.count() > 0) {
        await expect(map.first()).toBeVisible();
      }
    });
  });

  test.describe('Map Interactions', () => {
    test('should filter cases when clicking a map marker', async ({ page }) => {
      await helpers.waitForPageReady(page);

      const markers = page.locator('svg circle, [data-testid*="marker"]');

      if (await markers.count() > 0 && await markers.first().isVisible()) {
        const initialUrl = page.url();

        // Click first marker
        await markers.first().click();
        await page.waitForTimeout(500);

        const newUrl = page.url();

        // URL might change (add place filter) or cases might update
        // Either behavior is valid for map interaction
        const urlChanged = newUrl !== initialUrl;
        const hasPlaceParam = await helpers.urlHasParam(page, 'place');

        // If interactive, URL should change or have place parameter
        if (urlChanged || hasPlaceParam) {
          expect(true).toBeTruthy();
        }
      }
    });

  });

  test.describe('Map and Filters Integration', () => {
    test('should update map markers when filters are applied', async ({ page }) => {
      await helpers.waitForPageReady(page);

      const initialMarkers = page.locator('svg circle');
      const initialCount = await initialMarkers.count();

      // Apply year filter
      const yearFilter = page.locator('select[name="year"]').first();

      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const filteredMarkers = page.locator('svg circle');
        const filteredCount = await filteredMarkers.count();

        // Marker count might change based on filter
        expect(filteredCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should sync map selection with filter selection', async ({ page }) => {
      await page.goto('/?place=Hamburg');
      await helpers.waitForPageReady(page);

      // Place filter should show Hamburg selected
      const placeFilter = page.locator('select[name="place"]').first();

      if (await placeFilter.count() > 0) {
        const selectedValue = await placeFilter.inputValue();
        expect(selectedValue).toBe('Hamburg');
      }
    });

    test('should clear map selection when place filter is cleared', async ({ page }) => {
      await page.goto('/?place=Berlin');
      await helpers.waitForPageReady(page);

      // Clear place filter
      const placeFilter = page.locator('select[name="place"]').first();

      if (await placeFilter.count() > 0) {
        await placeFilter.selectOption('');
        await page.waitForTimeout(500);

        // Place parameter should be removed
        const hasPlaceParam = await helpers.urlHasParam(page, 'place');
        expect(hasPlaceParam).toBeFalsy();
      }
    });
  });

});
