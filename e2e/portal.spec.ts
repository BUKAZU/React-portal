import { test, expect } from '@playwright/test';

/**
 * Smoke tests for the Bukazu Portal pages served by the Vite dev server.
<<<<<<< HEAD
 * These tests verify that each demo page responds and that the portal
 * container is present in the DOM.
 *
 * Note: The portal fetches live data from the Bukazu API; these tests only
 * validate basic page rendering, not loading states, error boundaries, or the
 * full data-driven UI.
=======
 * These tests verify that each demo page loads and the portal mounts correctly.
 *
 * Note: The portal fetches live data from the Bukazu API; these tests verify
 * the initial render (loading state) and error boundaries, not the full
 * data-driven UI.
>>>>>>> efe0c61e (feat: introduce Playwright for end-to-end testing)
 */

test.describe('Search page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the page heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Bukazu Test Portal');
  });

  test('mounts the portal container', async ({ page }) => {
<<<<<<< HEAD
    const portalWrapper = page.locator('.bu-smaller, .bu-large');
    await expect(portalWrapper.first()).toBeVisible();
=======
    await expect(page.locator('#bukazu-app')).toBeAttached();
>>>>>>> efe0c61e (feat: introduce Playwright for end-to-end testing)
  });
});

test.describe('Calendar page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar.html');
  });

  test('renders the page heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Bukazu Test Calendar');
  });

  test('mounts the portal container', async ({ page }) => {
<<<<<<< HEAD
    const portalWrapper = page.locator('.bu-smaller, .bu-large');
    await expect(portalWrapper.first()).toBeVisible();
=======
    await expect(page.locator('#bukazu-app')).toBeAttached();
>>>>>>> efe0c61e (feat: introduce Playwright for end-to-end testing)
  });
});

test.describe('Reviews page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews.html');
  });

  test('renders the page heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Bukazu Test Reviews');
  });

  test('mounts the portal container', async ({ page }) => {
<<<<<<< HEAD
    const portalWrapper = page.locator('.bu-smaller, .bu-large');
    await expect(portalWrapper.first()).toBeVisible();
=======
    await expect(page.locator('#bukazu-app')).toBeAttached();
>>>>>>> efe0c61e (feat: introduce Playwright for end-to-end testing)
  });
});

test.describe('Error handling', () => {
  test('invalid-calendar page renders the page heading', async ({ page }) => {
    await page.goto('/invalid-calendar.html');
    await expect(page.locator('h1')).toHaveText('Bukazu Test Calendar');
  });
});
