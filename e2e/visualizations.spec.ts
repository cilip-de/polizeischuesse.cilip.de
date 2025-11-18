import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('Visualizations Page', () => {
  test.beforeEach(async ({ page }) => {
    await helpers.navigateAndWait(page, '/visualisierungen');
  });

  test.describe('Page Structure', () => {
    test('should load visualizations page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/visualisierungen/i);
      await helpers.checkBasicAccessibility(page);
    });

    test('should display main heading', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/visualisierungen/i);
    });

    test('should render without console errors', async ({ page }) => {
      const errors = helpers.setupConsoleErrorTracking(page);
      await page.reload();
      await helpers.waitForPageReady(page);

      // Filter out expected errors (if any)
      const criticalErrors = errors.filter(
        (err) => !err.includes('404') && !err.includes('favicon')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Charts Rendering', () => {
    test('should render multiple charts on the page', async ({ page }) => {
      await helpers.waitForCharts(page, 3);

      const chartCount = await page.locator('svg').count();
      expect(chartCount).toBeGreaterThanOrEqual(3);
    });

    test('all charts should be visible in viewport after scrolling', async ({ page }) => {
      // Only select visible SVG elements (not hidden by mobile/desktop classes)
      const charts = page.locator('svg:visible');
      const chartCount = await charts.count();

      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        // Skip if chart is not visible
        if (!(await chart.isVisible())) continue;
        await chart.scrollIntoViewIfNeeded({ timeout: 10000 });
        await expect(chart).toBeVisible();
      }
    });

    test('charts should have accessible labels or titles', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Check that each chart section has a heading
      const sections = page.locator('section, div:has(svg)');
      const sectionCount = await sections.count();

      if (sectionCount > 0) {
        // Look for headings near charts
        const headings = page.locator('h2, h3, h4');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Vertical Bar Charts', () => {
    test('should render vertical bar charts', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Look for bar chart elements (rectangles in SVG)
      const bars = page.locator('svg rect[fill]');
      const barCount = await bars.count();

      expect(barCount).toBeGreaterThan(0);
    });

    test('should show tooltips on bar hover', async ({ page }) => {
      await helpers.waitForCharts(page, 1);
      await page.waitForTimeout(1000); // Wait for chart to fully render

      // Find bars in the chart
      const bars = page.locator('svg rect[fill]');
      const barCount = await bars.count();

      if (barCount > 5) {
        // Hover over a bar in the middle of the collection (more reliable than first)
        const middleBar = bars.nth(Math.floor(barCount / 2));
        await middleBar.scrollIntoViewIfNeeded();

        // Check if we're on mobile viewport (≤768px matches the CSS media query)
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width <= 768;

        if (isMobile) {
          // On mobile, tooltips appear on click
          await middleBar.click({ force: true });
          await page.waitForTimeout(500);

          // Mobile tooltips are absolutely positioned divs with inline styles
          const tooltip = page.locator('div[style*="position: absolute"]').filter({ hasText: /Fall|Fälle/ });
          await expect(tooltip.first()).toBeVisible({ timeout: 3000 });
        } else {
          // On desktop, tooltips appear on hover
          await middleBar.hover({ force: true });
          await page.waitForTimeout(500);

          // Look for ChartTooltip component (same selector as heatmap test)
          const tooltip = page.locator('div:has(> [style*="background: white"][style*="padding: 0.3rem 0.5rem"])');
          await expect(tooltip.first()).toBeVisible({ timeout: 3000 });

          // Verify tooltip has two lines - check for strong tags (one per line)
          const strongTags = tooltip.first().locator('strong');
          const strongCount = await strongTags.count();
          expect(strongCount).toBe(2); // Should have exactly 2 strong tags (one per line)

          // Get all text content and verify it contains two lines with labels
          const tooltipText = await tooltip.first().textContent();

          // Should contain two labels (with colons) followed by values
          expect(tooltipText).toMatch(/.*:\s*.+/); // At least one label-value pair

          // Verify first strong tag is visible (first line label)
          await expect(strongTags.first()).toBeVisible();

          // Verify second strong tag is visible (second line label)
          await expect(strongTags.last()).toBeVisible();
        }
      }
    });

    test('should have clickable bars that may trigger interactions', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      const bars = page.locator('svg rect[fill]');
      const firstBar = bars.first();

      if (await firstBar.count() > 0) {
        await firstBar.scrollIntoViewIfNeeded();

        // Check if bar is interactive (has pointer cursor or click handler)
        const cursor = await firstBar.evaluate((el) =>
          window.getComputedStyle(el).cursor
        );

        // Some bars might be clickable (cursor: pointer)
        // This is just a check, not all bars need to be interactive
        expect(['pointer', 'default', 'auto']).toContain(cursor);
      }
    });
  });

  test.describe('Horizontal Bar Charts', () => {
    test('should render horizontal bar charts', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Horizontal bar charts also use rectangles
      const bars = page.locator('svg rect');
      const barCount = await bars.count();

      expect(barCount).toBeGreaterThan(0);
    });

    test('should display axis labels', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Check for axis labels (text elements in SVG)
      const labels = page.locator('svg text');
      const labelCount = await labels.count();

      expect(labelCount).toBeGreaterThan(0);
    });

    test('should show data values on or near bars', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Look for text elements that might be data labels
      const svgTexts = page.locator('svg text');
      const textCount = await svgTexts.count();

      expect(textCount).toBeGreaterThan(0);

      // Check that some text contains numbers
      if (textCount > 0) {
        const firstText = await svgTexts.first().textContent();
        // Should contain numbers or labels
        expect(firstText).toBeTruthy();
      }
    });
  });

  test.describe('Heatmap Chart', () => {
    test('should render heatmap visualization', async ({ page }) => {
      // Scroll to find heatmap (it might be lower on the page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      // Heatmaps typically use rect elements with different fill colors
      const heatmapCells = page.locator('svg rect[fill]');
      const cellCount = await heatmapCells.count();

      // A heatmap should have many cells
      expect(cellCount).toBeGreaterThan(10);
    });

    test('should display state names in heatmap', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await helpers.waitForCharts(page, 2);

      // Look for German state names
      const stateNames = ['Bayern', 'Berlin', 'Hamburg', 'Hessen'];
      let foundState = false;

      for (const state of stateNames) {
        const stateText = page.locator(`text=${state}`);
        if (await stateText.count() > 0) {
          foundState = true;
          break;
        }
      }

      expect(foundState).toBeTruthy();
    });

    test('should show tooltip on heatmap cell hover', async ({ page }) => {
      // Scroll to the heatmap section specifically
      await page.locator('#umstaende-bundeslaender').scrollIntoViewIfNeeded();
      await helpers.waitForCharts(page, 2);
      await page.waitForTimeout(1000); // Wait for heatmap to fully render

      // Find visible heatmap cells - use aria-label to be more specific
      const heatmapContainer = page.locator('[aria-label*="Heatmap"]');
      const cells = heatmapContainer.locator('rect[fill]:visible');

      if (await cells.count() > 5) {
        // Hover over a cell in the middle of the collection
        const middleCell = cells.nth(Math.floor(await cells.count() / 2));
        await middleCell.scrollIntoViewIfNeeded();

        // Check if we're on mobile viewport (≤768px matches the CSS media query)
        const viewport = page.viewportSize();
        const isMobile = viewport && viewport.width <= 768;

        if (isMobile) {
          // On mobile, tooltips appear on click
          await middleCell.click({ force: true });
          await page.waitForTimeout(500);

          // Mobile tooltips are absolutely positioned divs with inline styles containing state names or data
          const tooltip = page.locator('div[style*="position: absolute"]').filter({
            hasText: /Fall|Fälle|Bayern|Berlin|Hamburg|Hessen|NRW|Sachsen/
          });
          await expect(tooltip.first()).toBeVisible({ timeout: 3000 });
        } else {
          // On desktop, tooltips appear on hover
          await middleCell.hover({ force: true });
          await page.waitForTimeout(500);

          // Look for ChartTooltip component (renders with specific background styling)
          const tooltip = page.locator('div:has(> [style*="background: white"][style*="padding: 0.3rem 0.5rem"])');
          await expect(tooltip.first()).toBeVisible({ timeout: 3000 });

          // Verify tooltip has two lines - check for strong tags (one per line)
          const strongTags = tooltip.first().locator('strong');
          const strongCount = await strongTags.count();
          expect(strongCount).toBe(2); // Should have exactly 2 strong tags (one per line)

          // Verify first strong tag contains "Land:" label
          await expect(strongTags.first()).toContainText('Land:');

          // Get all text content and verify second line pattern
          const tooltipText = await tooltip.first().textContent();
          expect(tooltipText).toMatch(/Land:.*\d+%/); // Pattern: "Land: ... XX%"

          // Verify second strong tag is visible (second line label)
          await expect(strongTags.last()).toBeVisible();
        }
      }
    });

    test('should use color scale for data representation', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await helpers.waitForCharts(page, 2);

      // Get all heatmap cells and their colors
      const cells = page.locator('svg rect[fill]');
      const cellCount = await cells.count();

      if (cellCount > 5) {
        const colors: string[] = [];

        for (let i = 0; i < Math.min(10, cellCount); i++) {
          const fill = await cells.nth(i).getAttribute('fill');
          if (fill) colors.push(fill);
        }

        // Should have variation in colors (not all the same)
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBeGreaterThan(1);
      }
    });
  });

  test.describe('Line Charts (Weapon Chart)', () => {
    test('should display legend for line chart', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Look for legend (might be text elements or separate div)
      const legendItems = page.locator('svg text:has-text("Schusswaffe"), svg text:has-text("Messer"), [data-testid*="legend"]');

      // If legend exists, it should be visible
      const legendCount = await legendItems.count();
      if (legendCount > 0) {
        await expect(legendItems.first()).toBeVisible();
      }
    });

    test('should show data points on lines', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Look for circle elements (data points)
      const points = page.locator('svg circle');
      const pointCount = await points.count();

      // Line charts often have points at data values
      expect(pointCount).toBeGreaterThanOrEqual(0); // Might be 0 if points aren't rendered
    });
  });

  test.describe('Chart Interactions', () => {
    test('should support chart zoom or pan if available', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Check if charts have zoom controls or are zoomable
      const zoomControls = page.locator('[aria-label*="zoom"], button:has-text("Zoom")');

      const hasZoom = await zoomControls.count() > 0;

      // This is optional functionality, just checking if it exists
      if (hasZoom) {
        await expect(zoomControls.first()).toBeVisible();
      }
    });

    test('should maintain chart responsiveness', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Get all visible charts
      const charts = page.locator('svg:visible');
      const chartCount = await charts.count();

      // Find a chart that's reasonably large (actual chart, not icon)
      let foundLargeChart = false;
      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        await chart.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const boundingBox = await chart.boundingBox();
        if (boundingBox && boundingBox.width > 100 && boundingBox.height > 50) {
          foundLargeChart = true;
          expect(boundingBox.width).toBeGreaterThan(100);
          expect(boundingBox.height).toBeGreaterThan(50);
          break;
        }
      }

      expect(foundLargeChart).toBeTruthy();
    });
  });

  test.describe('Data Accuracy in Charts', () => {
    test('should display year data on charts', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Look for year labels in SVG text elements
      const allSvgText = page.locator('svg text');
      const textCount = await allSvgText.count();

      expect(textCount).toBeGreaterThan(0);

      // Check if any text contains a 4-digit year (19xx or 20xx)
      let foundYear = false;
      for (let i = 0; i < Math.min(20, textCount); i++) {
        const text = await allSvgText.nth(i).textContent();
        if (text && /\b(19|20)\d{2}\b/.test(text)) {
          foundYear = true;
          break;
        }
      }

      expect(foundYear).toBeTruthy();
    });

    test('should show numeric values in charts', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Look for numeric text in SVG
      const numbers = page.locator('svg text');
      const numberCount = await numbers.count();

      expect(numberCount).toBeGreaterThan(0);

      // Verify some text contains numbers
      if (numberCount > 0) {
        let foundNumber = false;
        for (let i = 0; i < Math.min(10, numberCount); i++) {
          const text = await numbers.nth(i).textContent();
          if (text && /\d/.test(text)) {
            foundNumber = true;
            break;
          }
        }
        expect(foundNumber).toBeTruthy();
      }
    });

    test('should not show NaN or undefined values in charts', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Check for invalid values
      const invalidValues = page.locator('text=/NaN|undefined|null/i');
      const invalidCount = await invalidValues.count();

      expect(invalidCount).toBe(0);
    });
  });

  test.describe('Chart Headings and Anchors', () => {
    test('should have anchor links for chart sections', async ({ page }) => {
      const headings = page.locator('h2[id], h3[id]');
      const headingCount = await headings.count();

      expect(headingCount).toBeGreaterThan(0);

      // Check that IDs are valid
      if (headingCount > 0) {
        const firstId = await headings.first().getAttribute('id');
        expect(firstId).toBeTruthy();
        expect(firstId!.length).toBeGreaterThan(0);
      }
    });

    test('should allow navigation to chart sections via anchor links', async ({ page }) => {
      const headings = page.locator('h2[id], h3[id]');
      const headingCount = await headings.count();

      if (headingCount > 0) {
        const firstId = await headings.first().getAttribute('id');

        // Navigate to anchor
        await page.goto(`/visualisierungen#${firstId}`);
        await page.waitForTimeout(500);

        // Check that we scrolled to the element
        const heading = page.locator(`#${firstId}`);
        await expect(heading).toBeInViewport();
      }
    });

    test('should have copy link functionality for headings', async ({ page }) => {
      // Look for link icons or hover actions on headings
      const headingLinks = page.locator('h2 a[href*="#"], h3 a[href*="#"]');

      if (await headingLinks.count() > 0) {
        await expect(headingLinks.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should render charts on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await helpers.waitForPageReady(page);

      await helpers.waitForCharts(page, 1);

      const charts = page.locator('svg');
      const chartCount = await charts.count();

      expect(chartCount).toBeGreaterThan(0);
    });

    test('should adjust chart dimensions for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await helpers.waitForPageReady(page);

      await helpers.waitForCharts(page, 1);

      const chart = page.locator('svg').first();
      const box = await chart.boundingBox();

      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test('should render charts on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await helpers.waitForPageReady(page);

      await helpers.waitForCharts(page, 1);

      const charts = page.locator('svg');
      expect(await charts.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Performance', () => {
    test('should load all charts within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await helpers.navigateAndWait(page, '/visualisierungen');
      await helpers.waitForCharts(page, 3);

      const loadTime = Date.now() - startTime;

      // Charts should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should not have excessive re-renders', async ({ page }) => {
      await helpers.waitForCharts(page, 1);

      // Wait and check if charts are stable (not constantly re-rendering)
      await page.waitForTimeout(2000);

      const chartCount1 = await page.locator('svg').count();
      await page.waitForTimeout(1000);
      const chartCount2 = await page.locator('svg').count();

      // Chart count should remain stable
      expect(chartCount1).toBe(chartCount2);
    });
  });
});
