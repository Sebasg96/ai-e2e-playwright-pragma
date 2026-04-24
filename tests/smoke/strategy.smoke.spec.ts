import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('Strategy Module — Smoke', () => {
    test.beforeEach(async ({ page, dashboardPage }) => {
        // Authenticated view is assumed by the playwight setup (storageState)
        // We'll navigate to the base dashboard to start
        await dashboardPage.navigate();
    });

    test('Verify User can navigate to the Strategy Dashboard @smoke', async ({ dashboardPage, page }) => {
        await test.step('Click on the Strategy Module in the sidebar', async () => {
            await dashboardPage.goToStrategy();
        });

        await test.step('Wait for and verify the strategy dashboard page title', async () => {
            const pageTitle = page.getByTestId('strategy-page-title');
            await expect(pageTitle).toBeVisible();
        });

        await test.step('Verify the global progress indicator is visible', async () => {
            await expect(page.getByTestId('strategy-global-progress')).toBeVisible();
        });

        await test.step('Ensure the default Dashboard tab is active', async () => {
            await expect(page.getByTestId('strategy-tab-dashboard')).toBeVisible();
        });
    });

    test('Verify Key Result Creation Modal Functionality @smoke', async ({ dashboardPage, page }) => {
        await test.step('Navigate to strategy dashboard', async () => {
            await dashboardPage.goToStrategy();
        });

        await test.step('Click to expand an Objective', async () => {
            // Wait for objectives to load. We pick the first one's expand button.
            const expandBtn = page.getByTestId('strategy-objective-expand-btn').first();
            await expect(expandBtn).toBeVisible();
            await expandBtn.click();
        });

        await test.step('Click the New KR button inside the cascade', async () => {
            // The plan indicates strategy-add-objective-btn or strategy-cascade-add-kr
            // We use the one provided by the test IDs
            const addKrBtn = page.getByTestId('strategy-add-objective-btn').first();
            await addKrBtn.click({ force: true });
        });

        await test.step('Verify the modal opens and displays sections', async () => {
            const modal = page.getByTestId('kr-creator-form');
            await expect(modal).toBeVisible();

            await expect(page.getByTestId('kr-creator-direction-section')).toBeVisible();
            await expect(page.getByTestId('kr-creator-statement')).toBeVisible();
        });

        await test.step('Close the modal', async () => {
            await page.getByTestId('kr-creator-close').or(page.getByRole('button', { name: '×' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });
    });
});
