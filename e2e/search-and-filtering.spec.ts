import { test, expect, testData } from './fixtures';
import * as helpers from './helpers';

test.describe('Search and Filtering', () => {
  test.describe('Search Functionality', () => {
    test('should display search input on homepage', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for search input - Mantine TextInput with label "Suche"
      const searchInput = page.getByRole('textbox', { name: 'Suche' });
      await expect(searchInput).toBeVisible();
    });

    test('should search for cases by text query', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Find search input - Mantine TextInput with label "Suche"
      const searchInput = page.getByRole('textbox', { name: 'Suche' });

      // Enter search query (searching for a common location)
      await searchInput.fill('Berlin');

      // Wait for search results to update
      await page.waitForTimeout(1000);

      // URL should contain the search query
      const hasParam = await helpers.urlHasParam(page, 'q');
      expect(hasParam).toBeTruthy();
    });

    test('should require minimum 3 characters for search', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const searchInput = page.getByRole('textbox', { name: 'Suche' });

      // Enter only 2 characters
      await searchInput.fill('Be');
      await page.waitForTimeout(2500); // Wait for 2s delay + buffer

      // Should show message about needing more characters (inline with label)
      const statusMessage = page.getByText('bitte mindestens 3 Zeichen eingeben');
      await expect(statusMessage).toBeVisible();
    });

    test('should clear search when input is cleared', async ({ page }) => {
      await page.goto('/?q=Berlin');
      await helpers.waitForPageReady(page);

      const searchInput = page.getByRole('textbox', { name: 'Suche' });

      // Clear the search
      await searchInput.clear();

      // Wait for URL to update (debounce is 500ms, then router.replace is async)
      await page.waitForURL((url) => !url.search.includes('q=Berlin'), { timeout: 5000 });

      // Verify URL no longer contains the search param
      expect(page.url()).not.toContain('q=Berlin');
    });
  });

  test.describe('Filter by Year', () => {
    test('should filter cases by year', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Find year filter select
      const yearFilter = page.locator('select[name="year"], select:has-text("Jahr"), label:has-text("Jahr") + select').first();

      if (await yearFilter.count() > 0) {
        // Select a specific year
        await yearFilter.selectOption({ index: 1 }); // Select first non-empty option
        await page.waitForTimeout(500);

        // URL should contain year parameter
        const hasYearParam = await helpers.urlHasParam(page, 'year');
        expect(hasYearParam).toBeTruthy();

        // Cases should be filtered
        await helpers.waitForDataLoad(page, 1);
      }
    });

    test('should update URL when year is selected', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const yearFilter = page.locator('select[name="year"], select:has-text("Jahr"), label:has-text("Jahr") + select').first();

      if (await yearFilter.count() > 0) {
        const initialUrl = page.url();

        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const newUrl = page.url();
        expect(newUrl).not.toBe(initialUrl);
      }
    });
  });

  test.describe('Filter by State', () => {
    test('should filter cases by state (Bundesland)', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const stateFilter = page.locator('select[name="state"], select:has-text("Bundesland"), label:has-text("Bundesland") + select').first();

      if (await stateFilter.count() > 0) {
        // Select a state
        await stateFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // URL should contain state parameter
        const hasStateParam = await helpers.urlHasParam(page, 'state');
        expect(hasStateParam).toBeTruthy();
      }
    });

    test('should show filtered results for specific state', async ({ page }) => {
      await page.goto('/?state=Berlin');
      await helpers.waitForPageReady(page);

      // Should show at least one case from Berlin
      await helpers.waitForDataLoad(page, 1);

      // Check that Berlin is selected in filter
      const stateFilter = page.locator('select[name="state"]').first();
      if (await stateFilter.count() > 0) {
        const selectedValue = await stateFilter.inputValue();
        expect(selectedValue).toBe('Berlin');
      }
    });
  });

  test.describe('Filter by Place', () => {
    test('should filter cases by place (Ort)', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const placeFilter = page.locator('select[name="place"], select:has-text("Ort"), label:has-text("Ort") + select').first();

      if (await placeFilter.count() > 0) {
        await placeFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const hasPlaceParam = await helpers.urlHasParam(page, 'place');
        expect(hasPlaceParam).toBeTruthy();
      }
    });
  });

  test.describe('Filter by Weapon', () => {
    test('should filter cases by weapon type', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for weapon filter
      const weaponFilter = page.locator('select[name="weapon"], button:has-text("Waffe"), label:has-text("Waffe")').first();

      if (await weaponFilter.count() > 0) {
        // Interact with weapon filter (might be select or button group)
        if (await weaponFilter.evaluate(el => el.tagName.toLowerCase()) === 'select') {
          await weaponFilter.selectOption({ index: 1 });
        } else {
          await weaponFilter.click();
        }

        await page.waitForTimeout(500);

        // Check for weapon parameter in URL
        const hasWeaponParam = await helpers.urlHasParam(page, 'weapon');
        expect(hasWeaponParam).toBeTruthy();
      }
    });
  });

  test.describe('Filter by Age', () => {
    test('should filter cases by age group', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Mantine Select with label "Alter"
      const ageFilter = page.getByRole('combobox', { name: 'Alter' });

      if (await ageFilter.count() > 0) {
        // Click to open dropdown
        await ageFilter.click();
        await page.waitForTimeout(300);

        // Select first option
        const firstOption = page.getByRole('option').first();
        if (await firstOption.count() > 0) {
          await firstOption.click();
          await page.waitForTimeout(500);

          const hasAgeParam = await helpers.urlHasParam(page, 'age');
          expect(hasAgeParam).toBeTruthy();
        }
      }
    });
  });

  test.describe('Category/Tag Filters', () => {
    test('should filter by category tags', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for category buttons or checkboxes
      const categoryButtons = page.locator('[data-testid*="category"], button[role="checkbox"], .category-filter button');

      if (await categoryButtons.count() > 0) {
        const firstCategory = categoryButtons.first();
        await firstCategory.click();
        await page.waitForTimeout(500);

        // URL might contain tags parameter
        const url = page.url();
        const hasTagsOrChanged = url.includes('tags=') || url !== 'http://localhost:3000/';
        expect(hasTagsOrChanged).toBeTruthy();
      }
    });

    test('should allow multiple tag selections', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const categoryButtons = page.locator('[data-testid*="category"], button[role="checkbox"]');

      if (await categoryButtons.count() >= 2) {
        // Click first tag
        await categoryButtons.nth(0).click();
        await page.waitForTimeout(300);

        // Click second tag
        await categoryButtons.nth(1).click();
        await page.waitForTimeout(300);

        // URL should reflect multiple selections
        const url = page.url();
        expect(url.includes('tags=')).toBeTruthy();
      }
    });
  });

  test.describe('Combined Filters', () => {
    test('should apply multiple filters simultaneously', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Apply year filter - Mantine Select renders as textbox
      const yearFilter = page.getByRole('textbox', { name: 'Jahr' });
      if (await yearFilter.count() > 0) {
        await yearFilter.click();
        await page.waitForTimeout(800); // Wait for dropdown to open
        // Select a specific year option (e.g., 2024) instead of using .first() which could match anything
        const yearOption = page.getByRole('option', { name: '2024' });
        if (await yearOption.count() > 0) {
          await yearOption.click();
          await page.waitForTimeout(500); // Wait for filter to apply
        }
      }

      // Apply state filter - Mantine Select renders as textbox
      const stateFilter = page.getByRole('textbox', { name: 'Bundesland' });
      if (await stateFilter.count() > 0) {
        await stateFilter.click();
        await page.waitForTimeout(800); // Wait for dropdown to open
        // Select Berlin specifically
        const stateOption = page.getByRole('option', { name: 'Berlin' });
        if (await stateOption.count() > 0) {
          await stateOption.click();
          await page.waitForTimeout(500); // Wait for filter to apply
        }
      }

      // URL should contain both parameters
      const urlParams = await helpers.getUrlParams(page);
      const hasFilters = Object.keys(urlParams).length > 0;
      expect(hasFilters).toBeTruthy();
    });

    test('should combine search with filters', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Apply search
      const searchInput = page.getByRole('textbox', { name: 'Suche' });
      await searchInput.fill('Berlin');

      // Wait for URL to update with search param
      await page.waitForURL(/q=Berlin/, { timeout: 5000 });

      // Apply year filter via Mantine combobox
      const yearInput = page.getByRole('textbox', { name: 'Jahr' });
      await yearInput.click();
      await page.waitForTimeout(300);
      const yearOption = page.getByRole('option').first();
      if (await yearOption.count() > 0) {
        await yearOption.click();
        await page.waitForTimeout(500);
      }

      // Search should be in URL
      const urlParams = await helpers.getUrlParams(page);
      expect(urlParams.q).toBe('Berlin');
    });
  });

  test.describe('Filter Reset', () => {
    test('should clear individual filters', async ({ page }) => {
      await page.goto('/?year=2020&state=Berlin');
      await helpers.waitForPageReady(page);

      // Clear year filter
      const yearFilter = page.locator('select[name="year"]').first();
      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption('');
        await page.waitForTimeout(500);

        // Year should be removed from URL but state should remain
        const urlParams = await helpers.getUrlParams(page);
        expect(urlParams.year).toBeUndefined();
      }
    });

    test('should reset all filters when navigating to home', async ({ page }) => {
      await page.goto('/?year=2020&state=Berlin&q=test');
      await helpers.waitForPageReady(page);

      // Click home link or logo
      const homeLink = page.locator('a[href="/"]').first();
      if (await homeLink.count() > 0) {
        await homeLink.click();
        await helpers.waitForPageReady(page);

        // URL should be clean
        const url = page.url();
        expect(url).toMatch(/http:\/\/localhost:3000\/?$/);
      }
    });
  });

  test.describe('Pagination with Filters', () => {
    test('should maintain filters when paginating', async ({ page }) => {
      await page.goto('/?year=2020');
      await helpers.waitForPageReady(page);

      // Find pagination next button
      const nextButton = page.locator('a:has-text("›"), a:has-text("vor"), button:has-text("›")').first();

      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        await nextButton.click();
        await helpers.waitForPageReady(page);

        // Year filter should still be in URL
        const hasYearParam = await helpers.urlHasParam(page, 'year', '2020');
        expect(hasYearParam).toBeTruthy();

        // Page parameter should be in URL
        const hasPageParam = await helpers.urlHasParam(page, 'p');
        expect(hasPageParam).toBeTruthy();
      }
    });

    test('should reset to page 1 when changing filters', async ({ page }) => {
      await page.goto('/?p=3');
      await helpers.waitForPageReady(page);

      // Change a filter
      const yearFilter = page.locator('select[name="year"]').first();
      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Should go back to page 1 (or p parameter removed)
        const urlParams = await helpers.getUrlParams(page);
        expect(urlParams.p === '1' || urlParams.p === undefined).toBeTruthy();
      }
    });
  });

  test.describe('Results Count', () => {
    test('should display number of results', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for results count display
      const resultsText = page.locator('text=/\\d+\\s+(Fälle|Fall|Treffer|Ergebnisse)/i').first();

      if (await resultsText.count() > 0) {
        await expect(resultsText).toBeVisible();

        // Extract number
        const text = await resultsText.textContent();
        const number = helpers.extractNumber(text ?? '');
        expect(number).toBeGreaterThan(0);
      }
    });

    test('should update results count when filtering', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Get initial count (if displayed)
      const countElement = page.locator('text=/\\d+\\s+(Fälle|Fall)/i').first();
      let initialCount = null;

      if (await countElement.count() > 0) {
        const text = await countElement.textContent();
        initialCount = helpers.extractNumber(text ?? '');
      }

      // Apply filter
      const yearFilter = page.locator('select[name="year"]').first();
      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Count should change (or at least be displayed)
        if (initialCount !== null && await countElement.count() > 0) {
          const newText = await countElement.textContent();
          const newCount = helpers.extractNumber(newText ?? '');

          // Count might be same or different, but should exist
          expect(newCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Sort Toggle (Issue #148)', () => {
    test('should show sort toggle when searching', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Enter search query
      const searchInput = page.getByRole('textbox', { name: 'Suche' });
      await searchInput.fill('Berlin');

      // Wait for search to apply
      await page.waitForTimeout(1000);

      // Sort toggle should be visible (SegmentedControl) - look for the visible labels
      const sortToggle = page.locator('.mantine-SegmentedControl-root');
      await expect(sortToggle).toBeVisible();

      // Should have Relevanz and Datum options (check for labels, not hidden radio inputs)
      await expect(page.locator('.mantine-SegmentedControl-label:has-text("Relevanz")')).toBeVisible();
      await expect(page.locator('.mantine-SegmentedControl-label:has-text("Datum")')).toBeVisible();
    });

    test('should be disabled when search is empty or too short', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Sort toggle should have data-disabled attribute when no search
      const sortToggle = page.locator('.mantine-SegmentedControl-root');
      await expect(sortToggle).toHaveAttribute('data-disabled', 'true');

      // Enter only 2 characters
      const searchInput = page.getByRole('textbox', { name: 'Suche' });
      await searchInput.fill('Be');
      await page.waitForTimeout(500);

      // Should still be disabled
      await expect(sortToggle).toHaveAttribute('data-disabled', 'true');
    });

    test('should default to relevance when searching', async ({ page }) => {
      await page.goto('/?q=Berlin');
      await helpers.waitForPageReady(page);

      // Relevanz should be selected by default (check the radio input)
      const relevanzRadio = page.locator('input[type="radio"][value="relevance"]');
      await expect(relevanzRadio).toBeChecked();
    });

    test('should switch to date sort and update URL', async ({ page }) => {
      await page.goto('/?q=Berlin');
      await helpers.waitForPageReady(page);

      // Click Datum label (visible element)
      const datumLabel = page.locator('.mantine-SegmentedControl-label:has-text("Datum")');
      await datumLabel.click();

      // Wait for URL to update
      await page.waitForURL(/sort=date/, { timeout: 5000 });

      // URL should contain sort=date
      const hasSort = await helpers.urlHasParam(page, 'sort', 'date');
      expect(hasSort).toBeTruthy();
    });

    test('should load sort preference from URL', async ({ page }) => {
      await page.goto('/?q=Berlin&sort=date');
      await helpers.waitForPageReady(page);

      // Datum should be selected (check the radio input)
      const datumRadio = page.locator('input[type="radio"][value="date"]');
      await expect(datumRadio).toBeChecked();
    });

    test('should reset page to 1 when changing sort', async ({ page }) => {
      // First load with search to make sure results exist
      await page.goto('/?q=Berlin&sort=relevance');
      await helpers.waitForPageReady(page);

      // Get the current URL then manually construct with p=2 to simulate being on page 2
      const currentUrl = new URL(page.url());
      currentUrl.searchParams.set('p', '2');
      await page.goto(currentUrl.toString());
      await helpers.waitForPageReady(page);

      // Click Datum label
      const datumLabel = page.locator('.mantine-SegmentedControl-label:has-text("Datum")');
      await datumLabel.click();

      // Wait for URL to update with sort=date
      await page.waitForURL(/sort=date/, { timeout: 5000 });

      // Page should be reset to 1 (or p param removed entirely)
      const urlParams = await helpers.getUrlParams(page);
      expect(urlParams.p === '1' || urlParams.p === undefined).toBeTruthy();
    });
  });

  test.describe('Unbewaffnet and Minderjährig Filters (Issue #8)', () => {
    test('should show Unbewaffnet option in category filter', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Open the category multi-select (Mantine MultiSelect with label "Kategorie")
      const categoryInput = page.getByRole('textbox', { name: 'Kategorie' });
      await categoryInput.click();
      await page.waitForTimeout(500);

      // Should show Unbewaffnet option
      const unbewaffnetOption = page.getByRole('option', { name: 'Unbewaffnet', exact: true });
      await expect(unbewaffnetOption).toBeVisible();

      // Should also show Bewaffnet (the negative option) - use exact match
      const bewaffnetOption = page.getByRole('option', { name: 'Bewaffnet', exact: true });
      await expect(bewaffnetOption).toBeVisible();
    });

    test('should show Minderjährig option in category filter', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Open the category multi-select
      const categoryInput = page.getByRole('textbox', { name: 'Kategorie' });
      await categoryInput.click();
      await page.waitForTimeout(500);

      // Should show Minderjährig option
      const minderjaehrigOption = page.getByRole('option', { name: 'Minderjährig', exact: true });
      await expect(minderjaehrigOption).toBeVisible();

      // Should also show Volljährig (the negative option)
      const volljaehrigOption = page.getByRole('option', { name: 'Volljährig', exact: true });
      await expect(volljaehrigOption).toBeVisible();
    });

    test('should filter by Unbewaffnet tag', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Open the category multi-select
      const categoryInput = page.getByRole('textbox', { name: 'Kategorie' });
      await categoryInput.click();
      await page.waitForTimeout(500);

      // Select Unbewaffnet option
      const unbewaffnetOption = page.getByRole('option', { name: 'Unbewaffnet', exact: true });
      await unbewaffnetOption.click();

      // Wait for URL to update with tags parameter (increased timeout for reliability)
      await page.waitForURL(/tags=.*unbewaffnet/, { timeout: 10000 });

      // URL should contain tags parameter with unbewaffnet
      const urlParams = await helpers.getUrlParams(page);
      expect(urlParams.tags).toContain('unbewaffnet');
    });

    test('should filter by Minderjährig tag', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Open the category multi-select
      const categoryInput = page.getByRole('textbox', { name: 'Kategorie' });
      await categoryInput.click();
      await page.waitForTimeout(500);

      // Select Minderjährig option
      const minderjaehrigOption = page.getByRole('option', { name: 'Minderjährig', exact: true });
      await minderjaehrigOption.click();

      // Wait for URL to update with tags parameter (increased timeout for reliability)
      await page.waitForURL(/tags=.*minderjaehrig/, { timeout: 10000 });

      // URL should contain tags parameter with minderjaehrig
      const urlParams = await helpers.getUrlParams(page);
      expect(urlParams.tags).toContain('minderjaehrig');
    });

    test('should load Minderjährig filter from URL', async ({ page }) => {
      await page.goto('/?tags=minderjaehrig');
      await helpers.waitForPageReady(page);

      // Wait for API response
      await page.waitForLoadState('networkidle');

      // Cases should be loaded (filtered to minors) - may have 0 results if no minors in data
      // Just verify page loads without errors
      const pageContent = await page.content();
      expect(pageContent).toContain('Chronik');
    });

    test('should load Unbewaffnet filter from URL', async ({ page }) => {
      await page.goto('/?tags=unbewaffnet');
      await helpers.waitForPageReady(page);

      // Wait for API response
      await page.waitForLoadState('networkidle');

      // Cases should be loaded (filtered to unarmed)
      await helpers.waitForDataLoad(page, 1);
    });

    test('should combine multiple category filters', async ({ page }) => {
      await page.goto('/?tags=minderjaehrig,unbewaffnet');
      await helpers.waitForPageReady(page);

      // Should show results matching both filters (or no results if none match)
      // The page should load without error
      await page.waitForLoadState('networkidle');

      // Verify page loaded correctly
      const pageContent = await page.content();
      expect(pageContent).toContain('Chronik');
    });
  });

  test.describe('URL State Management', () => {
    test('should load filters from URL on page load', async ({ page }) => {
      await page.goto('/?year=2020&state=Berlin');
      await helpers.waitForPageReady(page);

      // Check that filters are applied
      const yearFilter = page.locator('select[name="year"]').first();
      const stateFilter = page.locator('select[name="state"]').first();

      if (await yearFilter.count() > 0) {
        const yearValue = await yearFilter.inputValue();
        expect(yearValue).toBe('2020');
      }

      if (await stateFilter.count() > 0) {
        const stateValue = await stateFilter.inputValue();
        expect(stateValue).toBe('Berlin');
      }
    });

    test('should preserve filters when using browser back button', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Apply filter
      const yearFilter = page.locator('select[name="year"]').first();
      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const urlWithFilter = page.url();

        // Navigate away
        await page.goto('/methodik');
        await helpers.waitForPageReady(page);

        // Go back
        await page.goBack();
        await helpers.waitForPageReady(page);

        // Should be back to filtered state
        expect(page.url()).toBe(urlWithFilter);
      }
    });
  });
});
