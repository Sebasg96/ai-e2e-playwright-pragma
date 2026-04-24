import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @smoke
 *
 * Smoke Tests — Protected Route Enforcement
 * Tier 0: Critical route guards should never regress.
 */
test.describe('Protected Routes — Smoke', () => {
    test('should redirect anonymous users from /dashboard to /login @smoke', async ({
        browser,
        baseURL,
    }) => {
        const appBaseUrl = baseURL ?? process.env.BASE_URL ?? 'http://localhost:3000';
        const context = await browser.newContext({ storageState: undefined });
        const page = await context.newPage();

        await test.step('Open dashboard without authentication', async () => {
            await page.goto(`${appBaseUrl}/dashboard`, {
                waitUntil: 'domcontentloaded',
            });
        });

        await test.step('Verify redirect to login', async () => {
            await expect(page).toHaveURL(/\/login/);
            await expect(page.getByTestId('auth-login-submit-button')).toBeVisible();
        });

        await context.close();
    });

    test('should redirect anonymous users from /strategy to /login @smoke', async ({
        browser,
        baseURL,
    }) => {
        const appBaseUrl = baseURL ?? process.env.BASE_URL ?? 'http://localhost:3000';
        const context = await browser.newContext({ storageState: undefined });
        const page = await context.newPage();

        await test.step('Open strategy module without authentication', async () => {
            await page.goto(`${appBaseUrl}/strategy`, {
                waitUntil: 'domcontentloaded',
            });
        });

        await test.step('Verify redirect to login', async () => {
            await expect(page).toHaveURL(/\/login/);
            await expect(page.getByTestId('auth-login-submit-button')).toBeVisible();
        });

        await context.close();
    });
});

