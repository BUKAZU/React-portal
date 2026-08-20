import { test, expect, Page } from '@playwright/test';

/**
 * End-to-end coverage for the built `portal.website.js` bundle.
 *
 * The unit tests exercise `src/website.tsx` with React and the stylesheet
 * mocked out, so they cannot see the properties that only exist after Vite has
 * run: the IIFE wrapper, the global name, the injected stylesheet, and the fact
 * that React is bundled in. Those are what this spec covers.
 *
 * The fixtures are served by `scripts/serve-static.mjs` (see the second
 * `webServer` entry in playwright.config.ts), because the Vite dev server would
 * transform the bundle instead of serving it verbatim.
 */

const STATIC_BASE = 'http://localhost:4174';
const STYLE_ID = 'bukazu-portal-styles';

/** Keeps the tests independent of the live API. */
async function stubApi(page: Page): Promise<void> {
  await page.route('**/api.bukazu.com/**', (route) => route.abort());
}

test.describe('portal.website.js', () => {
  test('injects its stylesheet without a link tag', async ({ page }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website.html`);

    const styles = page.locator(`style#${STYLE_ID}`);
    await expect(styles).toHaveCount(1);

    // The page itself loads no stylesheet, so the portal CSS can only come
    // from the bundle.
    await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0);

    const cssLength = await styles.evaluate(
      (element) => element.textContent?.length ?? 0
    );
    expect(cssLength).toBeGreaterThan(5000);
  });

  test('stamps the injected style element with the package version', async ({
    page
  }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website.html`);

    const version = await page
      .locator(`style#${STYLE_ID}`)
      .getAttribute('data-bukazu-version');
    const exposedVersion = await page.evaluate(
      () =>
        (window as unknown as { BukazuPortal: { version: string } })
          .BukazuPortal.version
    );

    expect(version).toBe(exposedVersion);
  });

  test('the injected styles are applied by the browser', async ({ page }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website.html`);

    const hasPortalRules = await page.evaluate(() =>
      Array.from(document.styleSheets).some((sheet) => {
        try {
          return Array.from(sheet.cssRules).some((rule) =>
            rule.cssText.includes('#bukazu-app')
          );
        } catch {
          return false;
        }
      })
    );

    expect(hasPortalRules).toBe(true);
  });

  test('exposes init, mountPortal and version on the global', async ({
    page
  }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website.html`);

    const api = await page.evaluate(() => {
      const globalApi = (window as unknown as { BukazuPortal: object })
        .BukazuPortal;
      return Object.keys(globalApi).sort();
    });

    expect(api).toEqual(
      expect.arrayContaining(['init', 'mountPortal', 'version'])
    );
  });

  test('mounts the portal, so React is bundled in', async ({ page }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website.html`);

    // Rendering anything at all proves React and react-dom are inside the
    // bundle: the fixture loads no other script.
    await expect(page.locator('#bukazu-app > *')).not.toHaveCount(0);
  });

  test('mounts on an id-only host element', async ({ page }) => {
    await stubApi(page);
    await page.goto(`${STATIC_BASE}/e2e/fixtures/website-id-only.html`);

    await expect(page.locator('#bukazu-app > *')).not.toHaveCount(0);
  });

  test('loading the bundle twice injects one style and mounts once', async ({
    page
  }) => {
    await stubApi(page);
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto(`${STATIC_BASE}/e2e/fixtures/website-double.html`);

    await expect(page.locator(`style#${STYLE_ID}`)).toHaveCount(1);
    expect(
      consoleErrors.filter((error) => error.includes('createRoot'))
    ).toHaveLength(0);
  });

  test('reports errors to the Sentry DSN from the attribute', async ({
    page
  }) => {
    await stubApi(page);
    let envelopeSent = false;
    await page.route('**/*.ingest.sentry.io/**', (route) => {
      envelopeSent = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}'
      });
    });

    await page.goto(`${STATIC_BASE}/e2e/fixtures/website-sentry.html`);

    await expect.poll(() => envelopeSent, { timeout: 15000 }).toBe(true);
  });
});
