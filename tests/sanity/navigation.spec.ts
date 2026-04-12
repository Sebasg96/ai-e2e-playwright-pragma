import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @sanity
 *
 * Sanity Tests — Dashboard Navigation
 * Tier 1: Core features, runs on every PR (<10 min)
 *
 * These tests verify core navigation works correctly
 * after a user is authenticated.
 */

test.describe('Dashboard Navigation — Sanity', () => {
    test.beforeEach(async ({ dashboardPage }) => {
        await dashboardPage.navigate();
        await dashboardPage.expectDashboardLoaded();
    });

    test('should load dashboard with sidebar navigation @sanity', async ({
        dashboardPage,
        page,
    }) => {
        await test.step('Verify dashboard page URL', async () => {
            await expect(page).toHaveURL(/\/dashboard|\/home/);
        });

        await test.step('Verify dashboard is loaded with navigation', async () => {
            await dashboardPage.expectDashboardLoaded();
        });
    });

    test('should navigate to the Strategy module @sanity', async ({
        dashboardPage,
        page,
    }) => {
        await test.step('Click Strategy nav link', async () => {
            await dashboardPage.goToStrategy();
        });

        await test.step('Verify Strategy module URL', async () => {
            await expect(page).toHaveURL(/\/strategy/);
        });
    });

    test('should logout successfully @sanity', async ({
        dashboardPage,
    }) => {
        await test.step('Trigger logout via user menu', async () => {
            await dashboardPage.logout();
        });

        await test.step('Verify redirect to login page', async () => {
            await dashboardPage.expectLoggedOut();
        });
    });
});
