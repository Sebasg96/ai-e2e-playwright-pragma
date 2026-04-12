import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';

/**
 * Custom fixture type extending Playwright's base fixtures.
 * Provides pre-built page objects to each test.
 */
type PragmaFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
};

/**
 * Extended `test` with PRAGMA page objects pre-instantiated.
 *
 * @usage
 * ```ts
 * import { test, expect } from '@fixtures/base.fixture';
 *
 * test('login works', async ({ loginPage }) => {
 *   await loginPage.navigate();
 *   await loginPage.login('user@example.com', 'pass');
 * });
 * ```
 */
export const test = base.extend<PragmaFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
});

export { expect } from '@playwright/test';
