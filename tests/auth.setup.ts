import { test as setup } from '@playwright/test';
import { env } from '../src/helpers/env.helper';
import { LoginPage } from '../src/pages/LoginPage';
import path from 'path';
import fs from 'fs';

/**
 * auth.setup.ts — Global authentication setup
 *
 * This runs ONCE before all tests via the 'setup' project in playwright.config.ts.
 * It logs in and saves the browser storage state so tests skip the login step.
 *
 * @see https://playwright.dev/docs/auth
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
    // Ensure the .auth directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const loginPage = new LoginPage(page);

    await setup.step('Navigate to login page', async () => {
        await loginPage.navigate();
        await loginPage.expectLoginFormVisible();
    });

    await setup.step('Login with test credentials', async () => {
        await loginPage.loginAsUser(
            env.testUserEmail,
            env.testUserPassword
        );
    });

    await setup.step('Save authentication state', async () => {
        await page.context().storageState({ path: authFile });
    });
});
