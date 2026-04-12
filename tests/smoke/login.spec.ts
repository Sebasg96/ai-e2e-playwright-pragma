import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @smoke
 *
 * Smoke Tests — Login & Auth
 * Tier 0: Critical path, runs on every commit (<2 min)
 *
 * These tests verify the most essential behavior:
 * the user can authenticate into PRAGMA.
 */

test.describe('Login — Smoke', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
    });

    test('should display the login form @smoke', async ({ loginPage }) => {
        await test.step('Verify login form is rendered', async () => {
            await loginPage.expectLoginFormVisible();
        });
    });

    test('should login successfully with valid credentials @smoke', async ({
        page,
        loginPage,
    }) => {
        await test.step('Enter valid credentials and submit', async () => {
            await loginPage.loginAsUser(
                process.env.TEST_USER_EMAIL!,
                process.env.TEST_USER_PASSWORD!
            );
        });

        await test.step('Verify redirect to authenticated area', async () => {
            await expect(page).toHaveURL(/\/dashboard|\/home|\/strategy/);
        });
    });

    test('should show error with invalid credentials @smoke', async ({
        loginPage,
    }) => {
        await test.step('Submit invalid credentials', async () => {
            await loginPage.login('invalid@test.com', 'wrongpassword');
        });

        await test.step('Verify error message is shown', async () => {
            await loginPage.expectErrorMessage();
        });
    });
});
