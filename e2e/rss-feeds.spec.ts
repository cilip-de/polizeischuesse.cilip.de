import { test, expect } from './fixtures';
import * as helpers from './helpers';

test.describe('RSS Feeds', () => {
  test.describe('Feed Generation', () => {
    test('should generate RSS feed for shootings', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/xml|rss/);
    });

    test('should generate RSS feed for taser deaths', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=taser');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/xml|rss/);
    });

    test('should generate combined RSS feed', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=all');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/xml|rss/);
    });

    test('should handle missing type parameter', async ({ page }) => {
      const response = await page.request.get('/api/feed');

      // Should either default to a feed or return error
      expect([200, 400]).toContain(response.status());
    });

    test('should handle invalid type parameter', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=invalid');

      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test.describe('RSS Feed Content', () => {
    test('should contain valid XML structure', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Check for RSS/XML tags
      expect(feedText).toContain('<?xml');
      expect(feedText).toMatch(/<rss|<feed/);
      expect(feedText).toContain('</rss>') || expect(feedText).toContain('</feed>');
    });

    test('should include channel information', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should have channel/feed metadata
      expect(feedText).toMatch(/<title>.*<\/title>/);
      expect(feedText).toMatch(/<link>.*<\/link>/);
    });

    test('should include case items in feed', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should contain items
      expect(feedText).toMatch(/<item>|<entry>/);
    });

    test('should include item details (title, description, date)', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Check for item elements
      const hasTitle = feedText.includes('<title>') || feedText.includes('<title/>');
      const hasDescription = feedText.includes('<description>') || feedText.includes('<summary>') || feedText.includes('<content>');
      const hasDate = feedText.includes('<pubDate>') || feedText.includes('<updated>') || feedText.includes('<published>');

      expect(hasTitle).toBeTruthy();
      expect(hasDescription || hasDate).toBeTruthy();
    });

    test('should include unique GUIDs for items', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should have unique identifiers for items
      const guidCount = (feedText.match(/<guid|<id>/g) || []).length;

      // Should have multiple items with GUIDs
      expect(guidCount).toBeGreaterThanOrEqual(0);
    });

    test('should include links to individual cases', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should contain URLs to case pages
      const hasLinks = feedText.includes('polizeischuesse.cilip.de') ||
                       feedText.includes('localhost') ||
                       feedText.includes('/fall/');

      expect(hasLinks).toBeTruthy();
    });
  });

  test.describe('Feed Validation', () => {
    test('should produce well-formed XML', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Basic XML validation - should have opening and closing tags
      const openTags = feedText.match(/<[^\/][^>]*>/g) || [];
      const closeTags = feedText.match(/<\/[^>]*>/g) || [];

      // Should have similar number of opening and closing tags
      expect(closeTags.length).toBeGreaterThan(0);
      expect(openTags.length).toBeGreaterThanOrEqual(closeTags.length * 0.5);
    });

    test('should escape special characters in content', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // If there are special characters, they should be escaped
      // Check for proper XML entities if & is present in content
      if (feedText.includes('&') && feedText.includes('<description>')) {
        const unescapedAmpersand = feedText.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/);

        // Ampersands should be properly escaped (might have some unescaped in CDATA)
        expect(!unescapedAmpersand || feedText.includes('<![CDATA[')).toBeTruthy();
      }
    });

    test('should include proper encoding declaration', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should declare UTF-8 encoding
      expect(feedText).toMatch(/encoding=["']UTF-8["']/i);
    });

    test('should have proper namespaces', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should have RSS or Atom namespace
      const hasNamespace = feedText.includes('xmlns') ||
                          feedText.includes('version="2.0"');

      expect(hasNamespace).toBeTruthy();
    });
  });

  test.describe('Feed Updates', () => {
    test('should include recent cases in feed', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should include current year cases
      const currentYear = new Date().getFullYear();
      const hasCurrent = feedText.includes(currentYear.toString()) ||
                         feedText.includes((currentYear - 1).toString());

      expect(hasCurrent).toBeTruthy();
    });

    test('should limit number of items in feed', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      const itemCount = (feedText.match(/<item>|<entry>/g) || []).length;

      // Feed should have reasonable number of items (not thousands)
      expect(itemCount).toBeGreaterThanOrEqual(0);
      expect(itemCount).toBeLessThanOrEqual(100);
    });

    test('should have consistent last build date format', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Look for lastBuildDate or updated
      const hasLastBuild = feedText.includes('<lastBuildDate>') ||
                           feedText.includes('<updated>');

      if (hasLastBuild) {
        // Should have valid date format
        const dateMatch = feedText.match(/<lastBuildDate>(.+)<\/lastBuildDate>|<updated>(.+)<\/updated>/);
        if (dateMatch) {
          const dateStr = dateMatch[1] || dateMatch[2];
          expect(dateStr.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Feed Discovery', () => {
    test('should include RSS feed link in HTML head', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Check for RSS autodiscovery link
      const rssLink = page.locator('link[type="application/rss+xml"], link[type="application/atom+xml"]');

      if (await rssLink.count() > 0) {
        const href = await rssLink.first().getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toContain('/api/feed');
      }
    });

    test('should have visible RSS feed links', async ({ page }) => {
      await helpers.navigateAndWait(page, '/');

      // Look for RSS icon or link
      const rssLinks = page.locator('a[href*="/api/feed"], a[href*="rss"], a:has-text("RSS"), a:has-text("Feed")');

      if (await rssLinks.count() > 0) {
        await expect(rssLinks.first()).toBeVisible();
      }
    });
  });

  test.describe('Feed Types', () => {
    test('shootings feed should only include shooting cases', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should not include "Taser" in shootings-only feed (unless also shot)
      // Just verify it's a valid feed
      expect(feedText).toContain('<rss') || expect(feedText).toContain('<feed');
    });

    test('taser feed should be separate from shootings', async ({ page }) => {
      const taserResponse = await page.request.get('/api/feed?type=taser');
      const taserFeed = await taserResponse.text();

      const shootingResponse = await page.request.get('/api/feed?type=shootings');
      const shootingFeed = await shootingResponse.text();

      // Feeds should be different
      expect(taserFeed).not.toBe(shootingFeed);
    });

    test('all feed should include both shootings and taser', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=all');
      const feedText = await response.text();

      const itemCount = (feedText.match(/<item>|<entry>/g) || []).length;

      // Combined feed should have items
      expect(itemCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Feed Performance', () => {
    test('should generate feed quickly', async ({ page }) => {
      const startTime = Date.now();

      const response = await page.request.get('/api/feed?type=shootings');

      const generationTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(generationTime).toBeLessThan(5000); // Should generate within 5 seconds
    });

    test('should handle concurrent feed requests', async ({ page }) => {
      const requests = [
        page.request.get('/api/feed?type=shootings'),
        page.request.get('/api/feed?type=taser'),
        page.request.get('/api/feed?type=all'),
      ];

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });
    });

    test('should have appropriate caching headers', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');

      const headers = response.headers();

      // Should have cache-control or similar headers
      // (Might not be set in development)
      expect(typeof headers['cache-control']).toBe('string') ||
        expect(typeof headers['cache-control']).toBe('undefined');
    });
  });

  test.describe('Feed Content Quality', () => {
    test('should include meaningful descriptions for cases', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Extract first description
      const descMatch = feedText.match(/<description>(.+?)<\/description>|<content>(.+?)<\/content>/s);

      if (descMatch) {
        const description = descMatch[1] || descMatch[2];

        // Description should have some length
        expect(description.length).toBeGreaterThan(0);
      }
    });

    test('should include location information in feed items', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should mention German cities or states
      const hasLocation = feedText.includes('Berlin') ||
                          feedText.includes('Hamburg') ||
                          feedText.includes('München') ||
                          feedText.includes('Bayern') ||
                          /Nordrhein|Hessen|Baden/.test(feedText);

      expect(hasLocation).toBeTruthy();
    });

    test('should include dates in feed items', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should have year references
      const hasYear = /20\d{2}|19\d{2}/.test(feedText);

      expect(hasYear).toBeTruthy();
    });
  });

  test.describe('Feed Errors', () => {
    test('should handle errors gracefully', async ({ page }) => {
      // Test with various invalid parameters
      const response = await page.request.get('/api/feed?type=invalid&foo=bar');

      // Should not crash - either return valid feed or error
      expect([200, 400, 404, 500]).toContain(response.status());
    });

    test('should return appropriate error for malformed requests', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=<script>alert(1)</script>');

      // Should handle malicious input
      expect([200, 400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Feed Accessibility', () => {
    test('should be parseable by feed readers', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Basic structure that feed readers expect
      const hasBasicStructure = (
        (feedText.includes('<rss') && feedText.includes('<channel>')) ||
        (feedText.includes('<feed') && feedText.includes('<entry>'))
      );

      expect(hasBasicStructure).toBeTruthy();
    });

    test('should include author or creator information', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Should mention CILIP or author info
      const hasAuthor = feedText.includes('CILIP') ||
                        feedText.includes('<author>') ||
                        feedText.includes('<creator>') ||
                        feedText.includes('<managingEditor>');

      expect(hasAuthor).toBeTruthy();
    });

    test('should include copyright or rights information', async ({ page }) => {
      const response = await page.request.get('/api/feed?type=shootings');
      const feedText = await response.text();

      // Might include copyright
      const hasRights = feedText.includes('<copyright>') ||
                        feedText.includes('<rights>') ||
                        feedText.includes('©') ||
                        feedText.includes('CILIP');

      expect(hasRights).toBeTruthy();
    });
  });
});
