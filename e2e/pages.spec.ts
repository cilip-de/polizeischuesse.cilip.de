import { expect, test } from "@playwright/test";
import * as helpers from './helpers';

test.describe("Page Navigation", () => {
  test("should navigate to all main pages from navigation", async ({ page }) => {
    test.slow();

    const navPages = [
      { text: 'Visualisierungen', url: '/visualisierungen', title: /.*Visualisierungen.*/, inNav: true },
      { text: 'Methodik', url: '/methodik', title: /.*Methodik.*/, inNav: true },
      { text: 'Offizielle Statistik', url: '/statistik', title: /.*Statistik.*/, inNav: true },
      { text: 'Tod mit Taser', url: '/taser', title: /.*Taser.*/, inNav: true },
      { text: 'Kontakt, Impressum und Datenschutz', url: '/kontakt', title: /.*uns.*/, inNav: false },
    ];

    for (const { text, url, title, inNav } of navPages) {
      await page.goto("http://localhost:3000/");
      await helpers.waitForPageReady(page);

      const link = inNav
        ? page.locator(`nav a:has-text("${text}")`).locator('visible=true').first()
        : page.locator(`a:has-text("${text}")`).locator('visible=true').first();
      await link.click({ timeout: 15000 });
      await expect(page).toHaveURL(`http://localhost:3000${url}`, { timeout: 10000 });
      await expect(page).toHaveTitle(title);
    }
  });

  test("should paginate through case chronology", async ({ page }) => {
    test.slow();

    // Navigate directly to specific pages to test pagination works
    for (const i of [2, 5, 10, 15, 20, 24]) {
      await page.goto(`http://localhost:3000/?p=${i}`);
      await helpers.waitForPageReady(page);

      await expect(page).toHaveTitle(/.*Todesschüsse.*/);
      expect(page.url()).toContain(`p=${i}`);
    }
  });

  test("should load each main page without errors", async ({ page }) => {
    const pages = [
      { path: '/', title: /Todesschüsse/ },
      { path: '/visualisierungen', title: /Visualisierungen/ },
      { path: '/statistik', title: /Statistik/ },
      { path: '/methodik', title: /Methodik/ },
      { path: '/taser', title: /Taser/ },
      { path: '/kontakt', title: /uns/ },
    ];

    for (const { path, title } of pages) {
      await page.goto(`http://localhost:3000${path}`);
      await helpers.waitForPageReady(page);

      await expect(page).toHaveTitle(title);

      // Verify page has content
      const main = page.locator('main');
      await expect(main).toBeVisible();
    }
  });

  test("should maintain navigation consistency across pages", async ({ page }) => {
    const testPaths = ['/', '/visualisierungen', '/statistik'];

    for (const path of testPaths) {
      await page.goto(`http://localhost:3000${path}`);
      await helpers.waitForPageReady(page);

      // Each page should have navigation elements (either nav or back button)
      const hasNav = await page.locator('nav').count() > 0;
      const hasBackButton = await page.locator('button:has-text("zurück"), a:has-text("zurück"), a:has-text("Back")').count() > 0;

      // Either navigation or back button should exist
      expect(hasNav || hasBackButton).toBeTruthy();
    }
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await helpers.waitForPageReady(page);

    // Navigate to visualizations
    await page.goto("http://localhost:3000/visualisierungen");
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL(/visualisierungen/);

    // Go back
    await page.goBack();
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/");

    // Go forward
    await page.goForward();
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL(/visualisierungen/);
  });

  test("should display correct page titles", async ({ page }) => {
    const pages = [
      { path: '/', titlePattern: /polizei/i },
      { path: '/visualisierungen', titlePattern: /visualisierung/i },
      { path: '/statistik', titlePattern: /statistik/i },
      { path: '/methodik', titlePattern: /methodik/i },
    ];

    for (const { path, titlePattern } of pages) {
      await page.goto(`http://localhost:3000${path}`);
      await helpers.waitForPageReady(page);

      const title = await page.title();
      expect(title).toMatch(titlePattern);
      expect(title.length).toBeGreaterThan(5);
    }
  });

  test("should have working internal links", async ({ page }) => {
    const navButtons = [
      { text: 'Visualisierungen', expectedPath: '/visualisierungen' },
      { text: 'Methodik', expectedPath: '/methodik' },
      { text: 'Offizielle Statistik', expectedPath: '/statistik' },
    ];

    for (const { text, expectedPath } of navButtons) {
      await page.goto("http://localhost:3000/");
      await helpers.waitForPageReady(page);

      const link = page.locator(`nav a:has-text("${text}")`).locator('visible=true').first();
      await link.click({ timeout: 15000 });
      await expect(page).toHaveURL(new RegExp(expectedPath), { timeout: 10000 });
    }
  });

  test("should render responsive navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:3000/");
    await helpers.waitForPageReady(page);

    // Navigation should be present (might be hamburger menu)
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/nonexistent-page");

    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test("should load sitemap.xml", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/sitemap.xml");

    // Should return sitemap
    expect(response?.status()).toBe(200);

    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
  });

  test("should load robots.txt", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/robots.txt");

    // Should return robots file or 404 (both acceptable)
    expect([200, 404]).toContain(response?.status() || 404);
  });
});
