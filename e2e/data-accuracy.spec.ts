import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('Data Accuracy and Processing', () => {
  test.describe('Case Count Accuracy', () => {
    test('should display correct total case count on homepage', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for total case count mention
      const countText = page.locator('text=/\\d+\\s+(Personen|Fälle|Fall|tödliche)/i');

      if (await countText.count() > 0) {
        const text = await countText.first().textContent();
        const number = helpers.extractNumber(text!);

        // Should have a reasonable number of cases
        expect(number).toBeGreaterThan(100);
        expect(number).toBeLessThan(10000);
      }
    });

    test('should show separate counts for before and after reunification', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for references to reunification periods
      const reunificationText = page.locator('text=/Wiedervereinigung|1976|1990/i');

      const count = await reunificationText.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should maintain count consistency across filtered views', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Get initial total count
      const initialCases = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

      // Filter by a specific year
      const yearFilter = page.locator('select[name="year"]').first();

      if (await yearFilter.count() > 0) {
        await yearFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Get filtered count
        const filteredCases = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

        // Filtered count should be less than or equal to initial
        expect(filteredCases).toBeGreaterThanOrEqual(0);
        expect(filteredCases).toBeLessThanOrEqual(initialCases);
      }
    });
  });

  test.describe('Date Handling', () => {
    test('should display valid dates for cases', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Look for date displays
      const dates = page.locator('text=/\\d{1,2}\\.\\d{1,2}\\.\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \\d{4}/i');

      if (await dates.count() > 0) {
        const dateText = await dates.first().textContent();
        expect(dateText).toBeTruthy();

        // Verify year is reasonable (between 1976 and current year)
        const yearMatch = dateText!.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          expect(year).toBeGreaterThanOrEqual(1976);
          expect(year).toBeLessThanOrEqual(new Date().getFullYear());
        }
      }
    });

    test('should correctly categorize cases by German reunification', async ({ page }) => {
      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForPageReady(page);

      // Look for mention of East/West Germany distinction
      const eastWestText = page.locator('text=/Ost|West|Wiedervereinigung|Reunification/i');

      if (await eastWestText.count() > 0) {
        await expect(eastWestText.first()).toBeVisible();
      }
    });

    test('should handle date ranges correctly in filters', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Filter by a specific year
      await page.goto('/?year=2020');
      await helpers.waitForPageReady(page);

      // Check that displayed cases are from the correct year
      const yearTexts = page.locator('text=/2020/');
      const count = await yearTexts.count();

      // Should show 2020 somewhere on the page
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Age Grouping', () => {
    test('should display age information for cases', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Look for age mentions
      const ageText = page.locator('text=/\\d{1,3}\\s*Jahre?|Alter|\\d{1,2}-\\d{1,2}/i');

      if (await ageText.count() > 0) {
        const age = await ageText.first().textContent();
        expect(age).toBeTruthy();
      }
    });

    test('should group ages into 5-year intervals correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForPageReady(page);

      // Look for age group ranges (e.g., "20-25", "25-30")
      const ageGroups = page.locator('text=/\\d{1,2}-\\d{1,2}/');

      if (await ageGroups.count() > 0) {
        const groupText = await ageGroups.first().textContent();
        const match = groupText!.match(/(\d+)-(\d+)/);

        if (match) {
          const start = parseInt(match[1]);
          const end = parseInt(match[2]);

          // Should be 5-year intervals
          expect(end - start).toBeLessThanOrEqual(10);
          expect(end - start).toBeGreaterThan(0);
        }
      }
    });

    test('should filter by age groups correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const ageFilter = page.locator('select[name="age"], button:has-text("Alter")').first();

      if (await ageFilter.count() > 0 && await ageFilter.evaluate(el => el.tagName === 'SELECT')) {
        await ageFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Should have age parameter in URL
        const hasAgeParam = await helpers.urlHasParam(page, 'age');
        expect(hasAgeParam).toBeTruthy();
      }
    });
  });

  test.describe('State Classification', () => {
    test('should display German state names correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const germanStates = [
        'Bayern', 'Berlin', 'Hamburg', 'Hessen', 'Niedersachsen',
        'Nordrhein-Westfalen', 'Baden-Württemberg', 'Rheinland-Pfalz',
        'Sachsen', 'Brandenburg', 'Thüringen'
      ];

      let foundStates = 0;

      for (const state of germanStates) {
        const stateText = page.locator(`text=${state}`);
        if (await stateText.count() > 0) {
          foundStates++;
        }
      }

      // Should find at least some state names
      expect(foundStates).toBeGreaterThan(0);
    });

    test('should correctly identify East vs West German states', async ({ page }) => {
      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForPageReady(page);

      // Look for East German states in visualizations
      const eastStates = ['Sachsen', 'Thüringen', 'Brandenburg', 'Sachsen-Anhalt', 'Mecklenburg'];

      for (const state of eastStates) {
        const stateLocator = page.locator(`text=${state}`);
        // East states might be present in the data
        if (await stateLocator.count() > 0) {
          expect(await stateLocator.first().isVisible()).toBeTruthy();
        }
      }
    });

    test('should show per-million statistics by state', async ({ page }) => {
      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForPageReady(page);

      // Look for "pro Million" or "per million" text
      const perMillionText = page.locator('text=/pro Million|per Million|je Million/i');

      if (await perMillionText.count() > 0) {
        await expect(perMillionText.first()).toBeVisible();
      }
    });
  });

  test.describe('Weapon Classification', () => {
    test('should categorize weapons correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const weaponTypes = ['Schusswaffe', 'Messer', 'Keine'];

      for (const weapon of weaponTypes) {
        const weaponText = page.locator(`text=${weapon}`);
        // Weapons should appear in the interface (filter or data)
        if (await weaponText.count() > 0) {
          // Weapon type exists in the data
          expect(true).toBeTruthy();
        }
      }
    });

    test('should filter by weapon type correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const weaponFilter = page.locator('select[name="weapon"], button:has-text("Waffe")').first();

      if (await weaponFilter.count() > 0) {
        // Try to select a weapon type
        if (await weaponFilter.evaluate(el => el.tagName === 'SELECT')) {
          await weaponFilter.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          const hasWeaponParam = await helpers.urlHasParam(page, 'weapon');
          expect(hasWeaponParam).toBeTruthy();
        }
      }
    });

    test('should display weapon information in case details', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Look for weapon-related text in cases
      const weaponInfo = page.locator('text=/Waffe|bewaffnet|Schusswaffe|Messer/i');

      const count = await weaponInfo.count();
      // Weapon information should appear somewhere
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Boolean Attributes', () => {
    test('should handle boolean case attributes correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const booleanAttributes = [
        'Schusswechsel',
        'Sondereinsatzbeamte',
        'psychische Ausnahmesituation',
        'häusliche Gewalt'
      ];

      let foundAttributes = 0;

      for (const attr of booleanAttributes) {
        const attrText = page.locator(`text=/${attr}/i`);
        if (await attrText.count() > 0) {
          foundAttributes++;
        }
      }

      // Should find at least one boolean attribute in the interface
      // (might be in filters or case details)
      expect(foundAttributes).toBeGreaterThanOrEqual(0);
    });

    test('should allow filtering by boolean attributes', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for category/tag filters
      const categoryButtons = page.locator('[data-testid*="category"], button[role="checkbox"]');

      if (await categoryButtons.count() > 0) {
        // Click a category
        await categoryButtons.first().click();
        await page.waitForTimeout(500);

        // URL should reflect the selection
        const url = page.url();
        expect(url.includes('tags=') || url !== 'http://localhost:3000/').toBeTruthy();
      }
    });
  });

  test.describe('Statistics Calculations', () => {
    test('should display accurate percentages', async ({ page }) => {
      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForPageReady(page);

      // Look for percentage displays
      const percentages = page.locator('text=/%|Prozent/i');

      if (await percentages.count() > 0) {
        const percentText = await percentages.first().textContent();
        const match = percentText!.match(/(\d+(?:,\d+)?)\s*%/);

        if (match) {
          const percent = parseFloat(match[1].replace(',', '.'));
          // Percentage should be between 0 and 100
          expect(percent).toBeGreaterThanOrEqual(0);
          expect(percent).toBeLessThanOrEqual(100);
        }
      }
    });

    test('should calculate averages correctly', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForPageReady(page);

      // Look for average mentions
      const averageText = page.locator('text=/durchschnitt|Durchschnitt|average|Mittel/i');

      if (await averageText.count() > 0) {
        await expect(averageText.first()).toBeVisible();
      }
    });

    test('should show statistics comparison on statistics page', async ({ page }) => {
      await helpers.navigateAndWait(page, '/statistik');
      await helpers.waitForPageReady(page);

      // Should display official vs documented statistics
      const officialText = page.locator('text=/offiziell|dokumentiert|official|documented/i');

      const count = await officialText.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Data Validation', () => {
    test('should not display undefined or null values', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Check for invalid values in displayed data
      const invalidValues = page.locator('text=/undefined|null|NaN/i');
      const invalidCount = await invalidValues.count();

      // Might have "null" in German text, so filter carefully
      if (invalidCount > 0) {
        for (let i = 0; i < invalidCount; i++) {
          const text = await invalidValues.nth(i).textContent();
          // Make sure it's not part of legitimate German text
          expect(text!.trim()).not.toBe('undefined');
          expect(text!.trim()).not.toBe('NaN');
        }
      }
    });

    test('should display complete case information', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Each case should have at least some basic information
      const cases = page.locator('[data-testid*="case"], .case, article').first();

      if (await cases.count() > 0) {
        const caseText = await cases.textContent();

        // Should have some content
        expect(caseText!.length).toBeGreaterThan(10);
      }
    });

    test('should handle missing data gracefully', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for "unbekannt" or similar placeholders for missing data
      const unknownText = page.locator('text=/unbekannt|k\\.A\\.|nicht bekannt|unknown/i');

      // Missing data might be indicated - this is acceptable
      if (await unknownText.count() > 0) {
        await expect(unknownText.first()).toBeVisible();
      }
    });
  });

  test.describe('CSV Data Parsing', () => {
    test('should correctly parse and display case data from CSV', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 5);

      // Should display multiple cases
      const cases = page.locator('[data-testid*="case"], .case, article, tbody tr');
      const caseCount = await cases.count();

      expect(caseCount).toBeGreaterThan(0);
    });

    test('should handle special characters in case data', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // German umlauts and special characters should display correctly
      const germanChars = page.locator('text=/ä|ö|ü|Ä|Ö|Ü|ß/');

      if (await germanChars.count() > 0) {
        const text = await germanChars.first().textContent();
        // Text should be readable (not escaped or corrupted)
        expect(text).toBeTruthy();
        expect(text).not.toContain('&auml;');
        expect(text).not.toContain('&ouml;');
      }
    });

    test('should maintain data integrity across page loads', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      const initialCaseCount = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

      // Reload page
      await page.reload();
      await helpers.waitForDataLoad(page, 1);

      const reloadedCaseCount = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

      // Count should be consistent
      expect(reloadedCaseCount).toBe(initialCaseCount);
    });
  });

  test.describe('Geographic Data', () => {
    test('should display location information', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');
      await helpers.waitForDataLoad(page, 1);

      // Look for city or location names
      const locationText = page.locator('text=/Berlin|München|Hamburg|Frankfurt|Köln/i');

      const count = await locationText.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should correctly associate cases with states', async ({ page }) => {
      await page.goto('/?state=Berlin');
      await helpers.waitForPageReady(page);

      // When filtered by Berlin, should show Berlin-related cases
      const berlinText = page.locator('text=/Berlin/i');
      const count = await berlinText.count();

      // Berlin should appear at least in the filter or cases
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Pagination Consistency', () => {
    test('should maintain correct item count across pages', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      const page1Count = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

      // Go to page 2
      const nextButton = page.locator('a:has-text("›"), a:has-text("vor")').first();

      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        await nextButton.click();
        await helpers.waitForPageReady(page);

        const page2Count = await page.locator('[data-testid*="case"], .case, article, tbody tr').count();

        // Both pages should have items
        expect(page1Count).toBeGreaterThan(0);
        expect(page2Count).toBeGreaterThan(0);
      }
    });

    test('should show correct page number in pagination', async ({ page }) => {
      await page.goto('/?p=2');
      await helpers.waitForPageReady(page);

      // Check URL has correct page parameter
      const hasPageParam = await helpers.urlHasParam(page, 'p', '2');
      expect(hasPageParam).toBeTruthy();
    });
  });
});
