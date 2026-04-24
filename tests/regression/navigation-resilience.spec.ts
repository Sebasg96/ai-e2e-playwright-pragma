import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @regression
 *
 * Regression Tests — Navigation Resilience
 * Tier 2: Route transitions and menu states.
 */
test.describe('Navigation Resilience — Regression', () => {
    test.beforeEach(async ({ dashboardPage }) => {
        await dashboardPage.navigate();
        await dashboardPage.expectDashboardLoaded();
    });

    test('should support repeated dashboard <-> strategy transitions @regression', async ({
        dashboardPage,
        page,
    }) => {
        await test.step('Navigate from dashboard to strategy', async () => {
            await dashboardPage.goToStrategy();
            await expect(page).toHaveURL(/\/strategy/);
        });

        await test.step('Navigate back to dashboard/home', async () => {
            const dashboardLink = page.getByRole('link', { name: /Dashboard/i });
            if (await dashboardLink.isVisible()) {
                await dashboardLink.click();
            } else {
                await page.goto('/dashboard');
            }
            await expect(page).toHaveURL(/\/dashboard|\/home|\/$/);
        });

        await test.step('Navigate to strategy again without stale state', async () => {
            await dashboardPage.goToStrategy();
            await expect(page).toHaveURL(/\/strategy/);
        });
    });

    test('should render stable navigation controls after page reload @regression', async ({
        page,
    }) => {
        await test.step('Reload authenticated page', async () => {
            await page.reload({ waitUntil: 'domcontentloaded' });
        });

        await test.step('Verify at least one main navigation control remains visible', async () => {
            const sidebar = page.getByTestId('sidebar-nav');
            const toggleMenu = page.getByRole('button', { name: /Toggle Menu/i });
            const strategyLink = page.getByTestId('nav-strategy');

            await expect(sidebar.or(toggleMenu).or(strategyLink)).toBeVisible();
        });
    });
});

