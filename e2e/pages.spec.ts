import { expect, test } from "@playwright/test";
import _ from "lodash";
import * as helpers from './helpers';

test.describe("Page Navigation", () => {
  test("should navigate to all main pages from navigation", async ({ page }) => {
    test.slow();

    await page.goto("http://localhost:3000/");
    await helpers.waitForPageReady(page);

    // Visualizations page
    await page.click("text=Visualisierungen >> visible=true", { timeout: 15000, force: true });
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/visualisierungen");
    await expect(page).toHaveTitle(/.*Visualisierungen.*/);
    await page.goBack();
    await helpers.waitForPageReady(page);

    // Methodology page
    await page.click("text=Methodik >> visible=true", { timeout: 15000, force: true });
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/methodik");
    await expect(page).toHaveTitle(/.*Methodik.*/);
    await page.goBack();
    await helpers.waitForPageReady(page);

    // Statistics page
    await page.click("text=Offizielle Statistik >> visible=true", {
      timeout: 15000,
      force: true,
    });
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/statistik");
    await expect(page).toHaveTitle(/.*Statistik.*/);
    await page.goBack();
    await helpers.waitForPageReady(page);

    // Taser page
    await page.click("text=Tod mit Taser >> visible=true", {
      timeout: 15000,
      force: true,
    });
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/taser");
    await expect(page).toHaveTitle(/.*Taser.*/);
    await page.goBack();
    await helpers.waitForPageReady(page);

    // Contact page
    await page.click("text=Kontakt, Impressum und Datenschutz >> visible=true", {
      timeout: 15000,
    });
    await helpers.waitForPageReady(page);
    await expect(page).toHaveURL("http://localhost:3000/kontakt");
    await expect(page).toHaveTitle(/.*uns.*/);
    await page.goBack();
    await helpers.waitForPageReady(page);
  });

  test("should paginate through case chronology", async ({ page }) => {
    test.slow();

    await page.goto("http://localhost:3000/");
    await helpers.waitForPageReady(page);

    // Test pagination through all pages
    for (const i of _.range(2, 25)) {
      // Click pagination button with aria-label (use first() to handle duplicate pagination on mobile/desktop)
      await page
        .getByRole('button', { name: `Seite ${i}` })
        .first()
        .click({ timeout: 5000 });

      // Wait for URL to contain the page parameter
      await page.waitForURL(`**/*p=${i}*`, { timeout: 5000 });
      await expect(page).toHaveTitle(/.*Todesschüsse.*/);

      // Verify URL contains page parameter
      const url = page.url();
      expect(url).toContain(`p=${i}`);
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
    await page.goto("http://localhost:3000/");
    await helpers.waitForPageReady(page);

    // Find navigation buttons/links with specific text
    const navButtons = [
      { text: 'Visualisierungen', expectedPath: '/visualisierungen' },
      { text: 'Methodik', expectedPath: '/methodik' },
      { text: 'Offizielle Statistik', expectedPath: '/statistik' },
    ];

    // Test first 3 navigation buttons
    for (const { text, expectedPath } of navButtons) {
      // Find visible link by text within nav (component={Link} renders as <a> tag)
      // Filter for visible links only to handle mobile/desktop navigation
      const link = page.locator(`nav a:has-text("${text}")`).locator('visible=true').first();

      // Click link (force to bypass any overlays, and handles both mobile/desktop nav)
      await link.click({ force: true });
      await helpers.waitForPageReady(page);

      // Should navigate to expected page
      await expect(page).toHaveURL(new RegExp(expectedPath));

      // Go back for next iteration
      await page.goBack();
      await helpers.waitForPageReady(page);
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
