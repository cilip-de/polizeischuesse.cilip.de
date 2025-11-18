import { test as base, Page, expect as baseExpect } from '@playwright/test';
import * as helpers from './helpers';

/**
 * Extended test fixture with common helpers and utilities
 */
export const test = base.extend<{
  pageWithoutErrors: Page;
}>({
  // Fixture for pages that should load without console errors
  pageWithoutErrors: async ({ page }, use) => {
    const errors = helpers.setupConsoleErrorTracking(page);
    await use(page);
    // Check for errors after test
    if (errors.length > 0) {
      console.warn('Console errors detected:', errors);
    }
  },
});

export const expect = baseExpect;

/**
 * Common test data
 */
export const testData = {
  // Common filter values
  filters: {
    years: ['2020', '2021', '2022', '2023'],
    states: [
      'Bayern',
      'Berlin',
      'Nordrhein-Westfalen',
      'Baden-Württemberg',
    ],
    weapons: [
      'Schusswaffe',
      'Messer',
      'Keine',
    ],
  },

  // Expected page titles
  pageTitles: {
    home: /polizeischüsse/i,
    visualizations: /visualisierungen/i,
    statistics: /statistik/i,
    methodology: /methodik/i,
    taser: /taser/i,
    contact: /kontakt/i,
  },

  // Expected paths
  paths: {
    home: '/',
    visualizations: '/visualisierungen',
    statistics: '/statistik',
    methodology: '/methodik',
    taser: '/taser',
    contact: '/kontakt',
  },

  // Chart types to verify
  chartTypes: {
    bar: 'bar chart',
    heatmap: 'heatmap',
    line: 'line chart',
  },

  // API endpoints
  api: {
    search: '/api/suche',
    contact: '/api/contact',
    feed: '/api/feed',
    og: '/api/og-case',
  },

  // Contact form test data
  contactForm: {
    valid: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
    },
    invalid: {
      email: 'invalid-email',
    },
  },

  // Common selectors
  selectors: {
    navigation: {
      header: 'header',
      nav: 'nav',
      mainContent: 'main',
    },
    search: {
      input: 'input[type="search"], input[placeholder*="such"], input[name="search"]',
      results: '[data-testid="search-results"], .search-results',
    },
    filters: {
      year: 'select[name="year"], [data-testid="year-filter"]',
      state: 'select[name="state"], [data-testid="state-filter"]',
      weapon: 'select[name="weapon"], [data-testid="weapon-filter"]',
    },
    charts: {
      svg: 'svg',
      tooltip: '[role="tooltip"], .chart-tooltip',
    },
    pagination: {
      next: 'a[href*="page"]:has-text("vor"), a[href*="page"]:has-text("next"), a:has-text("›")',
      prev: 'a[href*="page"]:has-text("zurück"), a[href*="page"]:has-text("previous"), a:has-text("‹")',
      pageNumber: 'a[href*="page"]',
    },
  },
};

/**
 * Common assertions
 */
export const assertions = {
  /**
   * Assert that a URL matches expected pattern
   */
  async expectUrlToMatch(page: Page, pattern: RegExp | string, expectFn: typeof expect) {
    const url = page.url();
    if (typeof pattern === 'string') {
      expectFn(url).toContain(pattern);
    } else {
      expectFn(url).toMatch(pattern);
    }
  },

  /**
   * Assert that page has no console errors
   */
  expectNoConsoleErrors(errors: string[], expectFn: typeof expect) {
    expectFn(errors).toHaveLength(0);
  },

  /**
   * Assert that element count is within range
   */
  async expectElementCountInRange(
    page: Page,
    selector: string,
    min: number,
    max: number,
    expectFn: typeof expect
  ) {
    const count = await helpers.countElements(page, selector);
    expectFn(count).toBeGreaterThanOrEqual(min);
    expectFn(count).toBeLessThanOrEqual(max);
  },
};
