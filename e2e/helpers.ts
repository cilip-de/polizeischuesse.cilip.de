import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded and hydrated
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Wait for hydration — check for interactive elements
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
}

/**
 * Navigate to a page and wait for it to be ready
 */
export async function navigateAndWait(page: Page, path: string) {
  await page.goto(path);
  await waitForPageReady(page);
}

/**
 * Check if an element is visible on the page
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Wait for charts to be rendered (by checking for SVG elements)
 */
export async function waitForCharts(page: Page, minCharts: number = 1) {
  await page.waitForSelector('svg', { timeout: 10000 });
  const charts = await page.locator('svg').count();
  expect(charts).toBeGreaterThanOrEqual(minCharts);
}

/**
 * Get text content from an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector);
  return (await element.textContent()) || '';
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForURL('**/*', { waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * Fill form field and wait for any debounced updates
 */
export async function fillAndWait(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
  await page.waitForTimeout(500); // Wait for debounced updates
}

/**
 * Select option from dropdown and wait for updates
 */
export async function selectAndWait(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value);
  await page.waitForTimeout(300); // Wait for filter updates
}

/**
 * Open a SearchableSelect filter dropdown by its label (the combobox aria-label,
 * e.g. "Jahr", "Bundesland", "Ort", "Bewaffnung", "Alter") and wait for the
 * option list to render.
 */
export async function openFilterDropdown(page: Page, label: string) {
  await page.getByRole('combobox', { name: label }).click();
  // Wait for the Radix popover to open, the cmdk list to render, and the open
  // animation to settle — otherwise a click can land on stale coordinates and
  // dismiss the popover without selecting anything.
  await page
    .locator('[data-slot="popover-content"][data-state="open"]')
    .waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[cmdk-item]').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(300);
}

/**
 * Read the visible option labels of a currently open SearchableSelect dropdown.
 */
export async function getDropdownOptions(page: Page): Promise<string[]> {
  return page.locator('[cmdk-item]').allInnerTexts();
}

/**
 * Open a SearchableSelect filter and pick the first option whose text contains
 * `optionText`, then wait for the popover to close and the results to reload.
 */
export async function selectFilterOption(page: Page, label: string, optionText: string) {
  await openFilterDropdown(page, label);
  await selectOpenOption(page, page.locator(`[cmdk-item]:has-text("${optionText}")`).first());
}

/**
 * Open a SearchableSelect filter and pick the first available option, then wait
 * for the popover to close and the results to reload. Use when the concrete
 * value does not matter, only that a selection is applied.
 */
export async function selectFirstFilterOption(page: Page, label: string) {
  await openFilterDropdown(page, label);
  await selectOpenOption(page, page.locator('[cmdk-item]').first());
}

/**
 * Click an option in an already-open dropdown and wait for the filter to apply.
 * Selecting pushes a new URL via the router asynchronously (after the popover
 * closes), so we wait for the URL to change rather than for network idle — which
 * is already satisfied from page load and would resolve before the navigation.
 */
async function selectOpenOption(page: Page, option: Locator) {
  const urlBefore = page.url();
  await option.click();
  await page.waitForFunction((prev) => window.location.href !== prev, urlBefore, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Click the clear (X) control of a SearchableSelect filter by its label. The
 * control is a span with role="button" and aria-label "<label>: Auswahl
 * zurücksetzen", rendered only while the filter has a value.
 */
export async function clearFilter(page: Page, label: string) {
  await page.getByRole('button', { name: `${label}: Auswahl zurücksetzen` }).click();
}

/**
 * Get current URL parameters as an object
 */
export async function getUrlParams(page: Page): Promise<Record<string, string>> {
  const url = new URL(page.url());
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Check if URL contains specific query parameter
 */
export async function urlHasParam(page: Page, param: string, value?: string): Promise<boolean> {
  const url = new URL(page.url());
  const paramValue = url.searchParams.get(param);
  if (value === undefined) {
    return paramValue !== null;
  }
  return paramValue === value;
}

/**
 * Count elements matching a selector
 */
export async function countElements(page: Page, selector: string): Promise<number> {
  return await page.locator(selector).count();
}

/**
 * Scroll element into view
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(urlPattern);
}

/**
 * Check for console errors
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Check accessibility violations (basic check)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for basic accessibility requirements
  const hasMainLandmark = await page.locator('main').count() > 0;
  const hasH1 = await page.locator('h1').count() > 0;

  expect(hasMainLandmark, 'Page should have a main landmark').toBeTruthy();
  expect(hasH1, 'Page should have an h1 heading').toBeTruthy();
}

/**
 * Wait for table or list to be populated
 */
export async function waitForDataLoad(page: Page, minItems: number = 1) {
  // Wait for either table rows, list items, or card components (used for cases)
  // First wait for page to be ready
  await page.waitForLoadState('networkidle');

  // Scroll down to where cases are displayed (below filters and chart)
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(500);

  // Look for case cards - they have specific structure with Name and datePrint
  const selector = '[data-testid="case-card"]';
  await page.waitForSelector(selector, { timeout: 15000 });
  const count = await countElements(page, selector);
  expect(count).toBeGreaterThanOrEqual(minItems);
}

/**
 * Extract numbers from text content
 */
export function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Check if chart tooltip is visible and contains expected text
 */
export async function verifyChartTooltip(page: Page, expectedText: string) {
  const tooltip = page.locator('[role="tooltip"], .chart-tooltip, [data-testid="chart-tooltip"]').first();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText(expectedText);
}
