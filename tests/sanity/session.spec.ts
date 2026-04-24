import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @sanity
 *
 * Sanity Tests — Session Behavior
 * Tier 1: Core authenticated UX expectations.
 */
test.describe('Session Behavior — Sanity', () => {
    async function ensureAuthenticated(
        page: Parameters<Parameters<typeof test>[1]>[0]['page'],
        dashboardPage: Parameters<Parameters<typeof test>[1]>[0]['dashboardPage'],
        loginPage: Parameters<Parameters<typeof test>[1]>[0]['loginPage']
    ): Promise<void> {
        await dashboardPage.navigate();

        // Some local dev sessions expire between specs. If the app redirects
        // to login, recover with a fresh interactive login so session behavior
        // assertions still validate the authenticated experience.
        if (/\/login/.test(page.url())) {
            await loginPage.expectLoginFormVisible();
            await loginPage.loginAsUser(
                process.env.TEST_USER_EMAIL!,
                process.env.TEST_USER_PASSWORD!
            );
        }

        await dashboardPage.expectDashboardLoaded();
    }

    test('should persist authenticated state after reload @sanity', async ({
        dashboardPage,
        loginPage,
        page,
    }) => {
        await test.step('Navigate to dashboard and confirm loaded state', async () => {
            await ensureAuthenticated(page, dashboardPage, loginPage);
        });

        await test.step('Reload page', async () => {
            await page.reload();
        });

        await test.step('Verify user remains authenticated', async () => {
            await expect(page).toHaveURL(/\/dashboard|\/home|\/strategy|\/$/);
            await dashboardPage.expectDashboardLoaded();
        });
    });

    test('should keep strategy route accessible after refresh @sanity', async ({
        dashboardPage,
        loginPage,
        page,
    }) => {
        await test.step('Navigate to strategy module', async () => {
            await ensureAuthenticated(page, dashboardPage, loginPage);
            await dashboardPage.goToStrategy();
        });

        await test.step('Refresh strategy page', async () => {
            await page.reload();
        });

        await test.step('Verify strategy route stays available', async () => {
            await expect(page).toHaveURL(/\/strategy/);
        });
    });
});

